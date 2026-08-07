<?php

namespace App\Http\Requests;

class TicketCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'department' => ['required', 'string', 'in:orders,payments,returns,technical,general'],
            'subject' => ['required', 'string', 'min:4', 'max:150'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'order_id' => ['nullable', 'integer', 'min:1'],
            'message' => ['required', 'string', 'min:5', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'department.required' => 'دپارتمان را انتخاب کنید',
            'department.in' => 'دپارتمان معتبر نیست',
            'subject.required' => 'موضوع تیکت الزامی است',
            'subject.min' => 'موضوع باید حداقل ۴ حرف باشد',
            'priority.required' => 'اولویت را انتخاب کنید',
            'priority.in' => 'اولویت معتبر نیست',
            'message.required' => 'متن پیام الزامی است',
            'message.min' => 'متن پیام باید حداقل ۵ حرف باشد',
        ];
    }
}
