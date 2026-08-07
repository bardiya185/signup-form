<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول تنظیمات سراسری (key/value) */
class Setting extends Model
{
    protected $table = 'settings';
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];
}
