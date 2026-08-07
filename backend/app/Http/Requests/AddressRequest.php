<?php

namespace App\Http\Requests;

class AddressRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:2', 'max:60'],
            'receiver_name' => ['required', 'string', 'min:3', 'max:120'],
            'receiver_phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'province_id' => ['required', 'integer', 'min:1'],
            'city_id' => ['required', 'integer', 'min:1'],
            'full_address' => ['required', 'string', 'min:10', 'max:1000'],
            'postal_code' => ['required', 'string', 'digits:10'],
            'lat' => ['nullable', 'numeric'],
            'lng' => ['nullable', 'numeric'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان آدرس الزامی است',
            'receiver_name.required' => 'نام گیرنده الزامی است',
            'receiver_name.min' => 'نام گیرنده باید حداقل ۳ حرف باشد',
            'receiver_phone.required' => 'شماره گیرنده الزامی است',
            'receiver_phone.regex' => 'شماره موبایل گیرنده معتبر نیست',
            'province_id.required' => 'استان را انتخاب کنید',
            'city_id.required' => 'شهر را انتخاب کنید',
            'full_address.required' => 'نشانی کامل الزامی است',
            'full_address.min' => 'نشانی باید حداقل ۱۰ حرف باشد',
            'postal_code.required' => 'کد پستی الزامی است',
            'postal_code.digits' => 'کد پستی باید ۱۰ رقم باشد',
        ];
    }
}
