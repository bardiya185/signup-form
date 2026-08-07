<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول stock_movements — معادل اینترفیس StockMovement در domain.ts */
class StockMovement extends Model
{
    protected $table = 'stock_movements';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'product_variant_id' => 'integer',
            'old_stock' => 'integer',
            'new_stock' => 'integer',
            'delta' => 'integer',
            'changed_by' => 'integer',
    ];
}
