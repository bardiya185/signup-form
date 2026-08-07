<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول addresses — معادل اینترفیس Address در domain.ts */
class Address extends Model
{
    protected $table = 'addresses';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'province_id' => 'integer',
            'city_id' => 'integer',
            'lat' => 'decimal:7',
            'lng' => 'decimal:7',
            'is_default' => 'boolean',
    ];
}
