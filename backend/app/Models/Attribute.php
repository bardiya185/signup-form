<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attribute extends Model
{
    protected $table = 'attributes';

    protected $guarded = [];

    protected $casts = [
        'type' => 'boolean',
        'filterable' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
}
