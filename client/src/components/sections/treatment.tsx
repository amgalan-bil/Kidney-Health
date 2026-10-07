import type { Dictionary } from '@/lib/i18n';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from './section-heading';

export function Treatment({ t }: { t: Dictionary }) {
  return (
    <section id="treatment" className="bg-paper py-12 sm:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={t.hemo.eyebrow} title={t.hemo.title} lead={t.hemo.body} />

          <ol className="mt-6 space-y-3">
            {t.hemo.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i * 120} className="flex items-center gap-4">
                <span className="font-display grid size-8 shrink-0 place-items-center rounded-full bg-teal-soft text-xs font-extrabold text-teal">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="font-display font-bold text-ink">{step.title}</p>
              </Reveal>
            ))}
          </ol>

          <Reveal as="p" delay={380} className="font-display mt-6 text-lg font-bold text-teal">
            {t.practice.callout}
          </Reveal>
        </div>

        <Reveal delay={200}>
          <DialysisLoop labels={t.practice.diagram} caption={t.hemo.banner} />
        </Reveal>
      </div>
    </section>
  );
}

/** Animated diagram of the dialysis circuit: blood leaves the patient, is filtered, and returns. */
function DialysisLoop({ labels, caption }: { labels: Dictionary['practice']['diagram']; caption: string }) {
  const fibers = Array.from({ length: 5 }, (_, i) => 358 + i * 11);
  return (
    <figure className="relative overflow-hidden rounded-[2rem] bg-navy p-6 shadow-[0_40px_80px_-40px_rgb(21_41_58/0.6)] sm:p-8">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(30rem_20rem_at_80%_0%,rgb(40_150_143/0.2),transparent_70%)]"
      />
      <svg viewBox="0 0 480 360" role="img" aria-label={`${labels.patient} → ${labels.dialyzer} → ${labels.patient}`} className="relative w-full">
        {/* tracks */}
        <path d="M150 150 C 220 55, 290 55, 345 150" fill="none" stroke="var(--color-coral)" strokeOpacity="0.2" strokeWidth="10" strokeLinecap="round" />
        <path d="M345 210 C 290 305, 220 305, 150 210" fill="none" stroke="var(--color-teal)" strokeOpacity="0.25" strokeWidth="10" strokeLinecap="round" />
        {/* moving blood */}
        <path className="animate-flow" d="M150 150 C 220 55, 290 55, 345 150" fill="none" stroke="var(--color-coral)" strokeWidth="5" strokeLinecap="round" strokeDasharray="12 20" />
        <path className="animate-flow" d="M345 210 C 290 305, 220 305, 150 210" fill="none" stroke="var(--color-teal)" strokeWidth="5" strokeLinecap="round" strokeDasharray="12 20" />

        {/* patient */}
        <circle cx="105" cy="180" r="62" fill="#1f384b" stroke="white" strokeOpacity="0.1" />
        <circle className="animate-breathe" style={{ transformOrigin: '105px 180px' }} cx="105" cy="180" r="34" fill="var(--color-coral)" />
        <path
          transform="translate(93 168)"
          d="M12 21s-7.5-4.6-10-9.1C.2 8.4 2.4 4 6.6 4c2.3 0 3.9 1.2 5.4 3.2C13.5 5.2 15.1 4 17.4 4c4.2 0 6.4 4.4 4.6 7.9C19.5 16.4 12 21 12 21Z"
          fill="white"
        />

        {/* dialyzer */}
        <rect x="345" y="110" width="66" height="140" rx="18" fill="var(--color-teal)" fillOpacity="0.14" stroke="var(--color-teal)" strokeWidth="2" />
        {fibers.map((x) => (
          <line key={x} x1={x} y1="128" x2={x} y2="232" stroke="var(--color-teal)" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" />
        ))}

        <g fill="white" fontFamily="var(--font-display)" fontWeight="700" textAnchor="middle">
          <text x="105" y="272" fontSize="16">{labels.patient}</text>
          <text x="378" y="282" fontSize="16">{labels.dialyzer}</text>
        </g>
        <g fontFamily="var(--font-sans)" fontWeight="600" textAnchor="middle" fontSize="14">
          <text x="248" y="62" fill="var(--color-coral)">{labels.out}</text>
          <text x="248" y="318" fill="var(--color-teal)">{labels.back}</text>
        </g>
      </svg>
      <figcaption className="font-display relative mt-4 border-t border-white/10 pt-5 text-center text-lg leading-snug font-bold text-balance text-white">
        {caption}
      </figcaption>
    </figure>
  );
}
