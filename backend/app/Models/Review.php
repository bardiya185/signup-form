<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';

    protected $guarded = [];

    protected $casts = [
        'rating' => 'decimal:2',
        'pros' => 'array',
        'cons' => 'array',
        'is_buyer' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
