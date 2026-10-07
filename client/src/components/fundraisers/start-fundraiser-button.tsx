'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/components/account/account-provider';

/** Signed out: go to sign-up. Signed in: go to their own fundraiser page. */
export function StartFundraiserButton({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { account, status } = useAccount();
  if (status === 'loading') return null;

  return (
    <Button asChild>
      <Link href={account ? `/${locale}/me` : `/${locale}/sign-up`}>
        {account ? t.fundraisers.myPage : t.fundraisers.start}
        <ArrowRight />
      </Link>
    </Button>
  );
}
