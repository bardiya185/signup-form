<?php

namespace App\Http\Requests;

class AvatarRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['avatar' => ['required', 'string', 'max:4000000']];
    }

    public function messages(): array
    {
        return ['avatar.required' => 'تصویر پروفایل الزامی است'];
    }
}
