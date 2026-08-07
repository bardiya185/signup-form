<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول stock_alerts — معادل اینترفیس StockAlert در domain.ts */
class StockAlert extends Model
{
    protected $table = 'stock_alerts';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'user_id' => 'integer',
            'product_variant_id' => 'integer',
    ];
}
