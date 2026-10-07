import { Sparkles, Users } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from './section-heading';

export function Campaign({ t }: { t: Dictionary }) {
  const points = [
    { icon: Users, title: t.campaign.whoTitle, body: t.campaign.who },
    { icon: Sparkles, title: t.campaign.howTitle, body: t.campaign.how },
  ];

  return (
    <section id="campaign" className="overflow-hidden bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
          <div>
            <SectionHeading eyebrow={t.campaign.eyebrow} title={t.campaign.title} lead={t.campaign.lead} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {points.map(({ icon: Icon, title, body }, i) => (
                <Reveal
                  key={title}
                  delay={180 + i * 140}
                  className="rounded-2xl bg-paper p-5 shadow-[0_1px_0_rgb(23_43_58/0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-coral-soft text-coral">
                      <Icon className="size-4" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
                  </div>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{body}</p>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={100} className="relative mx-auto aspect-square w-full max-w-52 lg:w-64 lg:max-w-none">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-teal/10 [animation-duration:3.5s]" />
            <span aria-hidden className="absolute -inset-4 rounded-full border border-teal/20" />
            <span aria-hidden className="absolute -inset-9 rounded-full border border-dashed border-teal/15" />
            <div className="relative grid size-full place-items-center rounded-full bg-teal text-white shadow-[0_50px_90px_-40px_rgb(40_150_143/0.9)]">
              <div className="text-center">
                <p className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
                  {t.campaign.circleValue}
                </p>
                <p className="eyebrow mt-3 text-white/85">{t.campaign.circleLabel}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
