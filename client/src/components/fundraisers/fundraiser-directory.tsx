'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { fill } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FundraiserCard, FundraiserCardSkeleton } from './fundraiser-card';
import { useFundraisers } from './use-fundraisers';

const PER_PAGE = 18;

export function FundraiserDirectory({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [page, setPage] = useState(1);
  const state = useFundraisers(page, PER_PAGE);
  const totalPages = state.status === 'ready' ? state.pagination.totalPages : 1;

  const goTo = (next: number) => {
    setPage(next);
    document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="directory" className="scroll-mt-24">
      {state.status === 'error' && <p className="text-ink-muted">{t.fundraisers.error}</p>}
      {state.status === 'ready' && state.fundraisers.length === 0 && (
        <p className="text-ink-muted">{t.fundraisers.empty}</p>
      )}
      {state.status !== 'error' && (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {state.status === 'loading'
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i}>
                  <FundraiserCardSkeleton />
                </li>
              ))
            : state.fundraisers.map((fundraiser, i) => (
                <li key={fundraiser._id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <FundraiserCard fundraiser={fundraiser} rank={(page - 1) * PER_PAGE + i + 1} locale={locale} t={t} />
                </li>
              ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-4">
          <Button variant="outline" size="sm" className="text-ink" disabled={page <= 1} onClick={() => goTo(page - 1)}>
            <ArrowLeft />
            {t.fundraisersPage.prev}
          </Button>
          <span className="text-sm font-semibold text-ink-muted tabular-nums">
            {fill(t.fundraisersPage.page, { page: String(page), total: String(totalPages) })}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="text-ink"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
          >
            {t.fundraisersPage.next}
            <ArrowRight />
          </Button>
        </nav>
      )}
    </div>
  );
}
