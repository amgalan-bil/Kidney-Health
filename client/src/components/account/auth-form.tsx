'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccount } from './account-provider';

/**
 * Sign-in and sign-up against the Express API's cookie session
 * (/api/v1/auth/login and /register). On success the visitor goes back to
 * wherever they were, or to their own fundraiser page after signing up.
 */
export function AuthForm({ mode, locale, t }: { mode: 'sign-in' | 'sign-up'; locale: Locale; t: Dictionary }) {
  const { signIn, signUp } = useAccount();
  const router = useRouter();
  const params = useSearchParams();
  const copy = t.auth;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'sign-up';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);

    if (isSignUp && !name.trim()) return setError(copy.errors.name);
    if (!email.trim()) return setError(copy.errors.email);
    if (password.length < 8) return setError(copy.errors.password);

    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(name.trim(), email.trim(), password);
        router.push(`/${locale}/me`);
      } else {
        await signIn(email.trim(), password);
        // `next` is set by the header so signing in returns you to your page.
        const next = params.get('next');
        router.push(next && next.startsWith('/') ? next : `/${locale}/me`);
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : copy.errors.generic);
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] bg-paper p-7 text-ink shadow-[0_40px_90px_-50px_rgb(0_0_0/0.7)] sm:p-9">
      <h2 className="font-display text-2xl font-extrabold">
        {isSignUp ? copy.signUpTitle : copy.signInTitle}
      </h2>

      <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
        {isSignUp && (
          <label className="block">
            <span className="text-sm font-semibold">{copy.nameLabel}</span>
            <Input
              className="mt-2"
              autoComplete="name"
              maxLength={60}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-semibold">{copy.emailLabel}</span>
          <Input
            className="mt-2"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">{copy.passwordLabel}</span>
          <Input
            className="mt-2"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          {isSignUp ? copy.signUpSubmit : copy.signInSubmit}
        </Button>
      </form>

      <div className="mt-7 space-y-2 text-center text-sm text-ink-muted">
        {!isSignUp && (
          <p>
            <Link href={`/${locale}/reset-password`} className="font-semibold text-teal hover:underline">
              {copy.forgot}
            </Link>
          </p>
        )}
        <p>
          {isSignUp ? copy.haveAccount : copy.noAccount}{' '}
          <Link
            href={`/${locale}/${isSignUp ? 'sign-in' : 'sign-up'}`}
            className="font-semibold text-teal hover:underline"
          >
            {isSignUp ? copy.signInLink : copy.signUpLink}
          </Link>
        </p>
      </div>
    </div>
  );
}
