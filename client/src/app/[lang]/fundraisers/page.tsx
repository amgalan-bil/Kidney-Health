import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { PageIntro } from '@/components/page-intro';
import { Footer } from '@/components/sections/footer';
import { StartFundraiserButton } from '@/components/fundraisers/start-fundraiser-button';
import { FundraiserDirectory } from '@/components/fundraisers/fundraiser-directory';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: `${t.fundraisersPage.title} · ${t.brand}` };
}

export default async function FundraisersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} t={t} />
      <main>
        <PageIntro>
          <p className="eyebrow text-teal">{t.fundraisersPage.eyebrow}</p>
          <h1 className="font-display mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
            {t.fundraisersPage.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">{t.fundraisersPage.lead}</p>
          <div className="mt-9">
            <StartFundraiserButton locale={lang} t={t} />
          </div>
        </PageIntro>
        <section className="bg-cream py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <FundraiserDirectory t={t} locale={lang} />
          </div>
        </section>
      </main>
      <Footer t={t} locale={lang} />
    </>
  );
}
