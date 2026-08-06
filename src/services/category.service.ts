import { Category } from '@/types';
const img=(group:'tech'|'life'|'home')=>`/products/${group==='tech'?'tech-photo':group==='life'?'lifestyle-photo':'home-photo'}.jpg`;
const categories:Category[]=[
 {id:'1',slug:'mobile',title:'موبایل و تبلت',image:img('tech'),count:1254},
 {id:'2',slug:'digital',title:'کالای دیجیتال',image:img('tech'),count:842},
 {id:'3',slug:'laptop',title:'لپ‌تاپ و کامپیوتر',image:img('home'),count:426},
 {id:'4',slug:'gaming',title:'گیمینگ',image:img('home'),count:305},
 {id:'5',slug:'fashion',title:'مد و پوشاک',image:img('life'),count:2102},
 {id:'6',slug:'beauty',title:'زیبایی و سلامت',image:img('life'),count:754},
 {id:'7',slug:'home',title:'خانه و آشپزخانه',image:img('life'),count:985},
 {id:'8',slug:'book',title:'کتاب و لوازم‌تحریر',image:img('life'),count:432},
 {id:'9',slug:'sports',title:'ورزش و سفر',image:img('life'),count:578},
 {id:'10',slug:'appliance',title:'لوازم خانگی',image:img('home'),count:694},
 {id:'11',slug:'tools',title:'ابزار و تجهیزات',image:img('tech'),count:268},
 {id:'12',slug:'food',title:'کالای سوپرمارکتی',image:img('home'),count:1301}
];
export const categoryService={getAll:async()=>categories,getBySlug:async(slug:string)=>categories.find(c=>c.slug===slug)};
