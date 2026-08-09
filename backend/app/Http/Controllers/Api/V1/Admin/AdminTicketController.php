<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Requests\TicketMessageRequest;
use App\Support\ApiException;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** تیکت‌های پشتیبانی در پنل ادمین — پورت بخش admin از ticket.service.ts */
class AdminTicketController
{
    public function index(Request $request): JsonResponse
    {
        $page = max(1, ApiResponder::intParam($request->query('page'), 1));
        $perPage = 15;
        $list = Dto::rows('tickets');
        if ($status = $request->query('status')) {
            $list = $list->where('status', $status);
        }
        if ($department = $request->query('department')) {
            $list = $list->where('department', $department);
        }
        $list = $list->sortByDesc('updated_at')->values();
        $items = $list->slice(($page - 1) * $perPage, $perPage)
            ->map(fn (object $t) => Dto::ticketDto($t))->values()->all();
        return ApiResponder::page($items, $list->count(), $page, $perPage);
    }

    private function findTicket(int $id): object
    {
        $ticket = Dto::find('tickets', $id);
        if (!$ticket) {
            throw ApiException::notFound('تیکت مورد نظر یافت نشد');
        }
        return $ticket;
    }

    public function show(int $id): JsonResponse
    {
        return ApiResponder::ok(Dto::ticketDto($this->findTicket($id)));
    }

    /** بستن تیکت (PUT) */
    public function close(int $id): JsonResponse
    {
        $this->findTicket($id);
        DB::table('tickets')->where('id', $id)->update(['status' => 'closed', 'updated_at' => Dto::now()]);
        Dto::flush();
        return ApiResponder::ok(Dto::ticketDto(Dto::find('tickets', $id)));
    }

    /** پاسخ ادمین — وضعیت تیکت «پاسخ داده شده» می‌شود */
    public function reply(TicketMessageRequest $request, int $id): JsonResponse
    {
        $ticket = $this->findTicket($id);
        if ($ticket->status === 'closed') {
            throw ApiException::unprocessable(['ticket' => ['این تیکت بسته شده است']]);
        }
        $admin = $request->attributes->get('gnk_user');
        DB::table('ticket_messages')->insert([
            'ticket_id' => $id,
            'user_id' => $admin->id,
            'body' => $request->validated()['body'],
            'attachments' => '[]',
            'is_admin' => 1,
            'created_at' => Dto::now(),
            'updated_at' => Dto::now(),
        ]);
        DB::table('tickets')->where('id', $id)->update(['status' => 'answered', 'updated_at' => Dto::now()]);
        Dto::flush();
        return ApiResponder::ok(Dto::ticketDto(Dto::find('tickets', $id)), 201);
    }
}
