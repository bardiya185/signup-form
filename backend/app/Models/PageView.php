<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول page_views — معادل اینترفیس PageView در domain.ts */
class PageView extends Model
{
    protected $table = 'page_views';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'user_id' => 'integer',
    ];
}
