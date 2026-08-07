<?php

namespace App\Http\Requests;

class AdminOrderStatusRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:pending,processing,shipped,delivered,cancelled,returned'],
            'description' => ['nullable', 'string', 'max:300'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'وضعیت الزامی است',
            'status.in' => 'وضعیت انتخاب‌شده معتبر نیست',
            'description.max' => 'توضیح نباید بیش از ۳۰۰ کاراکتر باشد',
        ];
    }
}
