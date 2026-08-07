<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/** جدول users — معادل اینترفیس User در domain.ts */
class User extends Model
{
    use SoftDeletes;

    protected $table = 'users';
    protected $guarded = [];

    protected $casts = [
            'birth_date' => 'date',
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
    ];
}
