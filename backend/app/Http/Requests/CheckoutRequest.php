<?php

namespace App\Http\Requests;

class CheckoutRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'address_id' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', 'string', 'in:zarinpal,mellat,saman,wallet'],
            'shipping_method_id' => ['nullable', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'address_id.required' => 'انتخاب آدرس الزامی است',
            'payment_method.required' => 'روش پرداخت را انتخاب کنید',
            'payment_method.in' => 'روش پرداخت معتبر نیست',
        ];
    }
}
