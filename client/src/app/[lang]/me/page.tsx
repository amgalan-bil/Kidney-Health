import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { MyFundraiser } from '@/components/account/my-fundraiser';

/** Sends a fundraiser to their own page, or offers to start one. */
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
