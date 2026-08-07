<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول cart_items — معادل اینترفیس CartItem در domain.ts */
class CartItem extends Model
{
    protected $table = 'cart_items';
    protected $guarded = [];

    protected $casts = [
            'cart_id' => 'integer',
            'product_variant_id' => 'integer',
            'quantity' => 'integer',
    ];
}
