<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\AddressRequest;
use App\Support\ApiException;
use App\Support\ApiResponder;
use App\Support\Dto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $items = Dto::rows('addresses')->where('user_id', $user->id)
            ->map(fn (object $a) => Dto::addressDto($a))->values()->all();
        return ApiResponder::ok($items);
    }

    private function assertGeo(array $input): void
    {
        $city = Dto::rows('cities')->first(fn (object $c) => (int) $c->id === (int) $input['city_id']);
        if (!$city || (int) $city->province_id !== (int) $input['province_id']) {
            throw ApiException::unprocessable(['city_id' => ['شهر انتخاب شده با استان هم‌خوانی ندارد']]);
        }
    }

    public function store(AddressRequest $request): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $input = $request->validated();
        $this->assertGeo($input);
        $isDefault = !empty($input['is_default']) || Dto::rows('addresses')->where('user_id', $user->id)->isEmpty();
        if ($isDefault) {
            DB::table('addresses')->where('user_id', $user->id)->update(['is_default' => 0]);
        }
        $id = DB::table('addresses')->insertGetId([
            'user_id' => $user->id, 'title' => $input['title'],
            'province_id' => $input['province_id'], 'city_id' => $input['city_id'],
            'full_address' => $input['full_address'], 'postal_code' => $input['postal_code'],
            'lat' => $input['lat'] ?? null, 'lng' => $input['lng'] ?? null,
            'receiver_name' => $input['receiver_name'], 'receiver_phone' => $input['receiver_phone'],
            'is_default' => $isDefault ? 1 : 0,
            'created_at' => Dto::now(), 'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        return ApiResponder::ok(Dto::addressDto(Dto::find('addresses', $id)), 201);
    }

    public function update(AddressRequest $request, int $id): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $address = Dto::rows('addresses')->first(fn (object $a) => (int) $a->id === $id && (int) $a->user_id === (int) $user->id);
        if (!$address) throw ApiException::notFound('آدرس مورد نظر یافت نشد');
        $input = $request->validated();
        $this->assertGeo($input);
        if (!empty($input['is_default'])) {
            DB::table('addresses')->where('user_id', $user->id)->update(['is_default' => 0]);
        }
        DB::table('addresses')->where('id', $id)->update([
            'title' => $input['title'],
            'province_id' => $input['province_id'], 'city_id' => $input['city_id'],
            'full_address' => $input['full_address'], 'postal_code' => $input['postal_code'],
            'lat' => $input['lat'] ?? null, 'lng' => $input['lng'] ?? null,
            'receiver_name' => $input['receiver_name'], 'receiver_phone' => $input['receiver_phone'],
            'is_default' => !empty($input['is_default']) ? 1 : $address->is_default,
            'updated_at' => Dto::now(),
        ]);
        Dto::flush();
        return ApiResponder::ok(Dto::addressDto(Dto::find('addresses', $id)));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $address = Dto::rows('addresses')->first(fn (object $a) => (int) $a->id === $id && (int) $a->user_id === (int) $user->id);
        if (!$address) throw ApiException::notFound('آدرس مورد نظر یافت نشد');
        DB::table('addresses')->where('id', $id)->delete();
        Dto::flush();
        return ApiResponder::ok(['deleted' => true]);
    }

    public function setDefault(Request $request, int $id): JsonResponse
    {
        $user = $request->attributes->get('gnk_user');
        $address = Dto::rows('addresses')->first(fn (object $a) => (int) $a->id === $id && (int) $a->user_id === (int) $user->id);
        if (!$address) throw ApiException::notFound('آدرس مورد نظر یافت نشد');
        DB::table('addresses')->where('user_id', $user->id)->update(['is_default' => 0]);
        DB::table('addresses')->where('id', $id)->update(['is_default' => 1, 'updated_at' => Dto::now()]);
        Dto::flush();
        return ApiResponder::ok(Dto::addressDto(Dto::find('addresses', $id)));
    }
}
