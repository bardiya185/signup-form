<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول product_images — معادل اینترفیس ProductImage در domain.ts */
class ProductImage extends Model
{
    protected $table = 'product_images';
    protected $guarded = [];

    protected $casts = [
            'product_id' => 'integer',
            'sort_order' => 'integer',
            'is_primary' => 'boolean',
    ];
}
