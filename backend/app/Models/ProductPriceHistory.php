<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول product_price_history — معادل اینترفیس ProductPriceHistory در domain.ts */
class ProductPriceHistory extends Model
{
    protected $table = 'product_price_history';
    protected $guarded = [];

    protected $casts = [
            'product_variant_id' => 'integer',
            'old_price' => 'integer',
            'new_price' => 'integer',
    ];
}
