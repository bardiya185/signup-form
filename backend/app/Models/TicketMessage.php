<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** جدول ticket_messages — معادل اینترفیس TicketMessage در domain.ts */
class TicketMessage extends Model
{
    protected $table = 'ticket_messages';
    protected $guarded = [];

    protected $casts = [
            'ticket_id' => 'integer',
            'user_id' => 'integer',
            'attachments' => 'array',
            'is_admin' => 'boolean',
    ];
}
