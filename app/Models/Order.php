<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'reference', 'name', 'email', 'address', 'items', 'total_cents', 'currency', 'status'];

    protected function casts(): array
    {
        return ['items' => 'array', 'total_cents' => 'integer'];
    }
}
