'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LanguageSwitch } from '@/components/language-switch';
import { AuthControls } from '@/components/account/auth-controls';

export function SiteHeader({ locale, t }: { locale: Locale; t: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > Math.min(window.innerHeight * 0.75, 320));
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const home = `/${locale}`;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
        scrolled
          ? 'bg-cream/80 text-ink shadow-[0_1px_0_rgb(23_43_58/0.08)] backdrop-blur-xl'
          : 'bg-transparent text-white',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href={home} className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-coral text-white">
            <HeartPulse className="size-4" />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="font-display block truncate text-sm font-extrabold">{t.brand}</span>
            <span
              className={cn(
                'block truncate text-[11px] font-medium transition-colors',
                scrolled ? 'text-ink-muted' : 'text-white/60',
              )}
            >
              {t.brandSub}
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitch locale={locale} label={t.nav.switchLabel} tone={scrolled ? 'light' : 'dark'} />
          <AuthControls locale={locale} t={t} />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={`${home}#fundraisers`}>{t.nav.donate}</Link>
          </Button>
        </div>
      </div>
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-0.5 origin-left bg-coral transition-opacity duration-500"
        style={{ width: '100%', transform: `scaleX(${progress})`, opacity: scrolled ? 1 : 0 }}
      />
    </header>
  );
}
