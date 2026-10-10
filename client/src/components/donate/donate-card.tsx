'use client';

import { useState } from 'react';
import { defaultRegionFor, type Region } from '@/lib/i18n/config';
import type { Dictionary, Locale } from '@/lib/i18n';
import { RegionSwitch } from './region-switch';
import { InternationalDonation } from './international-donation';
import { QPayDonation, type Recipient } from './qpay-donation';
import { DonationGate } from './donation-gate';

/**
 * The donation panel. Given a fundraiser, gifts count toward their goal;
 * without one they go to the campaign as a whole.
 */
export function DonateCard({
  t,
  locale,
  fundraiser,
  onPaid,
}: {
  t: Dictionary;
  locale: Locale;
  fundraiser?: Recipient;
  onPaid?: () => void;
}) {
  const [region, setRegion] = useState<Region>(defaultRegionFor[locale]);
  const copy = region === 'international' ? t.international : t.qpay;

  return (
    <DonationGate fundraiserId={fundraiser?.id} ownCopy={t.profile.own}>
      <RegionSwitch
        value={region}
        label={t.donate.regionLabel}
        onChange={setRegion}
        options={{
          international: { title: t.donate.regionInternational, sub: t.donate.regionInternationalSub },
          mongolia: { title: t.donate.regionMongolia, sub: t.donate.regionMongoliaSub },
        }}
      />

      <div className="mt-8 border-t border-ink/[0.08] pt-8">
        <h3 className="font-display text-2xl font-extrabold text-ink">{copy.title}</h3>
        <p className="mt-1.5 text-ink-muted">{copy.subtitle}</p>
        <div key={region} className="animate-in fade-in mt-7 duration-500">
          {region === 'international' ? (
            <InternationalDonation copy={t.international} fundraiser={fundraiser} />
          ) : (
            <QPayDonation copy={t.qpay} fundraiser={fundraiser} onPaid={onPaid} />
          )}
        </div>
      </div>
    </DonationGate>
  );
}
