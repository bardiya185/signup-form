<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول pages — معادل اینترفیس Page در domain.ts */
class Page extends Model
{
    protected $table = 'pages';
    protected $guarded = [];

}
