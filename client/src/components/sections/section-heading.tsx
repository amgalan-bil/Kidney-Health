import { Reveal } from '@/components/reveal';
import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = 'light',
  align = 'left',
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  tone?: 'light' | 'dark';
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', 'max-w-3xl', className)}>
      <Reveal as="p" className="eyebrow text-teal">
        {eyebrow}
      </Reveal>
      <Reveal
        as="h2"
        delay={80}
        className={cn(
          'font-display mt-3 text-3xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-4xl',
          tone === 'dark' ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </Reveal>
      {lead && (
        <Reveal
          as="p"
          delay={160}
          className={cn(
            'mt-4 text-lg leading-relaxed text-pretty',
            tone === 'dark' ? 'text-white/65' : 'text-ink-muted',
          )}
        >
          {lead}
        </Reveal>
      )}
    </div>
  );
}
