<?php

namespace App\Http\Requests;

class CouponRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['code' => ['required', 'string', 'min:2', 'max:50']];
    }

    public function messages(): array
    {
        return ['code.required' => 'کد تخفیف الزامی است'];
    }
}
