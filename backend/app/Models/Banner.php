<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول banners — معادل اینترفیس Banner در domain.ts */
class Banner extends Model
{
    protected $table = 'banners';
    protected $guarded = [];

    protected $casts = [
            'sort_order' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
    ];
}
