<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول carts — معادل اینترفیس Cart در domain.ts */
class Cart extends Model
{
    protected $table = 'carts';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'coupon_id' => 'integer',
    ];
}
