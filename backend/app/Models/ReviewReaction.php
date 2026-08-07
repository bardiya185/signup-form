<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول review_reactions — معادل اینترفیس ReviewReaction در domain.ts */
class ReviewReaction extends Model
{
    protected $table = 'review_reactions';
    protected $guarded = [];

    protected $casts = [
            'review_id' => 'integer',
            'user_id' => 'integer',
    ];
}
