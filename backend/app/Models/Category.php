<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول categories — معادل اینترفیس Category در domain.ts */
class Category extends Model
{
    protected $table = 'categories';
    protected $guarded = [];

    protected $casts = [
            'parent_id' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
    ];
}
