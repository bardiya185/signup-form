<?php

namespace App\Http\Requests;

class WalletDepositRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:10000'],
            'gateway' => ['required', 'string', 'in:zarinpal,mellat,saman'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount.required' => 'مبلغ شارژ الزامی است',
            'amount.min' => 'حداقل مبلغ شارژ کیف پول ۱۰ هزار تومان است',
            'gateway.required' => 'درگاه پرداخت را انتخاب کنید',
            'gateway.in' => 'درگاه پرداخت معتبر نیست',
        ];
    }
}
