import Link from 'next/link';
import type { Fundraiser } from '@/lib/api';
import type { Dictionary, Locale } from '@/lib/i18n';
import { cn, fill, formatMoney, formatPercent, progressPercent } from '@/lib/utils';

export function InitialAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'font-display grid size-12 shrink-0 place-items-center rounded-2xl bg-coral-soft text-lg font-extrabold text-coral',
        className,
      )}
    >
      {name.trim().charAt(0).toUpperCase() || '?'}
    </span>
  );
}

/**
 * Any progress at all is worth seeing, so a non-zero amount is floored at a
 * visible sliver rather than a hairline. The label beside the bar carries the
 * exact figure; this is only the shape of it.
 */
const MIN_VISIBLE_PERCENT = 2.5;

export function ProgressBar({ percent, tone = 'light' }: { percent: number; tone?: 'light' | 'dark' }) {
  const width = percent > 0 ? Math.max(percent, MIN_VISIBLE_PERCENT) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={formatPercent(percent)}
      className={cn('h-2 overflow-hidden rounded-full', tone === 'light' ? 'bg-ink/[0.07]' : 'bg-white/10')}
    >
      <div
        className="h-full rounded-full bg-teal transition-[width] duration-1000 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function FundraiserCard({
  fundraiser,
  rank,
  locale,
  t,
}: {
  fundraiser: Fundraiser;
  rank: number;
  locale: Locale;
  t: Dictionary;
}) {
  const percent = progressPercent(fundraiser.totalDonatedAmount, fundraiser.goal);

  return (
    <Link
      href={`/${locale}/profile/${fundraiser._id}`}
      // One prefetch per card adds up as the list grows; hovering still prefetches.
      prefetch={false}
      className="group flex h-full flex-col rounded-3xl bg-paper p-7 ring-1 ring-ink/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-35px_rgb(23_43_58/0.35)]"
    >
      <div className="flex items-center gap-4">
        <InitialAvatar name={fundraiser.name} />
        <h3 className="font-display min-w-0 flex-1 truncate text-lg font-bold text-ink transition-colors group-hover:text-coral">
          {fundraiser.name}
        </h3>
        <span className="font-display text-sm font-extrabold text-teal">{String(rank).padStart(2, '0')}</span>
      </div>
      {fundraiser.description && (
        <p className="mt-5 line-clamp-2 text-sm leading-relaxed break-words text-ink-muted">{fundraiser.description}</p>
      )}
      <div className="mt-auto pt-7">
        <ProgressBar percent={percent} />
        <div className="mt-3 flex items-baseline justify-between gap-3 text-sm">
          <span className="font-semibold text-teal tabular-nums">
            {fill(t.fundraisers.raised, { amount: formatMoney(fundraiser.totalDonatedAmount, locale) })}
            <span className="ml-1.5 font-normal text-ink-muted">{formatPercent(percent)}</span>
          </span>
          <span className="text-ink-muted tabular-nums">
            {fill(t.fundraisers.goal, { amount: formatMoney(fundraiser.goal, locale) })}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function FundraiserCardSkeleton() {
  return (
    <div aria-hidden className="h-full animate-pulse rounded-3xl bg-paper p-7 ring-1 ring-ink/5">
      <div className="flex items-center gap-4">
        <span className="size-12 rounded-2xl bg-cream-deep" />
        <span className="h-4 w-32 rounded-full bg-cream-deep" />
      </div>
      <div className="mt-7 h-2 rounded-full bg-cream-deep" />
      <div className="mt-3 h-3 w-40 rounded-full bg-cream-deep" />
    </div>
  );
}
