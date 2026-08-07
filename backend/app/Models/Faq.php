<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول faqs — معادل اینترفیس Faq در domain.ts */
class Faq extends Model
{
    protected $table = 'faqs';
    protected $guarded = [];

    protected $casts = [
            'sort_order' => 'integer',
            'is_active' => 'boolean',
    ];
}
