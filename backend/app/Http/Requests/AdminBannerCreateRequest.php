<?php

namespace App\Http\Requests;

class AdminBannerCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:2', 'max:100'],
            'image' => ['required', 'string', 'min:5', 'max:300'],
            'link' => ['nullable', 'string', 'max:300'],
            'position' => ['required', 'string', 'in:hero,sidebar,category,product'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان بنر الزامی است',
            'image.required' => 'تصویر بنر الزامی است',
            'position.required' => 'موقعیت بنر الزامی است',
            'position.in' => 'موقعیت بنر معتبر نیست',
        ];
    }
}
