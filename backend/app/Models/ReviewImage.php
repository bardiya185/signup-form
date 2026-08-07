<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول review_images — معادل اینترفیس ReviewImage در domain.ts */
class ReviewImage extends Model
{
    protected $table = 'review_images';
    protected $guarded = [];

    protected $casts = [
            'review_id' => 'integer',
    ];
}
