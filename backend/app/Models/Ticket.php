<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول tickets — معادل اینترفیس Ticket در domain.ts */
class Ticket extends Model
{
    protected $table = 'tickets';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'order_id' => 'integer',
    ];
}
