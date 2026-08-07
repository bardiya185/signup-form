<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول attribute_values — معادل اینترفیس AttributeValue در domain.ts */
class AttributeValue extends Model
{
    protected $table = 'attribute_values';
    protected $guarded = [];

    protected $casts = [
            'attribute_id' => 'integer',
    ];
}
