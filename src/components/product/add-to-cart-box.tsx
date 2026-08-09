'use client';
/**
 * باکس خرید محصول — انتخاب تنوع (رنگ/سایز)، قیمت، گارانتی، افزودن به سبد
 * + علاقه‌مندی، مقایسه، اشتراک‌گذاری و اطلاع از موجودی
 */
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BellRing, Check, GitCompareArrows, Heart, Share2, ShieldCheck, ShoppingCart, Store, Truck,
} from 'lucide-react';
import type { ProductDetailDto, VariantDto } from '@/types/dto';
import { useAddToCart, useCart, useToggleCompare, useToggleWishlist, useCompare, useWishlist } from '@/hooks/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/stores/ui.store';
import { http, firstError, type Envelope } from '@/lib/http';
import { faDigits } from '@/lib/format';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/ui/price';
import { QuantityInput } from '@/components/ui/quantity';
import { CountdownTimer } from '@/components/ui/countdown';

function colorOptions(variants: VariantDto[]) {
  const map = new Map<number, { id: number; name: string; hex: string }>();
  variants.forEach((v) => v.color && map.set(v.color.id, v.color));
  return [...map.values()];
}
function sizeOptions(variants: VariantDto[], colorId: number | null) {
  const map = new Map<number, { id: number; name: string }>();
  variants
    .filter((v) => (colorId ? v.color?.id === colorId : true))
    .forEach((v) => v.size && map.set(v.size.id, v.size));
  return [...map.values()];
}

export function AddToCartBox({ product }: { product: ProductDetailDto }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const addToCart = useAddToCart();
  const toggleWishlist = useToggleWishlist();
  const toggleCompare = useToggleCompare();
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();

  const colors = useMemo(() => colorOptions(product.variants), [product.variants]);
  const [colorId, setColorId] = useState<number | null>(colors[0]?.id ?? null);
  const sizes = useMemo(() => sizeOptions(product.variants, colorId), [product.variants, colorId]);
  const [sizeId, setSizeId] = useState<number | null>(null);

  const variant = useMemo(() => {
    const withColor = product.variants.filter((v) => (colorId ? v.color?.id === colorId : !v.color));
    return (
      withColor.find((v) => (sizes.length ? v.size?.id === (sizeId ?? sizes[0]?.id) : true)) ??
      withColor[0] ??
      product.variants[0]
    );
  }, [product.variants, colorId, sizeId, sizes]);

  const inCart = cart.data?.data.items.find((i) => i.variant.id === variant?.id);
  const [qty, setQty] = useState<number>(1);
  const [alertPhone, setAlertPhone] = useState('');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertDone, setAlertDone] = useState(false);

  const wished = !!variant && !!wishlist.data?.data?.some((p) => p.id === product.id);
  const compared = !!compare.data?.data?.products.some((p) => p.id === product.id);

  if (!variant) return null;
  const outOfStock = variant.stock <= 0;
  const maxQty = Math.min(variant.maxPerOrder || variant.stock, variant.stock);

  const submitAvailabilityAlert = async () => {
    setAlertLoading(true);
    try {
      const res = await http.post<Envelope<{ message: string }>>(`/products/${product.slug}/notify-availability`, {
        variant_id: variant.id,
        phone: alertPhone || undefined,
      });
      toast.success(res.data.message);
      setAlertDone(true);
    } catch (e) {
      toast.error(firstError(e));
    } finally {
      setAlertLoading(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.info('پیوند محصول کپی شد');
      }
    } catch { /* لغو توسط کاربر */ }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* فروشنده */}
      {product.seller && (
        <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 text-sm dark:border-zinc-800">
          <Store size={16} className="text-zinc-400" />
          <span className="text-zinc-600 dark:text-zinc-300">{product.seller.shopName}</span>
          {product.seller.rating > 0 && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              {faDigits(product.seller.rating)}٪ رضایت
            </span>
          )}
        </div>
      )}

      {/* رنگ */}
      {colors.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">
            رنگ: <span className="font-normal text-zinc-500">{colors.find((c) => c.id === colorId)?.name ?? '—'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setColorId(c.id); setSizeId(null); }}
                aria-label={c.name}
                title={c.name}
                className={cn(
                  'flex size-8 items-center justify-center rounded-full border-2 transition',
                  colorId === c.id ? 'scale-110 border-brand' : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-700',
                )}
              >
                <span className="size-6 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* سایز */}
      {sizes.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-bold text-zinc-700 dark:text-zinc-200">سایز:</div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSizeId(s.id)}
                className={cn(
                  'min-w-11 rounded-xl border px-3 py-2 text-sm font-bold transition',
                  (sizeId ?? sizes[0]?.id) === s.id
                    ? 'border-brand bg-brand-soft text-brand dark:bg-brand/20'
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300',
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* گارانتی */}
      {variant.guarantee && (
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <ShieldCheck size={16} className="text-sky-500" />
          {variant.guarantee.title}
        </div>
      )}

      {/* تایمر شگفت‌انگیز */}
      {variant.isIncredible && variant.offerEndsAt && !outOfStock && (
        <div className="mt-4 rounded-xl bg-brand-soft p-3 dark:bg-brand/15">
          <CountdownTimer target={variant.offerEndsAt} />
        </div>
      )}

      {/* قیمت */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Truck size={15} />
          {outOfStock ? 'ناموجود' : 'موجود در انبار — ارسال از گینان‌کالا'}
        </div>
        <PriceDisplay
          price={variant.effectivePrice}
          originalPrice={variant.salePrice != null ? variant.price : undefined}
          discountPercent={variant.discountPercent}
          size="xl"
        />
      </div>

      {/* کمیت + افزودن */}
      {!outOfStock ? (
        <div className="mt-5 flex items-stretch gap-2">
          <QuantityInput value={qty} onChange={setQty} max={Math.max(1, maxQty)} />
          <Button
            className="flex-1"
            size="lg"
            loading={addToCart.isPending}
            onClick={() =>
              addToCart.mutate(
                { product_variant_id: variant.id, quantity: qty },
                { onSuccess: () => toast.success('به سبد خرید اضافه شد') },
              )
            }
          >
            <ShoppingCart size={18} />
            {inCart ? `افزودن مجدد (در سبد: ${faDigits(inCart.quantity)})` : 'افزودن به سبد خرید'}
          </Button>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
          {alertDone ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Check size={16} /> موقع موجود شدن خبرتان می‌کنیم.
            </div>
          ) : user ? (
            <Button variant="secondary" className="w-full" size="lg" loading={alertLoading} onClick={submitAvailabilityAlert}>
              <BellRing size={17} /> موجود شد خبرم کن
            </Button>
          ) : (
            <div className="flex gap-2">
              <input
                value={alertPhone}
                onChange={(e) => setAlertPhone(e.target.value)}
                placeholder="شماره موبایل"
                inputMode="numeric"
                className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-950"
              />
              <Button variant="secondary" loading={alertLoading} onClick={submitAvailabilityAlert}>
                <BellRing size={17} /> خبرم کن
              </Button>
            </div>
          )}
        </div>
      )}

      {/* اکشن‌های ثانویه */}
      <div className="mt-4 flex items-center justify-around border-t border-zinc-100 pt-4 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => (user ? toggleWishlist.mutate({ productId: product.id, remove: wished }) : router.push('/login'))}
          className={cn('flex flex-col items-center gap-1 text-[11px] transition', wished ? 'text-brand' : 'text-zinc-400 hover:text-brand')}
        >
          <Heart size={18} className={wished ? 'fill-brand' : ''} />
          علاقه‌مندی
        </button>
        <button
          type="button"
          onClick={() => toggleCompare.mutate({ productId: product.id, remove: compared })}
          className={cn('flex flex-col items-center gap-1 text-[11px] transition', compared ? 'text-sky-500' : 'text-zinc-400 hover:text-sky-500')}
        >
          <GitCompareArrows size={18} />
          مقایسه
        </button>
        <button
          type="button"
          onClick={share}
          className="flex flex-col items-center gap-1 text-[11px] text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          <Share2 size={18} />
          اشتراک‌گذاری
        </button>
      </div>

      {variant.stock > 0 && variant.stock <= 3 && (
        <p className="mt-3 text-center text-[11px] font-bold text-brand">تنها {faDigits(variant.stock)} عدد در انبار باقی مانده</p>
      )}
    </div>
  );
}
