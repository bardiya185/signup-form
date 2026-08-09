import { db } from '../db';
import { toQuestionDto, toReviewDto } from '../serializers';
import type { QuestionDto, ReviewDto } from '@/types/dto';

export function productReviews(
  productId: number, page: number, perPage: number,
): { items: ReviewDto[]; total: number } {
  const all = db.reviews
    .filter((r) => r.product_id === productId && r.status === 'approved')
    .sort((a, b) => b.likes_count - a.likes_count)
    .map(toReviewDto);
  const start = (page - 1) * perPage;
  return { items: all.slice(start, start + perPage), total: all.length };
}

export function productQuestions(productId: number): QuestionDto[] {
  return db.product_questions
    .filter((q) => q.product_id === productId && q.status !== 'rejected')
    .map(toQuestionDto);
}
