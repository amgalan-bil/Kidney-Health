'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ApiError, getFundraiser, isFundraiserId, type Fundraiser } from '@/lib/api';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fill, formatMnt, formatPercent, progressPercent } from '@/lib/utils';
import { PageIntro } from '@/components/page-intro';
import { useAccount } from '@/components/account/account-provider';
import { DonateCard } from '@/components/donate/donate-card';
import { DonationList } from './donation-list';
import { GoalEditor } from './goal-editor';
import { InitialAvatar, ProgressBar } from './fundraiser-card';

type State =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error' }
  | { status: 'ready'; fundraiser: Fundraiser };

export function FundraiserProfile({ id, locale, t }: { id: string; locale: Locale; t: Dictionary }) {
  const { account } = useAccount();
  const [state, setState] = useState<State>(isFundraiserId(id) ? { status: 'loading' } : { status: 'not-found' });
  const [donationsKey, setDonationsKey] = useState(0);

  const load = useCallback(async () => {
    if (!isFundraiserId(id)) return;
    try {
      const { user } = await getFundraiser(id);
      setState({ status: 'ready', fundraiser: user });
    } catch (error) {
      setState({ status: error instanceof ApiError && error.status === 404 ? 'not-found' : 'error' });
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const back = (
    <Link
      href={`/${locale}/fundraisers`}
      className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/60 transition hover:text-white"
    >
      <ArrowLeft className="size-4" />
      {t.profile.back}
    </Link>
  );

  if (state.status !== 'ready') {
    return (
      <PageIntro className="min-h-[70svh]">
        {back}
        {state.status === 'loading' ? (
          <div aria-hidden className="mt-10 flex animate-pulse items-center gap-5">
            <span className="size-20 rounded-3xl bg-white/10" />
            <span className="h-10 w-64 rounded-full bg-white/10" />
          </div>
        ) : (
          <p className="font-display mt-10 text-3xl font-extrabold">
            {state.status === 'not-found' ? t.profile.notFound : t.profile.loadError}
          </p>
        )}
      </PageIntro>
    );
  }

  const { fundraiser } = state;
  const isOwn = account?.userId === fundraiser._id;
  const percent = progressPercent(fundraiser.totalDonatedAmount, fundraiser.goal);

  return (
    <>
      <PageIntro>
        {back}
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="eyebrow text-teal">{t.profile.eyebrow}</p>
            <div className="mt-5 flex items-center gap-5">
              <InitialAvatar name={fundraiser.name} className="size-16 rounded-3xl bg-coral text-2xl text-white sm:size-20 sm:text-3xl" />
              <h1 className="font-display min-w-0 text-4xl leading-[1.05] font-extrabold tracking-tight break-words sm:text-5xl">
                {fundraiser.name}
              </h1>
            </div>
            <div className="mt-10 max-w-xl">
              <div className="flex items-end justify-between gap-4">
                <p className="font-display text-4xl font-extrabold text-teal tabular-nums sm:text-5xl">
                  {formatMnt(fundraiser.totalDonatedAmount)}
                </p>
                <p className="font-display text-2xl font-extrabold text-white/80 tabular-nums">{formatPercent(percent)}</p>
              </div>
              <div className="mt-4">
                <ProgressBar percent={percent} tone="dark" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white/60 tabular-nums">
                {fill(t.fundraisers.goal, { amount: formatMnt(fundraiser.goal) })}
              </p>
            </div>
          </div>
          {isOwn && (
            <GoalEditor
              goal={fundraiser.goal}
              t={t}
              onSaved={(goal) => setState({ status: 'ready', fundraiser: { ...fundraiser, goal } })}
            />
          )}
        </div>
      </PageIntro>

      <section className="bg-cream py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="h-fit rounded-[2rem] bg-paper p-6 shadow-[0_40px_90px_-50px_rgb(23_43_58/0.5)] ring-1 ring-ink/5 sm:p-10">
            <h2 className="font-display text-2xl font-extrabold text-ink">
              {fill(t.profile.support, { name: fundraiser.name })}
            </h2>
            <p className="mt-1.5 text-ink-muted">{fill(t.profile.supportLead, { name: fundraiser.name })}</p>
            <div className="mt-7">
              <DonateCard
                t={t}
                locale={locale}
                fundraiser={{ id: fundraiser._id, name: fundraiser.name }}
                onPaid={() => {
                  void load();
                  setDonationsKey((key) => key + 1);
                }}
              />
            </div>
          </div>

          <DonationList fundraiserId={fundraiser._id} refreshKey={donationsKey} locale={locale} t={t} />
        </div>
      </section>
    </>
  );
}
