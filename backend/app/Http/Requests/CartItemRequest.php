<?php

namespace App\Http\Requests;

class CartItemRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', 'min:1'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_variant_id.required' => 'تنوع محصول الزامی است',
            'quantity.required' => 'تعداد الزامی است',
            'quantity.min' => 'تعداد باید حداقل ۱ باشد',
        ];
    }
}
