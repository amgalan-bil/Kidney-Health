'use client';

import type { Region } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

const regions: Region[] = ['international', 'mongolia'];
const flags: Record<Region, string> = { international: '🌍', mongolia: '🇲🇳' };

/** International donors give by card through Donorbox; donors in Mongolia pay with QPay. */
export function RegionSwitch({
  value,
  label,
  options,
  onChange,
}: {
  value: Region;
  label: string;
  options: Record<Region, { title: string; sub: string }>;
  onChange: (region: Region) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="text-center text-sm font-semibold text-ink-muted">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-cream p-1.5">
        {regions.map((option) => {
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option)}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-300 sm:px-4',
                active ? 'bg-white shadow-[0_6px_20px_-10px_rgb(23_43_58/0.35)]' : 'hover:bg-white/50',
              )}
            >
              <span aria-hidden className={cn('hidden text-2xl transition sm:inline', !active && 'opacity-50 grayscale')}>
                {flags[option]}
              </span>
              <span className="min-w-0">
                <span className={cn('block font-bold', active ? 'text-ink' : 'text-ink/60')}>
                  {options[option].title}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-ink-muted">{options[option].sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
