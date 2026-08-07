<?php

namespace App\Http\Requests;

class SellerProductCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:200'],
            'category_id' => ['required', 'integer', 'min:1'],
            'brand_id' => ['nullable', 'integer', 'min:1'],
            'price' => ['required', 'integer', 'min:1000'],
            'sale_price' => ['nullable', 'integer', 'min:1000'],
            'stock' => ['required', 'integer', 'min:0'],
            'color_id' => ['nullable', 'integer', 'min:1'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'image' => ['nullable', 'string', 'max:300'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان محصول الزامی است',
            'title.min' => 'عنوان محصول باید حداقل ۵ کاراکتر باشد',
            'category_id.required' => 'دسته‌بندی الزامی است',
            'price.required' => 'قیمت الزامی است',
            'price.min' => 'قیمت باید حداقل ۱٬۰۰۰ تومان باشد',
            'sale_price.min' => 'قیمت فروش ویژه باید حداقل ۱٬۰۰۰ تومان باشد',
            'stock.required' => 'موجودی الزامی است',
            'stock.min' => 'موجودی نمی‌تواند منفی باشد',
        ];
    }
}
