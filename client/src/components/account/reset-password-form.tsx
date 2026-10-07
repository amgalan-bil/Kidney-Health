'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { Dictionary, Locale } from '@/lib/i18n';
import { resetPassword, sendResetOtp } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Step = 'email' | 'otp' | 'done';

/**
 * The API's three-step reset: request a code by email, then submit that code
 * together with the new password (/api/v1/auth/send-reset-otp, /reset-password).
 */
export function ResetPasswordForm({ locale, t }: { locale: Locale; t: Dictionary }) {
  const copy = t.reset;
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function requestCode(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (!email.trim()) return setError(copy.errors.email);

    setBusy(true);
    try {
      await sendResetOtp(email.trim());
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : copy.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  async function submitNewPassword(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(null);
    if (otp.trim().length !== 6) return setError(copy.errors.otp);
    if (newPassword.length < 8) return setError(copy.errors.password);

    setBusy(true);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : copy.errors.generic);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-[2rem] bg-paper p-7 text-ink shadow-[0_40px_90px_-50px_rgb(0_0_0/0.7)] sm:p-9">
      {step === 'done' ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-11 text-teal" />
          <h2 className="font-display mt-5 text-2xl font-extrabold">{copy.doneTitle}</h2>
          <p className="mt-3 leading-relaxed text-ink-muted">{copy.doneBody}</p>
          <Button className="mt-7 w-full" size="lg" onClick={() => router.push(`/${locale}/sign-in`)}>
            {copy.toSignIn}
          </Button>
        </div>
      ) : (
        <>
          <h2 className="font-display text-2xl font-extrabold">{copy.title}</h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            {step === 'email' ? copy.leadEmail : copy.leadOtp}
          </p>

          {step === 'email' ? (
            <form onSubmit={requestCode} className="mt-7 space-y-5" noValidate>
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
              <FormError message={error} />
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                {copy.sendCode}
              </Button>
            </form>
          ) : (
            <form onSubmit={submitNewPassword} className="mt-7 space-y-5" noValidate>
              <label className="block">
                <span className="text-sm font-semibold">{copy.otpLabel}</span>
                <Input
                  className="mt-2 text-center font-display text-xl tracking-[0.5em] tabular-nums"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">{copy.newPasswordLabel}</span>
                <Input
                  className="mt-2"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <FormError message={error} />
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                {copy.submit}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError(null);
                }}
                className="w-full text-center text-sm font-semibold text-ink-muted transition hover:text-ink"
              >
                {copy.back}
              </button>
            </form>
          )}

          <p className="mt-7 text-center text-sm text-ink-muted">
            <Link href={`/${locale}/sign-in`} className="font-semibold text-teal hover:underline">
              {copy.toSignIn}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-coral-soft px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}
