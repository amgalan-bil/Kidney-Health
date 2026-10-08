'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Reveal } from '@/components/reveal';
import { Button } from '@/components/ui/button';
import { FundraiserCard, FundraiserCardSkeleton } from '@/components/fundraisers/fundraiser-card';
import { StartFundraiserButton } from '@/components/fundraisers/start-fundraiser-button';
import { useFundraisers } from '@/components/fundraisers/use-fundraisers';
import { GeneralDonation } from '@/components/donate/general-donation';
import { SectionHeading } from './section-heading';

const TOP = 6;
/** Fundraisers offered in the donation box's picker. One request feeds both it and the cards. */
const PICKER_LIMIT = 100;

export function Fundraisers({ t, locale }: { t: Dictionary; locale: Locale }) {
  const state = useFundraisers(1, PICKER_LIMIT);

  return (
    <section id="fundraisers" className="bg-paper py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading eyebrow={t.fundraisers.eyebrow} title={t.fundraisers.title} lead={t.fundraisers.lead} />
          <Reveal delay={200} className="flex flex-wrap gap-3">
            <StartFundraiserButton locale={locale} t={t} />
            <Button asChild variant="outline" className="text-ink">
              <Link href={`/${locale}/fundraisers`}>
                {t.fundraisers.seeAll}
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>

        <div className="mt-10">
          {state.status === 'error' && <p className="text-ink-muted">{t.fundraisers.error}</p>}
          {state.status === 'ready' && state.fundraisers.length === 0 && (
            <p className="text-ink-muted">{t.fundraisers.empty}</p>
          )}
          {state.status !== 'error' && (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {state.status === 'loading'
                ? Array.from({ length: TOP }, (_, i) => (
                    <li key={i}>
                      <FundraiserCardSkeleton />
                    </li>
                  ))
                : state.fundraisers.slice(0, TOP).map((fundraiser, i) => (
                    <li key={fundraiser._id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <FundraiserCard fundraiser={fundraiser} rank={i + 1} locale={locale} t={t} />
                    </li>
                  ))}
            </ul>
          )}
        </div>

        <GeneralDonation
          t={t}
          locale={locale}
          fundraisers={state.status === 'ready' ? state.fundraisers : []}
        />
      </div>
    </section>
  );
}
