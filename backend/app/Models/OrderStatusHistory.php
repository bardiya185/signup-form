<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول order_status_history — معادل اینترفیس OrderStatusHistory در domain.ts */
class OrderStatusHistory extends Model
{
    protected $table = 'order_status_history';
    protected $guarded = [];

    protected $casts = [
            'order_id' => 'integer',
            'changed_by' => 'integer',
    ];
}
