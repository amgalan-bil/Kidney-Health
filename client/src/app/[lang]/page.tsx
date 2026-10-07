import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { Hero } from '@/components/sections/hero';
import { Fundraisers } from '@/components/sections/fundraisers';
import { Footer } from '@/components/sections/footer';

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} t={t} />
      <main>
        <Hero t={t} locale={lang} />
        <Fundraisers t={t} locale={lang} />
      </main>
      <Footer t={t} locale={lang} />
    </>
  );
}
