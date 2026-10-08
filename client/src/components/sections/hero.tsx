import { ArrowDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Reveal } from '@/components/reveal';
import { Button } from '@/components/ui/button';

export function Hero({ t, locale }: { t: Dictionary; locale: Locale }) {
  return (
    <section id="top" className="relative isolate overflow-hidden bg-navy text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_85%_20%,rgb(40_150_143/0.18),transparent_60%),radial-gradient(50rem_36rem_at_10%_100%,rgb(226_112_95/0.12),transparent_60%)]"
      />

      <div className="mx-auto grid min-h-[75svh] max-w-6xl items-center gap-10 px-5 pt-24 pb-14 sm:px-8 lg:grid-cols-[1.75fr_1fr] lg:pt-20">
        <div>
          <Reveal as="p" className="eyebrow text-teal">
            {t.hero.eyebrow}
          </Reveal>
          <Reveal
            as="h1"
            delay={120}
            className="font-display mt-6 text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl lg:text-[3.4rem] xl:text-[4.1rem]"
          >
            {t.hero.titleLine1}
            <br />
            {t.hero.titleLine2}
          </Reveal>
          <Reveal as="p" delay={240} className="mt-5 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl">
            {t.hero.lead}
          </Reveal>
          <Reveal delay={340} className="mt-7 h-1 w-28 rounded-full bg-coral" />
          <Reveal as="p" delay={400} className="eyebrow mt-5 text-teal">
            {t.hero.goal}
          </Reveal>
          <Reveal delay={500} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <a href="#donate">
                {t.hero.donate}
                <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white">
              <Link href={`/${locale}/learn`}>{t.hero.learn}</Link>
            </Button>
          </Reveal>
          <Reveal as="p" delay={600} className="mt-8 max-w-md text-sm leading-relaxed text-white/50">
            {t.hero.partner}
          </Reveal>
        </div>

        <Reveal delay={250} className="order-first mx-auto w-full max-w-48 sm:max-w-64 lg:order-none lg:max-w-xs">
          <CareMark label={t.hero.care} />
        </Reveal>
      </div>

      <a
        href="#fundraisers"
        aria-label={t.nav.fundraisers}
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/15 p-2.5 text-white/60 transition hover:border-white/40 hover:text-white sm:block"
      >
        <ArrowDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}

/** The deck's cover mark: a teal wedge over a coral circle. */
function CareMark({ label }: { label: string }) {
  return (
    <div className="relative aspect-square w-full">
      <svg viewBox="0 0 400 400" aria-hidden className="absolute inset-0 size-full">
        <circle cx="200" cy="185" r="185" fill="none" stroke="white" strokeOpacity="0.05" />
        <circle cx="200" cy="185" r="140" fill="none" stroke="white" strokeOpacity="0.07" strokeDasharray="2 8" />
      </svg>
      <div className="animate-breathe absolute top-[27%] left-[18%] size-[58%] rounded-full bg-coral shadow-[0_50px_100px_-40px_rgb(226_112_95/0.8)]" />
      <svg
        viewBox="0 0 100 100"
        aria-hidden
        className="animate-float absolute top-[4%] left-[46%] size-[44%] drop-shadow-[0_20px_40px_rgb(0_0_0/0.25)]"
      >
        <path d="M0 100 L14 0 A100 100 0 0 1 100 86 Z" fill="var(--color-teal)" fillOpacity="0.92" />
      </svg>
      <p className="font-display absolute inset-x-0 bottom-0 text-center text-3xl font-extrabold tracking-[0.08em] sm:text-4xl">
        {label}
      </p>
    </div>
  );
}
