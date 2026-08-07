<?php

namespace App\Http\Requests;

class SellerRegisterRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'shop_name' => ['required', 'string', 'min:2', 'max:60'],
            'national_id' => ['required', 'string', 'min:10', 'max:12'],
            'phone' => ['required', 'string', 'min:8', 'max:12'],
            'email' => ['required', 'string', 'email'],
            'province_id' => ['required', 'integer', 'min:1'],
            'city_id' => ['required', 'integer', 'min:1'],
            'address' => ['required', 'string', 'min:10', 'max:500'],
            'shaba_number' => ['required', 'string', 'min:24', 'max:34'],
        ];
    }

    public function messages(): array
    {
        return [
            'shop_name.required' => 'نام فروشگاه الزامی است',
            'shop_name.min' => 'نام فروشگاه باید حداقل ۲ کاراکتر باشد',
            'national_id.required' => 'شناسه ملی الزامی است',
            'national_id.min' => 'شناسه ملی معتبر نیست',
            'phone.required' => 'تلفن فروشگاه الزامی است',
            'email.required' => 'ایمیل الزامی است',
            'email.email' => 'ایمیل معتبر نیست',
            'province_id.required' => 'استان الزامی است',
            'city_id.required' => 'شهر الزامی است',
            'address.required' => 'آدرس فروشگاه الزامی است',
            'address.min' => 'آدرس باید حداقل ۱۰ کاراکتر باشد',
            'shaba_number.required' => 'شماره شبا الزامی است',
            'shaba_number.min' => 'شماره شبا معتبر نیست',
        ];
    }
}
