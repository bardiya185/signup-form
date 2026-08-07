<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $table = 'push_subscriptions';

    protected $guarded = [];

    protected $casts = [
        'keys' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
