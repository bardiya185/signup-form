<?php

namespace App\Http\Requests;

class RegisterRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'min:2', 'max:60'],
            'last_name' => ['required', 'string', 'min:2', 'max:60'],
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'email' => ['nullable', 'string', 'email', 'max:191'],
            'password' => ['required', 'string', 'min:6', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'نام الزامی است',
            'first_name.min' => 'نام باید حداقل ۲ حرف باشد',
            'last_name.required' => 'نام خانوادگی الزامی است',
            'last_name.min' => 'نام خانوادگی باید حداقل ۲ حرف باشد',
            'phone.required' => 'شماره موبایل الزامی است',
            'phone.regex' => 'شماره موبایل معتبر نیست',
            'email.email' => 'ایمیل معتبر نیست',
            'password.required' => 'رمز عبور الزامی است',
            'password.min' => 'رمز عبور باید حداقل ۶ کاراکتر باشد',
        ];
    }
}
