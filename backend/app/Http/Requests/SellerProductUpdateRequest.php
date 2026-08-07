<?php

namespace App\Http\Requests;

class SellerProductUpdateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'min:5', 'max:200'],
            'price' => ['nullable', 'integer', 'min:1000'],
            'sale_price' => ['nullable', 'integer', 'min:1000'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'short_description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.min' => 'عنوان محصول باید حداقل ۵ کاراکتر باشد',
            'price.min' => 'قیمت باید حداقل ۱٬۰۰۰ تومان باشد',
            'sale_price.min' => 'قیمت فروش ویژه باید حداقل ۱٬۰۰۰ تومان باشد',
            'stock.min' => 'موجودی نمی‌تواند منفی باشد',
        ];
    }
}
