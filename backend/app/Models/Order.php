<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/** جدول orders — معادل اینترفیس Order در domain.ts */
class Order extends Model
{
    use SoftDeletes;

    protected $table = 'orders';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'address_id' => 'integer',
            'subtotal' => 'integer',
            'shipping_cost' => 'integer',
            'tax_amount' => 'integer',
            'discount_amount' => 'integer',
            'total_amount' => 'integer',
            'coupon_id' => 'integer',
            'coupon_discount' => 'integer',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
            'cancelled_at' => 'datetime',
    ];
}
