'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

type CartStore = { items: CartItem[]; wishlist: string[]; add:(product:Product, opts?:{color?:string;storage?:string})=>void; remove:(id:string)=>void; setQuantity:(id:string,quantity:number)=>void; toggleWishlist:(id:string)=>void };
export const useCartStore = create<CartStore>()(persist((set) => ({
  items: [], wishlist: [],
  add: (product, opts) => set(state => { const found = state.items.find(item => item.product.id===product.id && item.color===opts?.color && item.storage===opts?.storage); return {items: found ? state.items.map(item => item===found ? {...item,quantity:item.quantity+1}:item) : [...state.items,{product,quantity:1,...opts}]}; }),
  remove: (id) => set(state => ({items:state.items.filter(item=>item.product.id!==id)})),
  setQuantity: (id, quantity) => set(state => ({items:quantity<1 ? state.items.filter(item=>item.product.id!==id) : state.items.map(item=>item.product.id===id?{...item,quantity}:item)})),
  toggleWishlist: (id) => set(state => ({wishlist:state.wishlist.includes(id)?state.wishlist.filter(item=>item!==id):[...state.wishlist,id]}))
}), {name:'ginan-kala-cart'}));
