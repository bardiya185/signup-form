<?php

namespace App\Http\Requests;

class ChangePasswordRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string', 'max:100'],
            'new_password' => ['required', 'string', 'min:6', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'رمز عبور فعلی الزامی است',
            'new_password.required' => 'رمز عبور جدید الزامی است',
            'new_password.min' => 'رمز عبور باید حداقل ۶ کاراکتر باشد',
        ];
    }
}
