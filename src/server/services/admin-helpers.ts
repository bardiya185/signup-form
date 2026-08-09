/** ردیف‌های نمایشی مخصوص پنل ادمین */
import { db } from '../db';
import { userNameOf } from '../resources';
import type { Banner, Review } from '@/types/domain';

export function toReviewAdminRow(review: Review) {
  const product = db.products.find((p) => p.id === review.product_id);
  return {
    id: review.id,
    title: review.title,
    body: review.body,
    rating: review.rating,
    status: review.status,
    isBuyer: review.is_buyer,
    likesCount: review.likes_count,
    dislikesCount: review.dislikes_count,
    productId: review.product_id,
    productTitle: product?.title ?? '—',
    authorName: userNameOf(review.user_id),
    createdAt: review.created_at,
  };
}

export function toUserishBanner(banner: Banner) {
  return {
    id: banner.id,
    title: banner.title,
    image: banner.image,
    link: banner.link,
    position: banner.position,
    sort_order: banner.sort_order,
    is_active: banner.is_active,
    starts_at: banner.starts_at,
    expires_at: banner.expires_at,
  };
}
