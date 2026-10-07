import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Navy top band for inner pages, matching the home hero so the header reads the same everywhere. */
export function PageIntro({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section id="top" className={cn('relative isolate overflow-hidden bg-navy text-white', className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50rem_30rem_at_85%_0%,rgb(40_150_143/0.18),transparent_60%),radial-gradient(40rem_28rem_at_0%_100%,rgb(226_112_95/0.12),transparent_60%)]"
      />
      <div className="mx-auto max-w-6xl px-5 pt-32 pb-16 sm:px-8 sm:pb-20">{children}</div>
    </section>
  );
}
