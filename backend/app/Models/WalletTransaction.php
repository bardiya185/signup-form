<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول wallet_transactions — معادل اینترفیس WalletTransaction در domain.ts */
class WalletTransaction extends Model
{
    protected $table = 'wallet_transactions';
    protected $guarded = [];

    protected $casts = [
            'wallet_id' => 'integer',
            'amount' => 'integer',
    ];
}
