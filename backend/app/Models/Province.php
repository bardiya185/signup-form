<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول provinces — معادل اینترفیس Province در domain.ts */
class Province extends Model
{
    protected $table = 'provinces';
    protected $guarded = [];
    public $timestamps = false;

}
