<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Entry extends Model
{
    use HasFactory;

    protected $fillable = ['type', 'title', 'slug', 'status', 'excerpt', 'body', 'author_id', 'category_id', 'media_id', 'tags', 'seo_title', 'seo_description', 'noindex', 'published_at', 'price_cents', 'stock'];

    protected $appends = ['html', 'public_path', 'seo_score', 'is_public'];

    protected function casts(): array
    {
        return ['tags' => 'array', 'noindex' => 'boolean', 'published_at' => 'datetime', 'price_cents' => 'integer', 'stock' => 'integer'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(Revision::class);
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query->whereIn('status', ['published', 'scheduled'])->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function getHtmlAttribute(): string
    {
        return Str::markdown($this->body ?? '', ['html_input' => 'strip', 'allow_unsafe_links' => false]);
    }

    public function getPublicPathAttribute(): string
    {
        $prefix = match ($this->type) {
            'post' => '/journal/', 'product' => '/shop/', default => '/pages/'
        };

        return $prefix.$this->slug;
    }

    public function getIsPublicAttribute(): bool
    {
        return in_array($this->status, ['published', 'scheduled'], true) && $this->published_at !== null && $this->published_at->isPast();
    }

    public function getSeoScoreAttribute(): int
    {
        return (filled($this->seo_title) ? 25 : 0)
            + (mb_strlen($this->seo_description ?? '') >= 50 ? 25 : 0)
            + (mb_strlen($this->body ?? '') >= 150 ? 25 : 0)
            + (filled($this->excerpt) ? 25 : 0);
    }
}
