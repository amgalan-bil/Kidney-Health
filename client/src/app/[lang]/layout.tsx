import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Inter, Manrope } from 'next/font/google';
import { getDictionary, isLocale, locales } from '@/lib/i18n';
import { AccountProvider } from '@/components/account/account-provider';
import '../globals.css';

// cyrillic-ext carries Mongolian's Ө and Ү.
const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-inter',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-manrope',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: '#15293a',
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: { en: '/en', mn: '/mn' } },
    openGraph: { title: t.meta.title, description: t.meta.description, type: 'website' },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <AccountProvider>{children}</AccountProvider>
      </body>
    </html>
  );
}
