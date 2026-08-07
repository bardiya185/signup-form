<?php

namespace App\Http\Requests;

use App\Support\ApiException;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * FormRequest پایه — خطای اعتبارسنجی با قرارداد فارسی پروژه:
 *   422 { "message": "اطلاعات وارد شده معتبر نیست", "errors": { field: [msgs] } }
 */
abstract class ApiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new ApiException(422, 'اطلاعات وارد شده معتبر نیست', $validator->errors()->toArray());
    }
}
