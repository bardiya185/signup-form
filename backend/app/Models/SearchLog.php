<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول search_logs — معادل اینترفیس SearchLog در domain.ts */
class SearchLog extends Model
{
    protected $table = 'search_logs';
    protected $guarded = [];
    public $timestamps = false;

    protected $casts = [
            'user_id' => 'integer',
            'results_count' => 'integer',
    ];
}
