import { redirect } from 'next/navigation';

/** /checkout/payment → /checkout (پرداخت در همان صفحه تسویه انجام می‌شود) */
export default function PaymentRedirectPage() {
  redirect('/checkout');
}
