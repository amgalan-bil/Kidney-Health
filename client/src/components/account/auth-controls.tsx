'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HeartHandshake, LogOut, UserRound } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useAccount } from './account-provider';

/** Sign in / sign up when signed out; a small account menu when signed in. */
export function AuthControls({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { account, status, signOut } = useAccount();
  const pathname = usePathname();
  const router = useRouter();

  // Reserve the space while the session is still being checked, so the header
  // doesn't jump once it resolves.
  if (status === 'loading') return <span aria-hidden className="h-9 w-24" />;

  if (!account) {
    // Signing in keeps you on the page you were reading.
    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
    return (
      <>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/${locale}/sign-in${next}`}>{t.nav.signIn}</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
          <Link href={`/${locale}/sign-up`}>{t.nav.signUp}</Link>
        </Button>
      </>
    );
  }

  return (
    <AccountMenu
      name={account.name}
      myPageLabel={t.nav.myPage}
      signOutLabel={t.nav.signOut}
      href={`/${locale}/profile/${account.userId}`}
      onSignOut={async () => {
        await signOut();
        router.push(`/${locale}`);
      }}
    />
  );
}

function AccountMenu({
  name,
  myPageLabel,
  signOutLabel,
  href,
  onSignOut,
}: {
  name: string;
  myPageLabel: string;
  signOutLabel: string;
  href: string;
  onSignOut: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full bg-teal font-display text-sm font-bold text-white outline-none transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-teal/40"
      >
        <span aria-hidden>{initial}</span>
        <span className="sr-only">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_24px_60px_-24px_rgb(23_43_58/0.45)] ring-1 ring-ink/10 duration-150"
        >
          <p className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink">
            <UserRound className="size-4 shrink-0 text-ink-muted" />
            <span className="truncate">{name}</span>
          </p>
          <div className="my-1 h-px bg-ink/8" />
          <Link
            role="menuitem"
            href={href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink transition hover:bg-cream-deep"
          >
            <HeartHandshake className="size-4 shrink-0 text-teal" />
            {myPageLabel}
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              void onSignOut();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition hover:bg-cream-deep"
          >
            <LogOut className="size-4 shrink-0 text-ink-muted" />
            {signOutLabel}
          </button>
        </div>
      )}
    </div>
  );
}
