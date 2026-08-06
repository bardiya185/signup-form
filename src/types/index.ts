export type Product = { id:string; slug:string; title:string; brand:string; image:string; images:string[]; price:number; originalPrice?:number; rating:number; reviewCount:number; colors:{name:string; hex:string}[]; storage?:string[]; stock:number; category:string; specs:Record<string,string>; description:string };
export type Category = { id:string; slug:string; title:string; image:string; count:number };
export type CartItem = { product:Product; quantity:number; color?:string; storage?:string };
