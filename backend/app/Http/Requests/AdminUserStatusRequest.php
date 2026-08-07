<?php

namespace App\Http\Requests;

class AdminUserStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:active,banned,inactive'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'وضعیت الزامی است',
            'status.in' => 'وضعیت انتخاب‌شده معتبر نیست',
        ];
    }
}
