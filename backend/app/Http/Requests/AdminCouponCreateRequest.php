<?php

namespace App\Http\Requests;

class AdminCouponCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'min:3', 'max:30'],
            'type' => ['required', 'string', 'in:percentage,fixed'],
            'value' => ['required', 'integer', 'min:1'],
            'max_discount' => ['nullable', 'integer', 'min:1000'],
            'min_order_amount' => ['nullable', 'integer', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_user_limit' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'string', 'max:40'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'کد تخفیف الزامی است',
            'code.min' => 'کد تخفیف باید حداقل ۳ کاراکتر باشد',
            'type.required' => 'نوع کوپن الزامی است',
            'type.in' => 'نوع کوپن معتبر نیست',
            'value.required' => 'مقدار تخفیف الزامی است',
            'value.min' => 'مقدار تخفیف باید بزرگ‌تر از صفر باشد',
        ];
    }
}
