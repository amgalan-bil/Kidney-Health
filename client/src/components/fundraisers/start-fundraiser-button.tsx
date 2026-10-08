'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/components/account/account-provider';

/**
 * Fundraisers go to their own page. Everyone else goes to /me, which offers to
 * start one (via sign-up first when signed out).
 */
export function StartFundraiserButton({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { account, status } = useAccount();
  if (status === 'loading') return null;

  return (
    <Button asChild>
      <Link href={account ? `/${locale}/me` : `/${locale}/sign-up?next=${encodeURIComponent(`/${locale}/me`)}`}>
        {account?.isFundraiser ? t.fundraisers.myPage : t.fundraisers.start}
        <ArrowRight />
      </Link>
    </Button>
  );
}
