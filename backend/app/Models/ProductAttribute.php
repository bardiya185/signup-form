<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول product_attributes — معادل اینترفیس ProductAttribute در domain.ts */
class ProductAttribute extends Model
{
    protected $table = 'product_attributes';
    protected $guarded = [];

    protected $casts = [
            'product_id' => 'integer',
            'attribute_id' => 'integer',
            'attribute_value_id' => 'integer',
    ];
}
