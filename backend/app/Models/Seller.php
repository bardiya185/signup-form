<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول sellers — معادل اینترفیس Seller در domain.ts */
class Seller extends Model
{
    protected $table = 'sellers';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'province_id' => 'integer',
            'city_id' => 'integer',
            'commission_rate' => 'decimal:2',
            'rating' => 'decimal:1',
    ];
}
