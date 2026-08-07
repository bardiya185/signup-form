<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول otp_codes — معادل اینترفیس OtpCode در domain.ts */
class OtpCode extends Model
{
    protected $table = 'otp_codes';
    protected $guarded = [];

    protected $casts = [
            'expired_at' => 'datetime',
            'used_at' => 'datetime',
    ];
}
