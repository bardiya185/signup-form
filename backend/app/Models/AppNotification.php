<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول notifications — معادل اینترفیس AppNotification در domain.ts */
class AppNotification extends Model
{
    protected $table = 'notifications';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'data' => 'array',
            'read_at' => 'datetime',
    ];
}
