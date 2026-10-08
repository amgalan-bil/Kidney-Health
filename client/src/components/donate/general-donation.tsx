'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import type { Fundraiser } from '@/lib/api';
import { fill } from '@/lib/utils';
import { Reveal } from '@/components/reveal';
import { useAccount } from '@/components/account/account-provider';
import { DonateCard } from './donate-card';

const GENERAL = '';

/**
 * Donate from the landing page without opening a fundraiser first: pick a
 * student from the list, or leave it on the general fund.
 */
export function GeneralDonation({
  t,
  locale,
  fundraisers,
}: {
  t: Dictionary;
  locale: Locale;
  fundraisers: Fundraiser[];
}) {
  const { account } = useAccount();
  const [recipientId, setRecipientId] = useState(GENERAL);
  const copy = t.generalDonation;

  // You can't give to your own fundraiser, so don't offer it.
  const options = fundraisers.filter((fundraiser) => fundraiser._id !== account?.userId);
  const chosen = options.find((fundraiser) => fundraiser._id === recipientId);

  return (
    <Reveal id="donate" className="mx-auto mt-16 scroll-mt-24 max-w-2xl rounded-[2rem] bg-cream p-6 shadow-[0_40px_90px_-50px_rgb(23_43_58/0.5)] ring-1 ring-ink/5 sm:p-10">
      <p className="eyebrow text-teal">{copy.eyebrow}</p>
      <h3 className="font-display mt-3 text-2xl font-extrabold text-ink sm:text-3xl">{copy.title}</h3>
      <p className="mt-2 leading-relaxed text-ink-muted">{copy.lead}</p>

      <label className="mt-7 block">
        <span className="text-sm font-semibold text-ink">{copy.recipientLabel}</span>
        <span className="relative mt-2 block">
          <select
            value={recipientId}
            onChange={(event) => setRecipientId(event.target.value)}
            className="h-12 w-full appearance-none rounded-xl border border-input bg-white pr-11 pl-4 text-base text-ink shadow-[0_1px_2px_rgb(23_43_58/0.04)] transition-[border-color,box-shadow] outline-none focus-visible:border-teal focus-visible:ring-4 focus-visible:ring-teal/15"
          >
            <option value={GENERAL}>{copy.general}</option>
            {options.length > 0 && (
              <optgroup label={copy.studentsGroup}>
                {options.map((fundraiser) => (
                  <option key={fundraiser._id} value={fundraiser._id}>
                    {fundraiser.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted" />
        </span>
      </label>
      <p className="mt-2 text-sm text-ink-muted">
        {chosen ? fill(copy.fundraiserNote, { name: chosen.name }) : copy.generalNote}
      </p>

      <div className="mt-8 rounded-[1.5rem] bg-paper p-5 sm:p-7">
        {/* Keyed so switching recipient starts a fresh form rather than reusing an invoice. */}
        <DonateCard
          key={recipientId}
          t={t}
          locale={locale}
          fundraiser={chosen ? { id: chosen._id, name: chosen.name } : undefined}
        />
      </div>
    </Reveal>
  );
}
