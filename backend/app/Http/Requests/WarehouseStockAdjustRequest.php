<?php

namespace App\Http\Requests;

class WarehouseStockAdjustRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'reason' => ['nullable', 'string', 'max:200'],
        ];
    }

    public function messages(): array
    {
        return [
            'stock.required' => 'موجودی الزامی است',
            'stock.integer' => 'موجودی باید عدد صحیح باشد',
            'stock.min' => 'موجودی نمی‌تواند منفی باشد',
            'reason.max' => 'دلیل نباید بیش از ۲۰۰ کاراکتر باشد',
        ];
    }
}
