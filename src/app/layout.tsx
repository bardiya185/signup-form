import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from '@/components/shared/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: { default: 'گینان‌کالا | فروشگاه اینترنتی خرید آنلاین', template: '%s | گینان‌کالا' },
  description:
    'فروشگاه اینترنتی گینان‌کالا؛ خرید آنلاین موبایل، لپ‌تاپ، لوازم خانگی، مد و پوشاک و کتاب با ضمانت اصالت کالا و ارسال سریع.',
  keywords: ['فروشگاه اینترنتی', 'خرید آنلاین', 'گینان‌کالا', 'موبایل', 'لپ تاپ'],
  manifest: '/manifest.webmanifest',
  applicationName: 'گینان‌کالا',
  appleWebApp: { capable: true, title: 'گینان‌کالا', statusBarStyle: 'default' },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'گینان‌کالا',
    title: 'گینان‌کالا | فروشگاه اینترنتی خرید آنلاین',
    description: 'خرید آنلاین با ضمانت اصالت کالا، ارسال سریع و پرداخت امن.',
  },
};

export const viewport: Viewport = {
  themeColor: '#ef4056',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
