<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerSettlement extends Model
{
    protected $table = 'seller_settlements';

    protected $guarded = [];

    protected $casts = [
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
