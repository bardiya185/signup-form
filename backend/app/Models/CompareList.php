<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول compare_lists — معادل اینترفیس CompareList در domain.ts */
class CompareList extends Model
{
    protected $table = 'compare_lists';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'category_id' => 'integer',
    ];
}
