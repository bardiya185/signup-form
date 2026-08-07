<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول product_questions — معادل اینترفیس ProductQuestion در domain.ts */
class ProductQuestion extends Model
{
    protected $table = 'product_questions';
    protected $guarded = [];

    protected $casts = [
            'product_id' => 'integer',
            'user_id' => 'integer',
            'answered_by' => 'integer',
            'answered_at' => 'datetime',
    ];
}
