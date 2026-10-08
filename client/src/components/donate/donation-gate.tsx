'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { Check, Copy, Loader2, Share2 } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useAccount } from '@/components/account/account-provider';

/**
 * Anyone can donate, signed in or not. The one exception is a fundraiser on
 * their own page, who gets a nudge to share it instead. While the session is
 * still being checked this shows a placeholder, so the donation form never
 * flashes up and then disappears underneath them.
 */
export function DonationGate({
  fundraiserId,
  ownCopy,
  children,
}: {
  /** The fundraiser being given to, so we can spot someone on their own page. */
  fundraiserId?: string;
  ownCopy?: Dictionary['profile']['own'];
  children: ReactNode;
}) {
  const { account, status } = useAccount();

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

  return <>{children}</>;
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
