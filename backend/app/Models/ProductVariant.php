<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول product_variants — معادل اینترفیس ProductVariant در domain.ts */
class ProductVariant extends Model
{
    protected $table = 'product_variants';
    protected $guarded = [];

    protected $casts = [
            'product_id' => 'integer',
            'price' => 'integer',
            'sale_price' => 'integer',
            'stock' => 'integer',
            'max_per_order' => 'integer',
            'color_id' => 'integer',
            'size_id' => 'integer',
            'guarantee_id' => 'integer',
            'is_active' => 'boolean',
    ];
}
