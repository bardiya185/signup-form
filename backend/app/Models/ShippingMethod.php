<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول shipping_methods — معادل اینترفیس ShippingMethod در domain.ts */
class ShippingMethod extends Model
{
    protected $table = 'shipping_methods';
    protected $guarded = [];

    protected $casts = [
            'cost' => 'integer',
            'estimated_days' => 'integer',
            'is_active' => 'boolean',
    ];
}
