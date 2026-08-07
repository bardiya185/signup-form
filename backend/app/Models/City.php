<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول cities — معادل اینترفیس City در domain.ts */
class City extends Model
{
    protected $table = 'cities';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'province_id' => 'integer',
    ];
}
