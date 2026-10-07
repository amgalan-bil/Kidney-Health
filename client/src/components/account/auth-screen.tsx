import type { ReactNode } from 'react';
import { PageIntro } from '@/components/page-intro';

/** Two-column layout for the account pages: campaign copy beside the form. */
export function AuthScreen({ title, lead, eyebrow, children }: { title: string; lead: string; eyebrow: string; children: ReactNode }) {
  return (
    <PageIntro className="min-h-svh">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
        <div className="max-w-lg">
          <p className="eyebrow text-teal">{eyebrow}</p>
          <h1 className="font-display mt-5 text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">{title}</h1>
          <div className="mt-8 h-1 w-28 rounded-full bg-coral" />
          <p className="mt-8 text-lg leading-relaxed text-white/70">{lead}</p>
        </div>
        <div className="flex justify-center lg:justify-end">{children}</div>
      </div>
    </PageIntro>
  );
}
