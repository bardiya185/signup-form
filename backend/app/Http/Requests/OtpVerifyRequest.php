<?php

namespace App\Http\Requests;

class OtpVerifyRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'code' => ['required', 'string', 'digits:5'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'شماره موبایل الزامی است',
            'phone.regex' => 'شماره موبایل معتبر نیست',
            'code.required' => 'کد تایید الزامی است',
            'code.digits' => 'کد تایید باید ۵ رقم باشد',
        ];
    }
}
