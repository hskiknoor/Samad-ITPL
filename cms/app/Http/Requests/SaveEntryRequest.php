<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->role, ['admin', 'editor'], true);
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['page', 'post', 'product'])],
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:180', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('entries')->ignore($this->route('entry'))],
            'status' => ['required', Rule::in(['draft', 'published', 'scheduled'])],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'body' => ['nullable', 'string', 'max:100000'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'media_id' => ['nullable', 'integer', 'exists:media,id'],
            'tags' => ['nullable', 'array', 'max:12'],
            'tags.*' => ['string', 'max:40'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'noindex' => ['required', 'boolean'],
            'published_at' => ['nullable', 'date', 'required_if:status,scheduled'],
            'price_cents' => ['required_if:type,product', 'integer', 'min:0', 'max:100000000'],
            'stock' => ['required_if:type,product', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
