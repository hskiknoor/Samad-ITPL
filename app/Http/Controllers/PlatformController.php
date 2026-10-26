<?php

namespace App\Http\Controllers;

use App\Http\Middleware\HandleSiteRedirects;
use App\Models\Entry;
use App\Models\Media;
use App\Models\Redirect;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PlatformController extends Controller
{
    public function index(Request $request): Response
    {
        $tab = $request->validate(['tab' => ['nullable', 'in:modules,discovery,assistant,redirects']])['tab'] ?? 'modules';

        return Inertia::render('Platform', ['tab' => $tab, 'settings' => Setting::site(), 'assistant' => Setting::assistant(), 'keyConfigured' => filled(config('assistant.key')), 'redirects' => Redirect::latest()->get(), 'pages' => Entry::visible()->where('type', 'page')->get(['id', 'title']), 'media' => Media::where('mime', 'like', 'image/%')->get(['id', 'name'])]);
    }

    public function customers(): Response
    {
        return Inertia::render('Customers', ['customers' => User::where('role', 'customer')->withCount('orders')->latest()->get(['id', 'name', 'email', 'created_at'])]);
    }

    public function resetCustomer(Request $request, User $user): RedirectResponse
    {
        abort_unless($user->role === 'customer', 404);
        $data = $request->validate(['password' => ['required', 'confirmed', Password::min(12)->letters()->numbers()]]);
        $user->forceFill(['password' => $data['password'], 'remember_token' => Str::random(60)])->save();
        DB::table('sessions')->where('user_id', $user->id)->delete();

        return back()->with('success', 'Customer password reset. Share it securely with the customer.');
    }

    public function modules(Request $request): RedirectResponse
    {
        $data = $request->validate(['modules' => ['required', 'array:business,publishing,commerce,reports,assistant'], 'modules.business' => ['required', 'boolean'], 'modules.publishing' => ['required', 'boolean'], 'modules.commerce' => ['required', 'boolean'], 'modules.reports' => ['required', 'boolean'], 'modules.assistant' => ['required', 'boolean']]);
        Setting::updateOrCreate(['key' => 'site'], ['value' => array_replace(Setting::site(), $data)]);

        return back()->with('success', 'Modules updated. Existing content has been kept.');
    }

    public function discovery(Request $request): RedirectResponse
    {
        $data = $request->validate(['home_page_id' => ['nullable', 'integer', Rule::exists('entries', 'id')->where('type', 'page')], 'seo_keywords' => ['nullable', 'string', 'max:1000'], 'google_verification' => ['nullable', 'string', 'max:255'], 'bing_verification' => ['nullable', 'string', 'max:255'], 'robots_disallow' => ['present', 'array', 'max:30'], 'robots_disallow.*' => ['required', 'regex:~^/(?!/)[a-zA-Z0-9/_.*-]*$~', 'max:180'], 'social_image_id' => ['nullable', 'integer', 'exists:media,id']]);
        Setting::updateOrCreate(['key' => 'site'], ['value' => array_replace(Setting::site(), $data)]);

        return back()->with('success', 'Search and discovery settings saved.');
    }

    public function assistant(Request $request): RedirectResponse
    {
        $data = $request->validate(['provider' => ['required', 'in:disabled,openai,anthropic'], 'model' => ['nullable', 'required_unless:provider,disabled', 'string', 'max:100'], 'welcome' => ['required', 'string', 'max:250'], 'instructions' => ['required', 'string', 'max:3000']]);
        Setting::updateOrCreate(['key' => 'assistant'], ['value' => $data]);

        return back()->with('success', 'Assistant settings saved. Search mode works while the AI provider is unconfigured.');
    }

    public function redirect(Request $request): RedirectResponse
    {
        $data = $request->validate(['from_path' => ['required', 'regex:~^/(?!/)[a-zA-Z0-9/_-]+$~', 'max:240', 'unique:redirects,from_path'], 'to_path' => ['required', 'regex:~^/(?!/)[a-zA-Z0-9/_-]*$~', 'max:240'], 'status' => ['required', 'in:301,302']]);
        if (HandleSiteRedirects::reserved($data['from_path']) || HandleSiteRedirects::reserved($data['to_path'])) {
            throw ValidationException::withMessages(['from_path' => 'Account, admin, checkout, and system routes cannot be redirected here.']);
        }
        $destination = $data['to_path'];
        $seen = [$data['from_path']];
        for ($i = 0; $i < 30; $i++) {
            if (in_array($destination, $seen, true)) {
                throw ValidationException::withMessages(['to_path' => 'This would create a redirect loop.']);
            }
            $seen[] = $destination;
            $next = Redirect::where('from_path', $destination)->value('to_path');
            if (! $next) {
                break;
            }
            $destination = $next;
        }
        Redirect::create($data);

        return back()->with('success', 'Redirect created.');
    }

    public function deleteRedirect(Redirect $redirect): RedirectResponse
    {
        $redirect->delete();

        return back()->with('success', 'Redirect removed.');
    }
}
