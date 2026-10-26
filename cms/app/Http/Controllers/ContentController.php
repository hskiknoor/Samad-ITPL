<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveEntryRequest;
use App\Models\Category;
use App\Models\Entry;
use App\Models\Media;
use App\Models\Revision;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate(['type' => ['nullable', 'in:page,post,product'], 'status' => ['nullable', 'in:draft,published,scheduled'], 'q' => ['nullable', 'string', 'max:100']]);
        $query = Entry::with('author:id,name', 'category', 'media');
        foreach (['type', 'status'] as $field) {
            $query->when($filters[$field] ?? null, fn ($query, $value) => $query->where($field, $value));
        }
        $query->when($filters['q'] ?? null, fn ($query, $value) => $query->where('title', 'like', '%'.$value.'%'));

        return Inertia::render('Content', ['entries' => $query->latest('updated_at')->paginate(12)->withQueryString(), 'filters' => $filters, 'counts' => Entry::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status')]);
    }

    public function create(Request $request): Response
    {
        $type = $request->validate(['type' => ['nullable', 'in:page,post,product']])['type'] ?? 'post';

        return Inertia::render('Editor', ['entry' => null, 'type' => $type, 'categories' => Category::orderBy('name')->get(), 'media' => Media::latest()->get(), 'revisions' => []]);
    }

    public function edit(Entry $entry): Response
    {
        return Inertia::render('Editor', ['entry' => $entry->load('media'), 'type' => $entry->type, 'categories' => Category::orderBy('name')->get(), 'media' => Media::latest()->get(), 'revisions' => $entry->revisions()->latest()->limit(10)->get(['id', 'created_at'])]);
    }

    public function store(SaveEntryRequest $request): RedirectResponse
    {
        $data = $this->data($request);
        $entry = Entry::create([...$data, 'author_id' => $request->user()->id]);

        return redirect()->route('admin.content.edit', $entry)->with('success', 'Your '.$entry->type.' has been created.');
    }

    public function update(SaveEntryRequest $request, Entry $entry): RedirectResponse
    {
        $data = $this->data($request);
        abort_unless($data['type'] === $entry->type, 422, 'Content type cannot be changed.');
        DB::transaction(function () use ($entry, $request, $data) {
            $entry->revisions()->create(['user_id' => $request->user()->id, 'snapshot' => $entry->only($entry->getFillable())]);
            $entry->update($data);
        });

        return back()->with('success', 'Changes saved.');
    }

    public function destroy(Entry $entry): RedirectResponse
    {
        $entry->delete();

        return redirect()->route('admin.content.index')->with('success', 'Content deleted.');
    }

    public function restore(Request $request, Entry $entry, Revision $revision): RedirectResponse
    {
        abort_unless($revision->entry_id === $entry->id, 404);
        DB::transaction(function () use ($entry, $revision, $request) {
            $entry->revisions()->create(['user_id' => $request->user()->id, 'snapshot' => $entry->only($entry->getFillable())]);
            $snapshot = $revision->snapshot;
            unset($snapshot['author_id'], $snapshot['type']);
            $snapshot['status'] = 'draft';
            $snapshot['published_at'] = null;
            if (Entry::where('slug', $snapshot['slug'])->where('id', '!=', $entry->id)->exists()) {
                $snapshot['slug'] = $entry->slug;
            }
            if (! Category::whereKey($snapshot['category_id'] ?? null)->exists()) {
                $snapshot['category_id'] = null;
            }
            if (! Media::whereKey($snapshot['media_id'] ?? null)->exists()) {
                $snapshot['media_id'] = null;
            }
            $entry->update($snapshot);
        });

        return back()->with('success', 'Revision restored as a draft. Review it before publishing.');
    }

    private function data(SaveEntryRequest $request): array
    {
        $data = $request->validated();
        $data['tags'] = array_values(array_unique($data['tags'] ?? []));
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return $data;
    }
}
