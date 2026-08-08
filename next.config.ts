import type { NextConfig } from 'next';

/**
 * سوییچ بک‌اند:
 *  - پیش‌فرض: API داخلی Next.js (`src/app/api/v1/*`) روی دیتابیس SQLite واقعی.
 *  - اگر LARAVEL_API_URL ست شود (مثلاً http://localhost:8000)، هر درخواست /api/v1/*
 *    از همان سطح وب‌سرور Next به لاراول پروکسی می‌شود؛ فرانت بدون هیچ تغییری
 *    با بک‌اند لاراول کار می‌کند (قرارداد پاسخ یکسان است).
 *    نکته: این پراکسی در سمت سرور Next انجام می‌شود، پس مرورگر همچنان same-origin می‌ماند
 *    و نیازی نیست لاراول از محیط کاربر قابل‌دسترس باشد.
 */
const laravelUrl = process.env.LARAVEL_API_URL?.replace(/\/+$/, '') || '';

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  async rewrites() {
    if (!laravelUrl) return [];
    return {
      beforeFiles: [
        { source: '/api/v1/:path*', destination: `${laravelUrl}/api/v1/:path*` },
      ],
    };
  },
};
export default nextConfig;
