<?php

namespace App\Http\Requests;

class ForgotPasswordRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['identity' => ['required', 'string', 'max:191']];
    }

    public function messages(): array
    {
        return ['identity.required' => 'شماره موبایل یا ایمیل الزامی است'];
    }
}
