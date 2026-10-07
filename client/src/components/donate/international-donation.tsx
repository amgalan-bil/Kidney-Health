import { ExternalLink, Lock } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { DONORBOX_URL } from '@/lib/i18n/config';
import { Button } from '@/components/ui/button';

/** Card donations from abroad go through the campaign's Donorbox page. */
export function InternationalDonation({ copy }: { copy: Dictionary['international'] }) {
  return (
    <div className="space-y-6">
      <Button asChild size="lg" className="w-full">
        <a href={DONORBOX_URL} target="_blank" rel="noopener noreferrer">
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
