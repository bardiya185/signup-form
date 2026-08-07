<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول order_items — معادل اینترفیس OrderItem در domain.ts */
class OrderItem extends Model
{
    protected $table = 'order_items';
    protected $guarded = [];

    protected $casts = [
            'order_id' => 'integer',
            'product_variant_id' => 'integer',
            'variant_info' => 'array',
            'quantity' => 'integer',
            'unit_price' => 'integer',
            'total_price' => 'integer',
    ];
}
