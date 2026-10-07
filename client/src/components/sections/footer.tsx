import { ArrowUp, HeartPulse } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { LanguageSwitch } from '@/components/language-switch';

export function Footer({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-coral">
                <HeartPulse className="size-5" />
              </span>
              <p className="font-display text-lg font-extrabold">{t.brand}</p>
            </div>
            <p className="mt-5 text-white/70">{t.footer.campaign}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/45">{t.footer.partner}</p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch locale={locale} label={t.nav.switchLabel} tone="dark" />
            <a
              href="#top"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <ArrowUp className="size-4" />
              {t.footer.top}
            </a>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 text-[11px] font-bold tracking-[0.18em] text-white/40 uppercase sm:flex-row sm:justify-between">
          <span>{t.footer.line}</span>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}
