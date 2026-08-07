<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول personal_access_tokens — معادل اینترفیس PersonalAccessToken در domain.ts */
class PersonalAccessToken extends Model
{
    protected $table = 'personal_access_tokens';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'user_id' => 'integer',
            'abilities' => 'array',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
    ];
}
