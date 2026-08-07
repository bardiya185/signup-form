<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول brands — معادل اینترفیس Brand در domain.ts */
class Brand extends Model
{
    protected $table = 'brands';
    protected $guarded = [];

    protected $casts = [
            'is_active' => 'boolean',
    ];
}
