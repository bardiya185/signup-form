<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول wishlists — معادل اینترفیس Wishlist در domain.ts */
class Wishlist extends Model
{
    protected $table = 'wishlists';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'product_id' => 'integer',
    ];
}
