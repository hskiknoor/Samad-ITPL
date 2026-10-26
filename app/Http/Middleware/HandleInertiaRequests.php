<?php

namespace App\Http\Middleware;

use App\Models\Media;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'site' => fn () => [...Setting::site(), 'social_image_url' => (($image = Media::find(Setting::site()['social_image_id'])) ? url($image->url) : null)],
            'assistantWelcome' => fn () => Setting::assistant()['welcome'],
            'auth' => fn () => ['user' => $request->user()?->only('id', 'name', 'email', 'role')],
            'flash' => fn () => ['success' => $request->session()->get('success')],
            'cartCount' => fn () => array_sum($request->session()->get('cart', [])),
        ];
    }
}
