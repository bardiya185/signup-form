<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول product_videos — معادل اینترفیس ProductVideo در domain.ts */
class ProductVideo extends Model
{
    protected $table = 'product_videos';
    protected $guarded = [];

    protected $casts = [
            'product_id' => 'integer',
    ];
}
