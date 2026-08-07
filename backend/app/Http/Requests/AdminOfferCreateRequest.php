<?php

namespace App\Http\Requests;

class AdminOfferCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', 'min:1'],
            'discount_price' => ['required', 'integer', 'min:100'],
            'stock' => ['required', 'integer', 'min:1'],
            'starts_at' => ['required', 'string', 'min:10', 'max:40'],
            'expires_at' => ['required', 'string', 'min:10', 'max:40'],
            'type' => ['nullable', 'string', 'in:incredible_offers,daily_deals'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_variant_id.required' => 'تنوع محصول الزامی است',
            'discount_price.required' => 'قیمت پیشنهادی الزامی است',
            'discount_price.min' => 'قیمت پیشنهادی معتبر نیست',
            'stock.required' => 'موجودی پیشنهاد الزامی است',
            'stock.min' => 'موجودی پیشنهاد باید حداقل ۱ باشد',
            'starts_at.required' => 'تاریخ شروع الزامی است',
            'expires_at.required' => 'تاریخ پایان الزامی است',
            'type.in' => 'نوع پیشنهاد معتبر نیست',
        ];
    }
}
