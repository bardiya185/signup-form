<?php

namespace App\Http\Requests;

class LoginRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'identity' => ['required', 'string', 'max:191'],
            'password' => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'identity.required' => 'شماره موبایل یا ایمیل الزامی است',
            'password.required' => 'رمز عبور الزامی است',
        ];
    }
}
