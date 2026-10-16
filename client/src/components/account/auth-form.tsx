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
 * (/api/v1/auth/login and /register).
 *
 * Nearly everyone who signs up is a student, so the sign-up form starts their
 * fundraiser in the same step (a ticked box they can untick) and lands them on
 * their own page. Signing in sends anyone who hasn't started one yet to /me,
 * which offers to; everyone else goes back to wherever they were.
 */
export function AuthForm({ mode, locale, t }: { mode: 'sign-in' | 'sign-up'; locale: Locale; t: Dictionary }) {
  const { signIn, signUp, startFundraiser } = useAccount();
  const router = useRouter();
  const params = useSearchParams();
  const copy = t.auth;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [student, setStudent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Set when the API says the email is already registered (on sign-up) or
  // unknown (on sign-in), so the error can link straight to the other form.
  const [switchForm, setSwitchForm] = useState(false);
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
    setSwitchForm(false);
    const me = `/${locale}/me`;
    // `next` is set by links like the header's, so you come back to that page.
    const next = params.get('next');
    const back = next && next.startsWith('/') ? next : me;
    try {
      if (isSignUp) {
        await signUp(name.trim(), email.trim(), password);
        if (student) {
          // If this fails the account still exists, and /me offers to try again.
          await startFundraiser().catch(() => undefined);
          // /me sends fundraisers on to their own page.
          return router.push(me);
        }
        return router.push(back);
      }
      const account = await signIn(email.trim(), password);
      // Signed up earlier but never started a page: offer it before anything else.
      router.push(account && !account.isFundraiser ? me : back);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (isSignUp && /already exists/i.test(message)) {
        setError(copy.errors.exists);
        setSwitchForm(true);
      } else if (!isSignUp && /invalid email/i.test(message)) {
        setError(copy.errors.noAccount);
        setSwitchForm(true);
      } else {
        setError(message || copy.errors.generic);
      }
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

        {isSignUp && (
          <label className="flex items-start gap-3 rounded-xl bg-teal/5 px-4 py-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-teal"
              checked={student}
              onChange={(e) => setStudent(e.target.checked)}
            />
            <span>
              <span className="font-semibold">{copy.studentLabel}</span>
              <span className="mt-0.5 block text-ink-muted">{copy.studentHint}</span>
            </span>
          </label>
        )}

        {error && (
          <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-medium text-destructive">
            {error}
            {switchForm && (
              <>
                {' '}
                <Link
                  href={`/${locale}/${isSignUp ? 'sign-in' : 'sign-up'}${params.toString() ? `?${params}` : ''}`}
                  className="font-semibold underline"
                >
                  {isSignUp ? copy.signInLink : copy.signUpLink}
                </Link>
              </>
            )}
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
