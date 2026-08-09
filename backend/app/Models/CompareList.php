<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompareList extends Model
{
    protected $table = 'compare_lists';

    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
