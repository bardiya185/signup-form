<?php

namespace App\Http\Requests;

class ReviewCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:3', 'max:120'],
            'body' => ['required', 'string', 'min:10', 'max:3000'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'pros' => ['nullable', 'array', 'max:10'],
            'pros.*' => ['string', 'max:200'],
            'cons' => ['nullable', 'array', 'max:10'],
            'cons.*' => ['string', 'max:200'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان دیدگاه الزامی است',
            'title.min' => 'عنوان دیدگاه باید حداقل ۳ حرف باشد',
            'body.required' => 'متن دیدگاه الزامی است',
            'body.min' => 'متن دیدگاه باید حداقل ۱۰ حرف باشد',
            'rating.required' => 'امتیاز الزامی است',
            'rating.min' => 'امتیاز باید بین ۱ تا ۵ باشد',
            'rating.max' => 'امتیاز باید بین ۱ تا ۵ باشد',
        ];
    }
}
