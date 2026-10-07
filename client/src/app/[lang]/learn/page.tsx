import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getDictionary, isLocale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { PageIntro } from '@/components/page-intro';
import { Button } from '@/components/ui/button';
import { Why } from '@/components/sections/why';
import { Treatment } from '@/components/sections/treatment';
import { Campaign } from '@/components/sections/campaign';
import { Footer } from '@/components/sections/footer';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: `${t.learnPage.eyebrow} · ${t.brand}` };
}

export default async function LearnPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <SiteHeader locale={lang} t={t} />
      <main>
        <PageIntro>
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="size-4" />
            {t.learnPage.back}
          </Link>
          <p className="eyebrow mt-8 text-teal">{t.learnPage.eyebrow}</p>
          <h1 className="font-display mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
            {t.learnPage.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">{t.learnPage.lead}</p>
          <div className="mt-9">
            <Button asChild size="lg">
              <Link href={`/${lang}#fundraisers`}>
                {t.hero.donate}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </PageIntro>
        <Why t={t} />
        <Treatment t={t} />
        <Campaign t={t} />
      </main>
      <Footer t={t} locale={lang} />
    </>
  );
}
