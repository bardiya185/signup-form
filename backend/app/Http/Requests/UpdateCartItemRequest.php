<?php

namespace App\Http\Requests;

class UpdateCartItemRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['quantity' => ['required', 'integer', 'min:0', 'max:100']];
    }

    public function messages(): array
    {
        return ['quantity.required' => 'تعداد الزامی است'];
    }
}
