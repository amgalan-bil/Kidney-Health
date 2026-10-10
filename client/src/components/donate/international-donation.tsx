import { ExternalLink, Lock } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { DONORBOX_URL } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';
import type { Recipient } from './qpay-donation';

/**
 * The Donorbox link, tagged with who the gift is for. Donorbox stores the UTM
 * fields on the donation, and the API reads utm_content back to credit that
 * student (server/controllers/donorboxController.js).
 */
function donorboxLink(fundraiser?: Recipient) {
  const url = new URL(DONORBOX_URL);
  url.searchParams.set('utm_source', 'hopebridge');
  if (fundraiser) url.searchParams.set('utm_content', fundraiser.id);
  return url.toString();
}

/** Card donations from abroad go through the campaign's Donorbox page. */
export function InternationalDonation({
  copy,
  fundraiser,
}: {
  copy: Dictionary['international'];
  /** Credit this student's total. Without it the gift goes to the campaign. */
  fundraiser?: Recipient;
}) {
  return (
    <div className="space-y-6">
      <Button asChild size="lg" className="w-full">
        <a href={donorboxLink(fundraiser)} target="_blank" rel="noopener noreferrer">
          {copy.button}
          <ExternalLink />
        </a>
      </Button>
      <p className="rounded-2xl bg-teal-soft/70 p-5 leading-relaxed text-ink/80">{copy.note}</p>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-muted">
        <Lock className="size-3.5 shrink-0" />
        {copy.secure}
      </p>
    </div>
  );
}
