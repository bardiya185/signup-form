import { Catalog } from '@/components/product/catalog';
import { products } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { notFound } from 'next/navigation';

export default async function CategoryPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const category=await categoryService.getBySlug(slug);
  if(!category) notFound();
  const categoryProducts=products.filter(product=>product.category===slug);
  return <Catalog title={category.title} totalCount={category.count} products={categoryProducts.length?categoryProducts:products} />;
}
