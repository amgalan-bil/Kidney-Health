'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Check, Copy, Loader2, LockKeyhole, Share2 } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/components/account/account-provider';

/**
 * Donations are only offered to signed-in people. While the session is still
 * being checked this shows a placeholder, so the donation form never flashes
 * up and then disappears underneath someone who is already signed in.
 */
export function DonationGate({
  copy,
  locale,
  fundraiserId,
  ownCopy,
  children,
}: {
  copy: Dictionary['donate']['gate'];
  locale: Locale;
  /** The fundraiser being given to, so we can spot someone on their own page. */
  fundraiserId?: string;
  ownCopy?: Dictionary['profile']['own'];
  children: ReactNode;
}) {
  const { account, status } = useAccount();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center gap-3 py-14 text-ink-muted" aria-live="polite">
        <Loader2 className="size-5 animate-spin text-teal" />
      </div>
    );
  }

  // Your own page: giving to yourself would inflate your total without raising
  // anything, so the panel becomes a nudge to share the page instead.
  if (account && ownCopy && fundraiserId && account.userId === fundraiserId) {
    return (
      <div className="animate-in fade-in py-4 text-center duration-500">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-coral-soft">
          <Share2 className="size-6 text-coral" />
        </span>
        <h3 className="font-display mt-6 text-xl font-extrabold text-ink">{ownCopy.title}</h3>
        <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink-muted">{ownCopy.body}</p>
        <CopyLinkButton label={ownCopy.copy} copied={ownCopy.copied} />
      </div>
    );
  }

  if (account) return <>{children}</>;

  // Send them back to whatever they were reading once they are signed in.
  const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';

  return (
    <div className="animate-in fade-in py-4 text-center duration-500">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-teal-soft">
        <LockKeyhole className="size-6 text-teal" />
      </span>
      <h3 className="font-display mt-6 text-xl font-extrabold text-ink">{copy.title}</h3>
      <p className="mx-auto mt-3 max-w-sm leading-relaxed text-ink-muted">{copy.body}</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild size="lg">
          <Link href={`/${locale}/sign-up${next}`}>{copy.signUp}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="text-ink">
          <Link href={`/${locale}/sign-in${next}`}>{copy.signIn}</Link>
        </Button>
      </div>
    </div>
  );
}

/** Copies the current page URL, so a student can share their own fundraiser. */
function CopyLinkButton({ label, copied }: { label: string; copied: string }) {
  const [done, setDone] = useState(false);

  return (
    <Button
      className="mt-8"
      size="lg"
      variant={done ? 'secondary' : 'default'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          // Clipboard blocked (insecure origin, or denied): leave the button as it was.
        }
      }}
    >
      {done ? <Check /> : <Copy />}
      {done ? copied : label}
    </Button>
  );
}
