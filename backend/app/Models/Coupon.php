<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول coupons — معادل اینترفیس Coupon در domain.ts */
class Coupon extends Model
{
    protected $table = 'coupons';
    protected $guarded = [];

    protected $casts = [
            'value' => 'integer',
            'max_discount' => 'integer',
            'min_order_amount' => 'integer',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'per_user_limit' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'applicable_categories' => 'array',
            'applicable_products' => 'array',
    ];
}
