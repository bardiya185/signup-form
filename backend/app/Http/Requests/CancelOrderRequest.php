<?php

namespace App\Http\Requests;

class CancelOrderRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['reason' => ['required', 'string', 'min:3', 'max:500']];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'دلیل لغو سفارش الزامی است',
            'reason.min' => 'دلیل لغو باید حداقل ۳ حرف باشد',
        ];
    }
}
