<?php

namespace App\Http\Requests;

class AdminSellerStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:pending,approved,rejected,suspended'],
            'reason' => ['nullable', 'string', 'max:300'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'وضعیت الزامی است',
            'status.in' => 'وضعیت انتخاب‌شده معتبر نیست',
            'reason.max' => 'دلیل نباید بیش از ۳۰۰ کاراکتر باشد',
        ];
    }
}
