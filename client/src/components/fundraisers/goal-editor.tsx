'use client';

import { useState, type FormEvent } from 'react';
import { Check, Link2, Loader2, Pencil } from 'lucide-react';
import type { Dictionary } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseAmount, sanitizeAmount } from '@/components/donate/amount-picker';
import { useAccount } from '@/components/account/account-provider';

const MIN_GOAL = 1_000;

/** Shown on your own fundraiser page: change your goal and copy the link to share. */
export function GoalEditor({ goal, t, onSaved }: { goal: number; t: Dictionary; onSaved: (goal: number) => void }) {
  const { updateGoal } = useAccount();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = parseAmount(value);
    if (!Number.isInteger(next) || next < MIN_GOAL) {
      setError(t.profile.goalError);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateGoal(next);
      onSaved(next);
      setEditing(false);
    } catch {
      setError(t.profile.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href.split('#')[0]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the address bar still has the link.
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 sm:p-7">
      <p className="leading-relaxed text-white/75">{t.profile.yourPage}</p>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-5" noValidate>
          <label className="block">
            <span className="text-sm font-semibold text-white/80">{t.profile.goalInput}</span>
            <Input
              autoFocus
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(sanitizeAmount(e.target.value, false))}
              className="mt-2 font-semibold tabular-nums"
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-coral">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Check />}
              {t.profile.save}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              {t.profile.cancel}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setValue(sanitizeAmount(String(goal), false));
              setError(null);
              setEditing(true);
            }}
          >
            <Pencil />
            {t.profile.editGoal}
          </Button>
          <Button size="sm" variant="outline" onClick={copyLink}>
            {copied ? <Check /> : <Link2 />}
            {copied ? t.profile.copied : t.profile.copyLink}
          </Button>
        </div>
      )}
    </div>
  );
}
