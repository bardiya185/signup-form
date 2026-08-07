<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول special_offers — معادل اینترفیس SpecialOffer در domain.ts */
class SpecialOffer extends Model
{
    protected $table = 'special_offers';
    protected $guarded = [];

    protected $casts = [
            'product_variant_id' => 'integer',
            'discount_percentage' => 'integer',
            'discount_price' => 'integer',
            'stock' => 'integer',
            'sold_count' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
    ];
}
