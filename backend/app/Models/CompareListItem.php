<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompareListItem extends Model
{
    protected $table = 'compare_list_items';

    protected $guarded = [];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
