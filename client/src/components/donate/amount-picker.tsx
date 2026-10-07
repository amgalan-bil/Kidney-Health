'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

/** Preset amount chips plus a free-form "other amount" field. */
export function AmountPicker({
  label,
  presets,
  format,
  selected,
  custom,
  customLabel,
  customPlaceholder,
  currencySymbol,
  onSelect,
  onCustomChange,
}: {
  label: string;
  presets: number[];
  format: (amount: number) => string;
  selected: number | null;
  custom: string;
  customLabel: string;
  customPlaceholder: string;
  currencySymbol: string;
  onSelect: (amount: number) => void;
  onCustomChange: (value: string) => void;
}) {
  const customId = useId();

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">{label}</legend>
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {presets.map((amount) => {
          const active = !custom && selected === amount;
          return (
            <button
              key={amount}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(amount)}
              className={cn(
                'h-12 rounded-xl border text-base font-bold tabular-nums transition-all duration-200',
                active
                  ? 'border-teal bg-teal text-white shadow-[0_10px_24px_-12px_rgb(40_150_143/0.8)]'
                  : 'border-input bg-white text-ink hover:border-teal/60',
              )}
            >
              {format(amount)}
            </button>
          );
        })}
      </div>
      <label htmlFor={customId} className="sr-only">
        {customLabel}
      </label>
      <div className="relative mt-2.5">
        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 font-bold text-ink/40">
          {currencySymbol}
        </span>
        <Input
          id={customId}
          inputMode="numeric"
          autoComplete="off"
          placeholder={customPlaceholder}
          value={custom}
          onChange={(e) => onCustomChange(e.target.value)}
          className={cn('pl-9 font-semibold tabular-nums', custom && 'border-teal')}
        />
      </div>
    </fieldset>
  );
}

/** Keeps digits (and, when allowed, one decimal point) and adds thousands separators. */
export function sanitizeAmount(raw: string, allowDecimals: boolean) {
  let cleaned = raw.replace(allowDecimals ? /[^\d.]/g : /\D/g, '');
  if (allowDecimals) {
    const [whole, ...rest] = cleaned.split('.');
    cleaned = rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
  }
  const [whole, fraction] = cleaned.split('.');
  const grouped = whole.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction !== undefined ? `${grouped}.${fraction}` : grouped;
}

export function parseAmount(value: string) {
  return Number(value.replace(/,/g, ''));
}
