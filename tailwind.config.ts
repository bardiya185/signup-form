import type { Config } from 'tailwindcss';
const config: Config = { darkMode: 'class', content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: { DEFAULT:'#ef4056', dark:'#d9364b', soft:'#fff1f3' }, ink:'#27272a' }, fontFamily: { sans:['IRANYekan','Tahoma','sans-serif'] }, boxShadow: { card:'0 3px 12px rgba(0,0,0,.06)' } } }, plugins: [] };
export default config;
