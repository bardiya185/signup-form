import { db, nextId } from '../db';
import { err404, err422 } from '../errors';
import { resolveOwner, type Owner } from '../guards';
import { toProductCardDto, toProductDetailDto } from '../serializers';
import { categoryMiniOf } from '../serializers';
import type * as D from '@/types/domain';

const now = () => new Date().toISOString();

const productOr404 = (productId: number): D.Product => {
  const product = db.products.find((p) => p.id === productId && p.status === 'active');
  if (!product) throw err404('محصول مورد نظر یافت نشد');
  return product;
};

// ─── علاقه‌مندی‌ها ───
export const listWishlist = (user: D.User) =>
  db.wishlists
    .filter((w) => w.user_id === user.id)
    .map((w) => db.products.find((p) => p.id === w.product_id && p.status === 'active'))
    .filter((p): p is D.Product => !!p)
    .map(toProductCardDto);

export function toggleWishlist(user: D.User, productId: number, action: 'add' | 'remove') {
  const product = productOr404(productId);
  const existingIdx = db.wishlists.findIndex((w) => w.user_id === user.id && w.product_id === product.id);
  if (action === 'add') {
    if (existingIdx === -1) {
      db.wishlists.push({ id: nextId(db.wishlists), user_id: user.id, product_id: product.id, created_at: now(), updated_at: now() });
    }
    return { added: true, count: db.wishlists.filter((w) => w.user_id === user.id).length };
  }
  if (existingIdx !== -1) db.wishlists.splice(existingIdx, 1);
  return { added: false, count: db.wishlists.filter((w) => w.user_id === user.id).length };
}

// ─── مقایسه ───
const LIST_LIMIT = 4;

const ownerLists = (owner: Owner) =>
  db.compare_lists.filter((l) => (owner.userId ? l.user_id === owner.userId : l.session_id === owner.sessionId));

export function getCompare(req: Request) {
  const owner = resolveOwner(req);
  const list = ownerLists(owner)[0];
  if (!list) return { category: null, products: [] as ReturnType<typeof toProductDetailDto>[] };
  const products = db.compare_list_items
    .filter((i) => i.compare_list_id === list.id)
    .map((i) => db.products.find((p) => p.id === i.product_id && p.status === 'active'))
    .filter((p): p is D.Product => !!p)
    .map(toProductDetailDto);
  return { category: categoryMiniOf(list.category_id), products };
}

export function addToCompare(req: Request, productId: number) {
  const product = productOr404(productId);
  const owner = resolveOwner(req);
  let list = ownerLists(owner).find((l) => l.category_id === product.category_id);

  const other = ownerLists(owner).filter((l) => l.category_id !== product.category_id);
  if (!list) {
    if (other.length) {
      throw err422({ product: ['مقایسه فقط برای کالاهای یک دسته‌بندی ممکن است؛ ابتدا لیست قبلی را خالی کنید'] });
    }
    list = {
      id: nextId(db.compare_lists),
      user_id: owner.userId, session_id: owner.sessionId,
      category_id: product.category_id, created_at: now(), updated_at: now(),
    };
    db.compare_lists.push(list);
  }

  const items = db.compare_list_items.filter((i) => i.compare_list_id === list!.id);
  if (items.some((i) => i.product_id === product.id)) {
    return { added: true, count: items.length };
  }
  if (items.length >= LIST_LIMIT) {
    throw err422({ product: [`حداکثر ${LIST_LIMIT} کالای هم‌دسته را می‌توانید مقایسه کنید`] });
  }
  db.compare_list_items.push({ id: nextId(db.compare_list_items), compare_list_id: list.id, product_id: product.id, created_at: now(), updated_at: now() });
  return { added: true, count: items.length + 1 };
}

export function removeFromCompare(req: Request, productId: number) {
  const owner = resolveOwner(req);
  const lists = ownerLists(owner);
  for (const list of lists) {
    const before = db.compare_list_items.length;
    db.compare_list_items = db.compare_list_items.filter(
      (i) => !(i.compare_list_id === list.id && i.product_id === productId),
    );
    if (db.compare_list_items.length !== before) {
      const remaining = db.compare_list_items.some((i) => i.compare_list_id === list.id);
      if (!remaining) db.compare_lists = db.compare_lists.filter((l) => l.id !== list.id);
      break;
    }
  }
  return { removed: true };
}
