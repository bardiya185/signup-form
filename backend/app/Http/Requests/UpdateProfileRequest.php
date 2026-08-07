<?php

namespace App\Http\Requests;

class UpdateProfileRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'first_name' => ['nullable', 'string', 'min:2', 'max:60'],
            'last_name' => ['nullable', 'string', 'min:2', 'max:60'],
            'email' => ['nullable', 'string', 'email', 'max:191'],
            'national_code' => ['nullable', 'string', 'digits:10'],
            'birth_date' => ['nullable', 'string', 'max:30'],
            'gender' => ['nullable', 'string', 'in:male,female'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.email' => 'ایمیل معتبر نیست',
            'national_code.digits' => 'کد ملی باید ۱۰ رقم باشد',
            'gender.in' => 'جنسیت معتبر نیست',
        ];
    }
}
