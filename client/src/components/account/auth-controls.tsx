'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Check, HeartHandshake, Loader2, LogOut, Pencil, UserRound } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { ApiError, NAME_MAX_LENGTH } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccount } from './account-provider';

/** Sign in / sign up when signed out; a small account menu when signed in. */
export function AuthControls({ locale, t }: { locale: Locale; t: Dictionary }) {
  const { account, status, signOut, updateName } = useAccount();
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
      t={t}
      onRename={updateName}
      // Without a fundraiser there's no page yet; offer to start one instead.
      myPageLabel={account.isFundraiser ? t.nav.myPage : t.fundraisers.start}
      signOutLabel={t.nav.signOut}
      href={account.isFundraiser ? `/${locale}/profile/${account.userId}` : `/${locale}/me`}
      onSignOut={async () => {
        await signOut();
        router.push(`/${locale}`);
      }}
    />
  );
}

function AccountMenu({
  name,
  t,
  onRename,
  myPageLabel,
  signOutLabel,
  href,
  onSignOut,
}: {
  name: string;
  t: Dictionary;
  onRename: (name: string) => Promise<void>;
  myPageLabel: string;
  signOutLabel: string;
  href: string;
  onSignOut: () => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  // Closing the menu also abandons a half-typed name.
  useEffect(() => {
    if (!open) setRenaming(false);
  }, [open]);

  async function handleRename(event: FormEvent) {
    event.preventDefault();
    const next = draft.trim();
    if (!next) return setError(t.nav.nameError);
    setSaving(true);
    setError(null);
    try {
      await onRename(next);
      setRenaming(false);
    } catch (err) {
      // A taken name comes back as a 409 with a message worth showing as-is.
      setError(err instanceof ApiError && err.status === 409 ? err.message : t.nav.nameSaveError);
    } finally {
      setSaving(false);
    }
  }

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
          className="animate-in fade-in zoom-in-95 absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl bg-white p-1.5 shadow-[0_24px_60px_-24px_rgb(23_43_58/0.45)] ring-1 ring-ink/10 duration-150"
        >
          <p className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink">
            <UserRound className="size-4 shrink-0 text-ink-muted" />
            <span className="truncate">{name}</span>
          </p>
          {renaming ? (
            <form onSubmit={handleRename} className="px-3 pt-1 pb-3" noValidate>
              <label className="block">
                <span className="text-xs font-semibold text-ink-muted">{t.nav.nameLabel}</span>
                <Input
                  autoFocus
                  autoComplete="name"
                  maxLength={NAME_MAX_LENGTH}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="mt-1.5 h-10"
                />
              </label>
              {error && (
                <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                  {error}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" /> : <Check />}
                  {t.nav.saveName}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setRenaming(false)}>
                  {t.nav.cancel}
                </Button>
              </div>
            </form>
          ) : (
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setDraft(name);
                setError(null);
                setRenaming(true);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition hover:bg-cream-deep"
            >
              <Pencil className="size-4 shrink-0 text-ink-muted" />
              {t.nav.changeName}
            </button>
          )}
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
