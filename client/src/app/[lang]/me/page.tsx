import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { MyFundraiser } from '@/components/account/my-fundraiser';

/** Sends the signed-in person to their own fundraiser page (creating it on first visit). */
export default async function MePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} t={t} />
      <main>
        <MyFundraiser locale={lang} t={t} />
      </main>
    </>
  );
}
