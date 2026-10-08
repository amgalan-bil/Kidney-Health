'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { PageIntro } from '@/components/page-intro';
import { useAccount } from './account-provider';

/**
 * Fundraisers are sent on to their own page. Anyone who hasn't started one is
 * offered the choice here rather than being given a page automatically.
 */
export function MyFundraiser({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const { account, status, reload, startFundraiser } = useAccount();
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(false);

  useEffect(() => {
    if (account?.isFundraiser) router.replace(`/${locale}/profile/${account.userId}`);
  }, [account, locale, router]);

  useEffect(() => {
    // Nobody is signed in on this browser: send them to sign in, then back here.
    if (status === 'signed-out') {
      router.replace(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/me`)}`);
    }
  }, [status, locale, router]);

  async function handleStart() {
    setStarting(true);
    setStartError(false);
    try {
      // The account now has isFundraiser set, so the effect above moves them on.
      await startFundraiser();
    } catch {
      setStartError(true);
      setStarting(false);
    }
  }

  if (account && !account.isFundraiser) {
    const copy = t.me.offer;
    return (
      <PageIntro className="min-h-svh">
        <div className="max-w-xl">
          <p className="font-display text-3xl font-extrabold">{copy.title}</p>
          <p className="mt-4 text-lg leading-relaxed text-white/80">{copy.body}</p>
          {startError && (
            <p role="alert" className="mt-6 rounded-xl bg-coral-soft px-4 py-3 text-sm font-medium text-destructive">
              {copy.error}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => void handleStart()} disabled={starting}>
              {starting && <Loader2 className="animate-spin" />}
              {copy.start}
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white">
              <Link href={`/${locale}`}>{copy.notNow}</Link>
            </Button>
          </div>
        </div>
      </PageIntro>
    );
  }

  return (
    <PageIntro className="min-h-svh">
      {status === 'error' ? (
        <div className="max-w-md">
          <p className="font-display text-3xl font-extrabold">{t.me.error}</p>
          <Button className="mt-8" onClick={() => void reload()}>
            {t.me.retry}
          </Button>
        </div>
      ) : (
        <p className="flex items-center gap-3 text-lg font-semibold text-white/80" aria-live="polite">
          <Loader2 className="size-5 animate-spin text-teal" />
          {t.me.loading}
        </p>
      )}
    </PageIntro>
  );
}
