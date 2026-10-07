import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { getDictionary, isLocale, type Locale } from '@/lib/i18n';
import { SiteHeader } from '@/components/site-header';
import { PageIntro } from '@/components/page-intro';
import { Button } from '@/components/ui/button';

/**
 * Where donationController.qpayPaid sends the donor when a QPay payment can't be
 * verified. `reason` matches the codes it redirects with.
 */
export default async function PaymentFailedPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ reason?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { reason } = await searchParams;
  const t = getDictionary(lang);
  const copy = t.payment;

  const detail =
    reason && reason in copy.reasons
      ? copy.reasons[reason as keyof typeof copy.reasons]
      : copy.reasons.unknown;

  return (
    <>
      <Suspense>
        <SiteHeader locale={lang as Locale} t={t} />
      </Suspense>
      <main>
        <PageIntro className="min-h-svh">
          <div className="mx-auto max-w-lg text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-coral/15 ring-1 ring-coral/30">
              <AlertTriangle className="size-8 text-coral" />
            </span>
            <h1 className="font-display mt-8 text-3xl leading-tight font-extrabold sm:text-4xl">
              {copy.failedTitle}
            </h1>
            <p className="mt-5 text-lg font-semibold text-white/90">{detail}</p>
            <p className="mt-5 leading-relaxed text-white/60">{copy.reassure}</p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href={`/${lang}#fundraisers`}>{copy.tryAgain}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/${lang}`}>{copy.home}</Link>
              </Button>
            </div>
          </div>
        </PageIntro>
      </main>
    </>
  );
}
