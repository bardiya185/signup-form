<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول colors — معادل اینترفیس Color در domain.ts */
class Color extends Model
{
    protected $table = 'colors';
    protected $guarded = [];

}
