import { Target } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { CountUp } from '@/components/count-up';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from './section-heading';

const statColors = ['text-teal', 'text-coral', 'text-ink'];

export function Why({ t }: { t: Dictionary }) {
  return (
    <section id="why" className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} lead={t.why.lead} />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {t.why.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 140} className="border-t border-ink/10 pt-5">
              <p
                className={`font-display text-4xl font-extrabold tracking-tight whitespace-nowrap lg:text-5xl ${statColors[i]}`}
              >
                {stat.countUp ? <CountUp value={stat.value} /> : stat.value}
              </p>
              <p className="mt-3 max-w-xs text-base leading-relaxed text-ink/80">{stat.label}</p>
            </Reveal>
          ))}
        </div>

        <Reveal
          delay={120}
          className="mt-8 flex flex-col gap-3 rounded-2xl bg-teal-soft px-6 py-5 sm:flex-row sm:items-center sm:gap-8 sm:px-8"
        >
          <div className="flex shrink-0 items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-teal text-white">
              <Target className="size-5" />
            </span>
            <span className="eyebrow text-teal">{t.why.goalLabel}</span>
          </div>
          <p className="font-display text-lg leading-snug font-bold text-balance text-ink sm:text-xl">
            {t.why.goal}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
