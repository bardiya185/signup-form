<?php

namespace App\Http\Requests;

class AdminBrandCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:2', 'max:60'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'نام برند الزامی است',
            'title.min' => 'نام برند باید حداقل ۲ کاراکتر باشد',
        ];
    }
}
