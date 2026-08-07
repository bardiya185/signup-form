<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/** جدول products — معادل اینترفیس Product در domain.ts */
class Product extends Model
{
    use SoftDeletes;

    protected $table = 'products';
    protected $guarded = [];

    protected $casts = [
            'category_id' => 'integer',
            'brand_id' => 'integer',
            'seller_id' => 'integer',
            'is_featured' => 'boolean',
            'is_digital' => 'boolean',
            'weight' => 'integer',
            'dimensions' => 'array',
            'view_count' => 'integer',
    ];
}
