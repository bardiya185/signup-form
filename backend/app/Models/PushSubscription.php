<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول push_subscriptions — معادل اینترفیس PushSubscription در domain.ts */
class PushSubscription extends Model
{
    protected $table = 'push_subscriptions';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'keys' => 'array',
    ];
}
