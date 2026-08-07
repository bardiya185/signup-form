<?php

namespace App\Http\Requests;

class AdminCategoryCreateRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:2', 'max:80'],
            'parent_id' => ['nullable', 'integer', 'min:1'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'عنوان دسته الزامی است',
            'title.min' => 'عنوان دسته باید حداقل ۲ کاراکتر باشد',
        ];
    }
}
