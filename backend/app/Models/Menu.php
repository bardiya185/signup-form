<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول menus — معادل اینترفیس Menu در domain.ts */
class Menu extends Model
{
    protected $table = 'menus';
    protected $guarded = [];

    protected $casts = [
            'items' => 'array',
            'is_active' => 'boolean',
    ];
}
