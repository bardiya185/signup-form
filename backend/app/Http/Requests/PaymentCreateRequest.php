<?php

namespace App\Http\Requests;

class PaymentCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'order_number' => ['required', 'string', 'max:30'],
            'gateway' => ['required', 'string', 'in:zarinpal,mellat,saman'],
        ];
    }

    public function messages(): array
    {
        return [
            'order_number.required' => 'شماره سفارش الزامی است',
            'gateway.required' => 'درگاه پرداخت را انتخاب کنید',
            'gateway.in' => 'درگاه پرداخت معتبر نیست',
        ];
    }
}
