<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/** جدول blog_posts — معادل اینترفیس BlogPost در domain.ts */
class BlogPost extends Model
{
    use SoftDeletes;

    protected $table = 'blog_posts';
    protected $guarded = [];

    protected $casts = [
            'author_id' => 'integer',
            'category_id' => 'integer',
            'published_at' => 'datetime',
            'view_count' => 'integer',
    ];
}
