import { db } from '../db';
import { toCategoryTreeDto } from '../serializers';
import type * as D from '@/types/domain';
import type { CategoryMiniDto, CategoryNodeDto } from '@/types/dto';

/** درخت کامل دسته‌بندی‌ها */
export function categoryTree(): CategoryNodeDto[] {
  return toCategoryTreeDto(null);
}

export function findCategoryBySlug(slug: string): D.Category | undefined {
  return db.categories.find((c) => c.slug === slug && c.is_active);
}

/** شناسه خود دسته + تمام زیر‌دسته‌ها (برای فیلتر «شامل زیرمجموعه‌ها») */
export function boundaryCategoryIds(categorySlug: string): number[] {
  const root = findCategoryBySlug(categorySlug);
  if (!root) return [];
  const ids: number[] = [root.id];
  const walk = (parentId: number) => {
    db.categories
      .filter((c) => c.parent_id === parentId && c.is_active)
      .forEach((child) => {
        ids.push(child.id);
        walk(child.id);
      });
  };
  walk(root.id);
  return ids;
}

/** زنجیره والدین برای Breadcrumb */
export function categoryBreadcrumb(category: D.Category): CategoryMiniDto[] {
  const chain: CategoryMiniDto[] = [];
  let cursor: D.Category | undefined = category;
  while (cursor) {
    chain.unshift({ id: cursor.id, title: cursor.title, slug: cursor.slug });
    cursor = db.categories.find((c) => c.id === cursor!.parent_id);
  }
  return chain;
}

export function categoryNode(category: D.Category): CategoryNodeDto {
  return {
    id: category.id, title: category.title, slug: category.slug,
    icon: category.icon, image: category.image,
    children: toCategoryTreeDto(category.id),
  };
}

export function listBrands() {
  return db.brands
    .filter((b) => b.is_active)
    .map((b) => ({ id: b.id, title: b.title, slug: b.slug, logo: b.logo }));
}
