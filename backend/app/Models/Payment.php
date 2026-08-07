<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول payments — معادل اینترفیس Payment در domain.ts */
class Payment extends Model
{
    protected $table = 'payments';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'order_id' => 'integer',
            'amount' => 'integer',
            'gateway_response' => 'array',
            'paid_at' => 'datetime',
    ];
}
