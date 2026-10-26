<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = ['name', 'path', 'mime', 'size', 'alt'];

    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return '/storage/'.$this->path;
    }
}
