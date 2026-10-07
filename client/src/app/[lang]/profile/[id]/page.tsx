import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/sections/footer';
import { FundraiserProfile } from '@/components/fundraisers/fundraiser-profile';

export default async function ProfilePage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} t={t} />
      <main>
        <FundraiserProfile id={id} locale={lang} t={t} />
      </main>
      <Footer t={t} locale={lang} />
    </>
  );
}
