<?php

namespace App\Http\Requests;

class ResetPasswordRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'identity' => ['required', 'string', 'max:191'],
            'code' => ['required', 'string', 'digits:5'],
            'password' => ['required', 'string', 'min:6', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'identity.required' => 'شماره موبایل یا ایمیل الزامی است',
            'code.required' => 'کد تایید الزامی است',
            'code.digits' => 'کد تایید باید ۵ رقم باشد',
            'password.required' => 'رمز عبور جدید الزامی است',
            'password.min' => 'رمز عبور باید حداقل ۶ کاراکتر باشد',
        ];
    }
}
