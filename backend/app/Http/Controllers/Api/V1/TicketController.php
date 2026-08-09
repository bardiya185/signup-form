<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\TicketCreateRequest;
use App\Http\Requests\TicketMessageRequest;
use App\Support\ApiException;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TicketController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = 10;

        $list = Dto::rows('tickets')->where('user_id', $user->id);
        if ($status = $request->query('status')) {
            $list = $list->where('status', $status);
        }
        $list = $list->sortByDesc('created_at')->values();
        $items = $list->slice(($page - 1) * $perPage, $perPage)->map(fn (object $t) => Dto::ticketDto($t, false))->values()->all();
        return ApiResponder::page($items, $list->count(), $page, $perPage);
    }

    public function store(TicketCreateRequest $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $input = $request->validated();
        $ticketId = DB::table('tickets')->insertGetId([
            'user_id' => $user->id,
            'order_id' => $input['order_id'] ?? null,
            'department' => $input['department'],
            'subject' => $input['subject'],
            'priority' => $input['priority'],
            'status' => 'open',
            'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        DB::table('ticket_messages')->insert([
            'ticket_id' => $ticketId, 'user_id' => $user->id,
            'body' => $input['message'], 'attachments' => '[]', 'is_admin' => 0,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        return ApiResponder::ok(Dto::ticketDto(Dto::find('tickets', $ticketId)), 201);
    }

    private function findOwn(Request $request, int $id): object
    {
        $user = $request->attributes->get('gnk_user');
        $ticket = Dto::rows('tickets')->first(fn (object $t) => (int) $t->id === $id && (int) $t->user_id === (int) $user->id);
        if (!$ticket) throw ApiException::notFound('تیکت مورد نظر یافت نشد');
        return $ticket;
    }

    public function show(Request $request, int $id): JsonResponse
    {
        return ApiResponder::ok(Dto::ticketDto($this->findOwn($request, $id)));
    }

    public function close(Request $request, int $id): JsonResponse
    {
        $ticket = $this->findOwn($request, $id);
        if ($ticket->status === 'closed') {
            throw ApiException::unprocessable(['ticket' => ['این تیکت قبلاً بسته شده است']]);
        }
        DB::table('tickets')->where('id', $id)->update(['status' => 'closed', 'updated_at' => Dto::now()]);
        Dto::flush();
        return ApiResponder::ok(Dto::ticketDto(Dto::find('tickets', $id)));
    }

    public function addMessage(TicketMessageRequest $request, int $id): JsonResponse
    {
        $ticket = $this->findOwn($request, $id);
        if ($ticket->status === 'closed') {
            throw ApiException::unprocessable(['ticket' => ['تیکت بسته شده است؛ لطفاً تیکت جدید ثبت کنید']]);
        }
        $user = $request->attributes->get('gnk_user');
        DB::table('ticket_messages')->insert([
            'ticket_id' => $id, 'user_id' => $user->id,
            'body' => $request->validated()['body'], 'attachments' => '[]', 'is_admin' => 0,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        // پاسخ کاربر ⇒ تیکت باز می‌ماند/می‌شود
        DB::table('tickets')->where('id', $id)->update(['status' => 'open', 'updated_at' => Dto::now()]);
        Dto::flush();
        return ApiResponder::ok(Dto::ticketDto(Dto::find('tickets', $id)), 201);
    }
}
