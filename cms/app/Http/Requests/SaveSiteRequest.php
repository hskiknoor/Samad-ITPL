<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveSiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'tagline' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:320'],
            'hero_title' => ['required', 'string', 'max:180'],
            'hero_subtitle' => ['required', 'string', 'max:500'],
            'contact_email' => ['required', 'email', 'max:180'],
            'currency' => ['required', Rule::in(['INR', 'USD', 'EUR', 'GBP', 'AED'])],
            'accent' => ['required', 'regex:/^#[a-fA-F0-9]{6}$/'],
            'footer' => ['required', 'string', 'max:160'],
            'navigation' => ['required', 'array', 'min:1', 'max:10'],
            'navigation.*.label' => ['required', 'string', 'max:40'],
            'navigation.*.url' => ['required', 'string', 'max:240', 'regex:~^/(?!/)[a-zA-Z0-9/_\-]*$~'],
        ];
    }
}
