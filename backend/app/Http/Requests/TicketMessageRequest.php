<?php

namespace App\Http\Requests;

class TicketMessageRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['body' => ['required', 'string', 'min:2', 'max:2000']];
    }

    public function messages(): array
    {
        return [
            'body.required' => 'متن پیام الزامی است',
            'body.min' => 'متن پیام باید حداقل ۲ حرف باشد',
        ];
    }
}
