<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول seller_settlements — معادل اینترفیس SellerSettlement در domain.ts */
class SellerSettlement extends Model
{
    protected $table = 'seller_settlements';
    protected $guarded = [];

    protected $casts = [
            'seller_id' => 'integer',
            'amount' => 'integer',
            'paid_at' => 'datetime',
    ];
}
