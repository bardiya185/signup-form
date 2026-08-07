<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول activity_logs — معادل اینترفیس ActivityLog در domain.ts */
class ActivityLog extends Model
{
    protected $table = 'activity_logs';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'user_id' => 'integer',
            'subject_id' => 'integer',
    ];
}
