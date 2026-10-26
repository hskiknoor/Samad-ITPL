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
            'seo_keywords' => ['nullable', 'string', 'max:1000'],
            'canonical_url' => ['nullable', 'url:http,https', 'max:2048'],
            'blocks' => ['nullable', 'array', 'max:20'],
            'blocks.*' => ['array:type,heading,body,items,button_label,button_url'],
            'blocks.*.type' => ['required', 'in:text,features,faq,cta'],
            'blocks.*.heading' => ['nullable', 'string', 'max:180'],
            'blocks.*.body' => ['nullable', 'string', 'max:4000'],
            'blocks.*.items' => ['nullable', 'array', 'max:12'],
            'blocks.*.items.*' => ['array:title,text'],
            'blocks.*.items.*.title' => ['required', 'string', 'max:180'],
            'blocks.*.items.*.text' => ['required', 'string', 'max:2000'],
            'blocks.*.button_label' => ['nullable', 'string', 'max:60'],
            'blocks.*.button_url' => ['nullable', 'regex:~^/(?!/)[a-zA-Z0-9/_-]*$~'],
            'seo_title' => ['nullable', 'string', 'max:70'],
            'seo_description' => ['nullable', 'string', 'max:320'],
            'noindex' => ['required', 'boolean'],
            'published_at' => ['nullable', 'date', 'required_if:status,scheduled'],
            'price_cents' => ['required_if:type,product', 'integer', 'min:0', 'max:100000000'],
            'stock' => ['required_if:type,product', 'integer', 'min:0', 'max:1000000'],
        ];
    }
}
