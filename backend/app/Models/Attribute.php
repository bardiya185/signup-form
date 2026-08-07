<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول attributes — معادل اینترفیس Attribute در domain.ts */
class Attribute extends Model
{
    protected $table = 'attributes';
    protected $guarded = [];

    protected $casts = [
            'filterable' => 'boolean',
    ];
}
