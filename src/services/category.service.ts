import { Category } from '@/types';
const image=(name:string, extension='jpg')=>`/products/real/unique/${name}.${extension}`;
const categories:Category[]=[
 {id:'1',slug:'mobile',title:'موبایل و تبلت',image:image('iphone','webp'),count:1254},
 {id:'2',slug:'digital',title:'کالای دیجیتال',image:image('headphones','webp'),count:842},
 {id:'3',slug:'laptop',title:'لپ‌تاپ و کامپیوتر',image:image('laptop'),count:426},
 {id:'4',slug:'gaming',title:'گیمینگ',image:image('console'),count:305},
 {id:'5',slug:'fashion',title:'مد و پوشاک',image:image('bag'),count:2102},
 {id:'6',slug:'beauty',title:'زیبایی و سلامت',image:image('watch','webp'),count:754},
 {id:'7',slug:'home',title:'خانه و آشپزخانه',image:image('coffee','webp'),count:985},
 {id:'8',slug:'book',title:'کتاب و لوازم‌تحریر',image:image('book'),count:432},
 {id:'9',slug:'sports',title:'ورزش و سفر',image:image('shoe'),count:578},
 {id:'10',slug:'appliance',title:'لوازم خانگی',image:image('tv','webp'),count:694},
 {id:'11',slug:'tools',title:'ابزار و تجهیزات',image:image('camera'),count:268},
 {id:'12',slug:'food',title:'کالای سوپرمارکتی',image:image('blender'),count:1301}
];
export const categoryService={getAll:async()=>categories,getBySlug:async(slug:string)=>categories.find(c=>c.slug===slug)};
