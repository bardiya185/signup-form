<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول reviews — معادل اینترفیس Review در domain.ts */
class Review extends Model
{
    protected $table = 'reviews';
    protected $guarded = [];

    protected $casts = [
            'product_id' => 'integer',
            'user_id' => 'integer',
            'order_item_id' => 'integer',
            'rating' => 'integer',
            'pros' => 'array',
            'cons' => 'array',
            'is_buyer' => 'boolean',
            'likes_count' => 'integer',
            'dislikes_count' => 'integer',
    ];
}
