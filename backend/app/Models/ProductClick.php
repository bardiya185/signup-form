<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول product_clicks — معادل اینترفیس ProductClick در domain.ts */
class ProductClick extends Model
{
    protected $table = 'product_clicks';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'product_id' => 'integer',
            'user_id' => 'integer',
    ];
}
