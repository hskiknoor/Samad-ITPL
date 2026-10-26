<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'slug', 'summary', 'content', 'status', 'audience', 'owner_id', 'file_path', 'original_name', 'mime', 'size', 'noindex', 'published_at'];

    protected $hidden = ['file_path'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'noindex' => 'boolean'];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->where('published_at', '<=', now());
    }

    public function scopeAccessible(Builder $query, ?User $user): Builder
    {
        return $query->where(function (Builder $query) use ($user) {
            $query->where('audience', 'public');
            if ($user?->role === 'customer') {
                $query->orWhere(fn (Builder $q) => $q->where('audience', 'customer')->where('owner_id', $user->id));
            }
        });
    }
}
