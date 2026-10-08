'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { listDonations, type Donation, type Page } from '@/lib/api';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fill, formatMoney } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { InitialAvatar } from './fundraiser-card';

const PER_PAGE = 8;

/** Paid donations to one fundraiser, newest first. `refreshKey` reloads after a new donation. */
export function DonationList({
  fundraiserId,
  refreshKey,
  locale,
  t,
}: {
  fundraiserId: string;
  refreshKey: number;
  locale: Locale;
  t: Dictionary;
}) {
  const [page, setPage] = useState(1);
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'error' } | { status: 'ready'; donations: Donation[]; pagination: Page }
  >({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    listDonations(fundraiserId, page, PER_PAGE)
      .then(({ donors, pagination }) => {
        if (!cancelled) setState({ status: 'ready', donations: donors, pagination });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [fundraiserId, page, refreshKey]);

  const dateFormat = new Intl.DateTimeFormat(locale === 'mn' ? 'mn-MN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div>
      <h2 className="font-display text-2xl font-extrabold text-ink">{t.profile.donations}</h2>

      {state.status === 'error' && <p className="mt-6 text-ink-muted">{t.profile.loadError}</p>}
      {state.status === 'loading' && (
        <ul aria-hidden className="mt-6 space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="h-20 animate-pulse rounded-2xl bg-paper" />
          ))}
        </ul>
      )}
      {state.status === 'ready' && state.donations.length === 0 && (
        <p className="mt-6 rounded-2xl bg-paper p-6 text-ink-muted">{t.profile.noDonations}</p>
      )}
      {state.status === 'ready' && state.donations.length > 0 && (
        <ul className="mt-6 space-y-3">
          {state.donations.map((donation) => (
            <li
              key={donation._id}
              className="animate-in fade-in flex gap-4 rounded-2xl bg-paper p-5 ring-1 ring-ink/5 duration-500"
            >
              <InitialAvatar name={donation.name || t.profile.anonymous} className="size-10 rounded-xl text-base" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-semibold text-ink">{donation.name || t.profile.anonymous}</p>
                  <p className="font-display shrink-0 font-extrabold text-teal tabular-nums">
                    {formatMoney(donation.amount, locale)}
                  </p>
                </div>
                {donation.message && (
                  <p className="mt-1.5 flex gap-2 leading-relaxed text-ink/75">
                    <MessageCircle className="mt-1 size-3.5 shrink-0 text-ink/35" />
                    <span className="break-words">{donation.message}</span>
                  </p>
                )}
                <p className="mt-1.5 text-xs text-ink-muted">{dateFormat.format(new Date(donation.createdAt))}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {state.status === 'ready' && state.pagination.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="text-ink" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ArrowLeft />
            {t.fundraisersPage.prev}
          </Button>
          <span className="text-sm font-semibold text-ink-muted tabular-nums">
            {fill(t.fundraisersPage.page, { page: String(page), total: String(state.pagination.totalPages) })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-ink"
            disabled={page >= state.pagination.totalPages}
            onClick={() => setPage(page + 1)}
          >
            {t.fundraisersPage.next}
            <ArrowRight />
          </Button>
        </nav>
      )}
    </div>
  );
}
