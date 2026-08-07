<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول guarantees — معادل اینترفیس Guarantee در domain.ts */
class Guarantee extends Model
{
    protected $table = 'guarantees';
    protected $guarded = [];

    protected $casts = [
            'months' => 'integer',
    ];
}
