<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function admin(): Response
    {
        return Inertia::render('Reports', ['reports' => Report::latest()->get(), 'customers' => User::where('role', 'customer')->get(['id', 'name'])]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate(['title' => ['required', 'string', 'max:180'], 'slug' => ['required', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'max:180', 'unique:reports,slug'], 'summary' => ['required', 'string', 'max:2000'], 'content' => ['nullable', 'string', 'max:20000'], 'status' => ['required', 'in:draft,published'], 'audience' => ['required', 'in:public,customer'], 'owner_id' => ['nullable', 'required_if:audience,customer', Rule::exists('users', 'id')->where('role', 'customer')], 'noindex' => ['required', 'boolean'], 'file' => ['required', 'file', 'mimes:pdf,csv,txt,json,xlsx', 'max:20480']]);
        $file = $data['file'];
        unset($data['file']);
        $data['owner_id'] = $data['audience'] === 'customer' ? $data['owner_id'] : null;
        Report::create([...$data, 'file_path' => $file->store('reports', 'local'), 'original_name' => $file->getClientOriginalName(), 'mime' => $file->getMimeType(), 'size' => $file->getSize(), 'published_at' => $data['status'] === 'published' ? now() : null]);

        return back()->with('success', 'Report saved with its access permissions.');
    }

    public function update(Request $request, Report $report): RedirectResponse
    {
        $data = $request->validate(['title' => ['sometimes', 'required', 'string', 'max:180'], 'slug' => ['sometimes', 'required', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'max:180', Rule::unique('reports', 'slug')->ignore($report->id)], 'summary' => ['sometimes', 'required', 'string', 'max:2000'], 'content' => ['nullable', 'string', 'max:20000'], 'status' => ['required', 'in:draft,published'], 'audience' => ['sometimes', 'required', 'in:public,customer'], 'owner_id' => ['nullable', Rule::exists('users', 'id')->where('role', 'customer')], 'noindex' => ['sometimes', 'boolean'], 'file' => ['nullable', 'file', 'mimes:pdf,csv,txt,json,xlsx', 'max:20480']]);
        $audience = $data['audience'] ?? $report->audience;
        $owner = array_key_exists('owner_id', $data) ? $data['owner_id'] : $report->owner_id;
        if ($audience === 'customer' && ! $owner) {
            throw ValidationException::withMessages(['owner_id' => 'Select the customer who may access this report.']);
        }
        $data['owner_id'] = $audience === 'customer' ? $owner : null;
        $data['published_at'] = $data['status'] === 'published' ? ($report->published_at ?? now()) : null;
        $oldPath = $report->getRawOriginal('file_path');
        if ($file = $request->file('file')) {
            $data = [...$data, 'file_path' => $file->store('reports', 'local'), 'original_name' => $file->getClientOriginalName(), 'mime' => $file->getMimeType(), 'size' => $file->getSize()];
        }
        unset($data['file']);
        $report->update($data);
        if ($file) {
            Storage::disk('local')->delete($oldPath);
        }

        return back()->with('success', 'Report updated.');
    }

    public function destroy(Report $report): RedirectResponse
    {
        Storage::disk('local')->delete($report->getRawOriginal('file_path'));
        $report->delete();

        return back()->with('success', 'Report deleted.');
    }

    public function adminDownload(Report $report): StreamedResponse
    {
        abort_unless(Storage::disk('local')->exists($report->getRawOriginal('file_path')), 404);

        return Storage::disk('local')->download($report->getRawOriginal('file_path'), $report->original_name, ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }

    public function index(Request $request): Response
    {
        abort_unless(Setting::enabled('reports'), 404);
        $reports = Report::published()->accessible($request->user())->latest()->get(['id', 'title', 'slug', 'summary', 'mime', 'size', 'audience', 'published_at']);

        return Inertia::render('Public/Reports', ['reports' => $reports, 'seo' => ['title' => 'Resources — '.Setting::site()['name'], 'description' => 'Public resources and reports available from '.Setting::site()['name'].'.', 'canonical' => url('/reports'), 'noindex' => (bool) $request->user()]]);
    }

    public function download(Request $request, string $slug): StreamedResponse
    {
        abort_unless(Setting::enabled('reports'), 404);
        $report = Report::published()->accessible($request->user())->where('slug', $slug)->firstOrFail();
        abort_unless(Storage::disk('local')->exists($report->getRawOriginal('file_path')), 404);

        return Storage::disk('local')->download($report->getRawOriginal('file_path'), $report->original_name, ['X-Content-Type-Options' => 'nosniff', 'X-Robots-Tag' => 'noindex, nofollow', 'Cache-Control' => 'private, no-store']);
    }
}
