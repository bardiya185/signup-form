<?php

namespace App\Http\Requests;

class QuestionCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return ['question' => ['required', 'string', 'min:5', 'max:1000']];
    }

    public function messages(): array
    {
        return [
            'question.required' => 'متن پرسش الزامی است',
            'question.min' => 'متن پرسش باید حداقل ۵ حرف باشد',
        ];
    }
}
