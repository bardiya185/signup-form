<?php

namespace App\Http\Requests;

class OtpSendRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['phone' => ['required', 'string', 'regex:/^09\d{9}$/']];
    }

    public function messages(): array
    {
        return [
            'phone.required' => 'شماره موبایل الزامی است',
            'phone.regex' => 'شماره موبایل معتبر نیست',
        ];
    }
}
