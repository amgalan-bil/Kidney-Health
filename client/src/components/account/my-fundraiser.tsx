'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { PageIntro } from '@/components/page-intro';
import { useAccount } from './account-provider';

export function MyFundraiser({ locale, t }: { locale: Locale; t: Dictionary }) {
  const router = useRouter();
  const { account, status, reload } = useAccount();

  useEffect(() => {
    if (account) router.replace(`/${locale}/profile/${account.userId}`);
  }, [account, locale, router]);

  useEffect(() => {
    // Nobody is signed in on this browser: send them to sign in, then back here.
    if (status === 'signed-out') {
      router.replace(`/${locale}/sign-in?next=${encodeURIComponent(`/${locale}/me`)}`);
    }
  }, [status, locale, router]);

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
