<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول sliders — معادل اینترفیس Slider در domain.ts */
class Slider extends Model
{
    protected $table = 'sliders';
    protected $guarded = [];

    protected $casts = [
            'items' => 'array',
            'is_active' => 'boolean',
    ];
}
