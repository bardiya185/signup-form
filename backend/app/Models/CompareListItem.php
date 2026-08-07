<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول compare_list_items — معادل اینترفیس CompareListItem در domain.ts */
class CompareListItem extends Model
{
    protected $table = 'compare_list_items';
    protected $guarded = [];

    protected $casts = [
            'compare_list_id' => 'integer',
            'product_id' => 'integer',
    ];
}
