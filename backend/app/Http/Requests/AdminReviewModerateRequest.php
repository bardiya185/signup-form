<?php

namespace App\Http\Requests;

class AdminReviewModerateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:approved,rejected'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'وضعیت الزامی است',
            'status.in' => 'وضعیت فقط می‌تواند تایید یا رد باشد',
        ];
    }
}
