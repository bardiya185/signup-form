'use client';
/**
 * علاقه‌مندی‌ها — گرید کالاهای نشان‌شده
 */
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/api';
import { ProductCard } from '@/components/product/product-card';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/states';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const wishlist = useWishlist();
  const items = wishlist.data?.data ?? [];

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-white">
        <Heart size={20} className="text-brand" /> علاقه‌مندی‌ها
      </h1>

      {wishlist.isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {wishlist.data && items.length === 0 && (
        <EmptyState
          icon="heart"
          title="لیست علاقه‌مندی‌های شما خالی است"
          description="با لمس قلب روی هر کالا، آن را اینجا نگه دارید."
          action={<Link href="/products"><Button size="sm">کاوش کالاها</Button></Link>}
        />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
