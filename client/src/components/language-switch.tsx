'use client';

import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

const short: Record<Locale, string> = { en: 'EN', mn: 'MN' };
const full: Record<Locale, string> = { en: 'English', mn: 'Монгол' };

/** Switches between /en and /mn on the same page, keeping the reader's place. */
export function LanguageSwitch({
  locale,
  label,
  tone = 'light',
}: {
  locale: Locale;
  label: string;
  tone?: 'light' | 'dark';
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex items-center rounded-full p-1 text-xs font-bold transition-colors',
        tone === 'light' ? 'bg-ink/[0.06]' : 'bg-white/10',
      )}
    >
      {locales.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            lang={option}
            aria-pressed={active}
            title={full[option]}
            onClick={() => {
              if (active) return;
              const rest = pathname.split('/').slice(2).join('/');
              const { search, hash } = window.location;
              router.push(`/${option}${rest ? `/${rest}` : ''}${search}${hash}`, { scroll: false });
            }}
            className={cn(
              'rounded-full px-3 py-1.5 tracking-wide transition-all duration-300',
              active
                ? tone === 'light'
                  ? 'bg-ink text-white shadow-sm'
                  : 'bg-white text-navy shadow-sm'
                : tone === 'light'
                  ? 'text-ink/60 hover:text-ink'
                  : 'text-white/60 hover:text-white',
            )}
          >
            {short[option]}
          </button>
        );
      })}
    </div>
  );
}
