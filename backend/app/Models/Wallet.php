<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول wallets — معادل اینترفیس Wallet در domain.ts */
class Wallet extends Model
{
    protected $table = 'wallets';
    protected $guarded = [];

    protected $casts = [
            'user_id' => 'integer',
            'balance' => 'integer',
    ];
}
