<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveSiteRequest;
use App\Models\Category;
use App\Models\Entry;
use App\Models\Media;
use App\Models\Order;
use App\Models\Setting;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        $published = Entry::visible()->get();
        $activity = collect(range(6, 0))->map(function (int $day) {
            $date = now()->subDays($day);

            return ['label' => $date->format('D'), 'count' => Entry::whereDate('created_at', $date)->count()];
        });

        return Inertia::render('Dashboard', [
            'stats' => ['content' => Entry::count(), 'published' => $published->count(), 'drafts' => Entry::where('status', 'draft')->count(), 'media' => Media::count(), 'seo' => (int) round($published->avg('seo_score') ?? 0), 'orders' => Order::where('status', 'new')->count()],
            'recent' => Entry::with('author:id,name', 'category', 'media')->latest('updated_at')->limit(5)->get(),
            'scheduled' => Entry::whereIn('status', ['scheduled', 'published'])->where('published_at', '>', now())->orderBy('published_at')->limit(3)->get(),
            'activity' => $activity, 'date' => now()->format('l, F j, Y'),
        ]);
    }

    public function media(): Response
    {
        return Inertia::render('Media', ['media' => Media::latest()->get()]);
    }

    public function upload(Request $request): RedirectResponse
    {
        $data = $request->validate(['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,gif,avif,pdf', 'max:10240'], 'alt' => ['nullable', 'string', 'max:255']]);
        $file = $data['file'];
        $path = $file->store('library', 'public');
        Media::create(['name' => Str::limit($file->getClientOriginalName(), 200, ''), 'path' => $path, 'mime' => $file->getMimeType(), 'size' => $file->getSize(), 'alt' => $data['alt'] ?? '']);

        return back()->with('success', 'File uploaded to your library.');
    }

    public function updateMedia(Request $request, Media $media): RedirectResponse
    {
        $media->update($request->validate(['alt' => ['required', 'string', 'max:255']]));

        return back()->with('success', 'Alt text saved.');
    }

    public function deleteMedia(Media $media): RedirectResponse
    {
        if (Entry::where('media_id', $media->id)->exists()) {
            throw ValidationException::withMessages(['media' => 'Remove this file from its content before deleting it.']);
        }
        Storage::disk('public')->delete($media->path);
        $media->delete();

        return back()->with('success', 'File deleted.');
    }

    public function categories(): Response
    {
        return Inertia::render('Categories', ['categories' => Category::withCount('entries')->orderBy('name')->get()]);
    }

    public function saveCategory(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:80'], 'slug' => ['required', 'string', 'max:100', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:categories,slug']]);
        Category::create($data);

        return back()->with('success', 'Category created.');
    }

    public function deleteCategory(Category $category): RedirectResponse
    {
        $category->delete();

        return back()->with('success', 'Category deleted. Its content has been kept.');
    }

    public function settings(): Response
    {
        return Inertia::render('Settings', ['settings' => Setting::site()]);
    }

    public function saveSettings(SaveSiteRequest $request): RedirectResponse
    {
        $settings = array_replace(Setting::site(), $request->validated());
        if ($settings['currency'] !== Setting::site()['currency'] && Entry::where('type', 'product')->exists()) {
            throw ValidationException::withMessages(['currency' => 'Remove or migrate existing products before changing the catalog currency. Prices are not automatically converted.']);
        }
        Setting::updateOrCreate(['key' => 'site'], ['value' => $settings]);

        return back()->with('success', 'Your site settings have been updated.');
    }

    public function seo(): Response
    {
        return Inertia::render('Seo', ['entries' => Entry::with('media')->latest('updated_at')->get()]);
    }

    public function users(): Response
    {
        return Inertia::render('Team', ['users' => User::whereIn('role', ['admin', 'editor'])->orderBy('name')->get(['id', 'name', 'email', 'role', 'created_at'])]);
    }

    public function addUser(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:80'], 'email' => ['required', 'email', 'max:180', 'unique:users,email'], 'role' => ['required', Rule::in(['admin', 'editor'])], 'password' => ['required', Password::min(12)->letters()->numbers()]]);
        User::create($data);

        return back()->with('success', 'Team member created. Share their credentials securely.');
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['role' => ['required', Rule::in(['admin', 'editor'])], 'password' => ['nullable', Password::min(12)->letters()->numbers()]]);
        if ($user->id === $request->user()->id && $data['role'] !== 'admin') {
            throw ValidationException::withMessages(['role' => 'You cannot remove your own administrator access.']);
        }
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);

        return back()->with('success', 'Team member updated.');
    }

    public function orders(): Response
    {
        return Inertia::render('Orders', ['orders' => Order::latest()->paginate(15)]);
    }

    public function updateOrder(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['processing', 'completed', 'cancelled'])]]);
        DB::transaction(function () use ($order, $data) {
            $locked = Order::lockForUpdate()->findOrFail($order->id);
            if (in_array($locked->status, ['completed', 'cancelled'], true)) {
                throw ValidationException::withMessages(['status' => 'Completed and cancelled orders cannot be changed.']);
            }
            if ($data['status'] === 'cancelled') {
                foreach ($locked->items as $item) {
                    Entry::whereKey($item['entry_id'])->increment('stock', $item['quantity']);
                }
            }
            $locked->update($data);
        });

        return back()->with('success', 'Order updated.');
    }

    public function inbox(): Response
    {
        return Inertia::render('Inbox', ['submissions' => Submission::latest()->paginate(15)]);
    }

    public function updateSubmission(Request $request, Submission $submission): RedirectResponse
    {
        $submission->update($request->validate(['status' => ['required', Rule::in(['unread', 'read', 'archived'])]]));

        return back()->with('success', 'Message updated.');
    }
}
