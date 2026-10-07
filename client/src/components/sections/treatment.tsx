import Image from 'next/image';
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
          <DialysisEquipment labels={t.practice.equipment} caption={t.hemo.banner} />
        </Reveal>
      </div>
    </section>
  );
}

/** Photos of the equipment hemodialysis depends on: the machine itself and the water treatment that feeds it. */
function DialysisEquipment({ labels, caption }: { labels: Dictionary['practice']['equipment']; caption: string }) {
  return (
    <figure className="relative overflow-hidden rounded-[2rem] bg-navy p-4 shadow-[0_40px_80px_-40px_rgb(21_41_58/0.6)] sm:p-6">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(30rem_20rem_at_80%_0%,rgb(40_150_143/0.2),transparent_70%)]"
      />
      <div className="relative space-y-4">
        <EquipmentPhoto
          src="/images/hemodialysis-machine.jpg"
          width={1000}
          height={1000}
          alt={labels.machineAlt}
          label={labels.machine}
        />
        <EquipmentPhoto
          src="/images/hemodialysis-water-system.jpg"
          width={1638}
          height={680}
          alt={labels.waterAlt}
          label={labels.water}
        />
      </div>
      <figcaption className="font-display relative mt-5 border-t border-white/10 pt-5 text-center text-lg leading-snug font-bold text-balance text-white">
        {caption}
      </figcaption>
    </figure>
  );
}

function EquipmentPhoto({
  src,
  width,
  height,
  alt,
  label,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white">
      <Image
        src={src}
        width={width}
        height={height}
        alt={alt}
        sizes="(min-width: 1024px) 480px, 100vw"
        className="h-auto w-full"
      />
      <span className="font-display absolute bottom-3 left-3 rounded-full bg-navy/85 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        {label}
      </span>
    </div>
  );
}
