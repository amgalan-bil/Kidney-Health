'use client';

import { useState, type FormEvent } from 'react';
import { Check, Loader2, Pencil, Plus } from 'lucide-react';
import { DESCRIPTION_MAX_LENGTH, updateDescription } from '@/lib/api';
import type { Dictionary } from '@/lib/i18n';
import { cn, fill } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * What the fundraiser is raising money for. Visitors see it only once it's
 * written; the owner always sees the card, with a prompt to fill it in.
 */
export function FundraiserStory({
  description,
  isOwn,
  t,
  onSaved,
}: {
  description: string;
  isOwn: boolean;
  t: Dictionary;
  onSaved: (description: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = t.profile.story;
  const max = String(DESCRIPTION_MAX_LENGTH);

  if (!description && !isOwn) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next = value.trim();
    if (next.length > DESCRIPTION_MAX_LENGTH) {
      setError(fill(copy.tooLong, { max }));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { user } = await updateDescription(next);
      onSaved(user.description ?? '');
      setEditing(false);
    } catch {
      setError(copy.saveError);
    } finally {
      setSaving(false);
    }
  }

  function startEditing() {
    setValue(description);
    setError(null);
    setEditing(true);
  }

  const tooLong = value.trim().length > DESCRIPTION_MAX_LENGTH;

  return (
    <div className="rounded-[2rem] bg-paper p-6 shadow-[0_40px_90px_-50px_rgb(23_43_58/0.5)] ring-1 ring-ink/5 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold text-ink">{copy.title}</h2>
        {isOwn && !editing && description && (
          <Button size="sm" variant="outline" className="text-ink" onClick={startEditing}>
            <Pencil />
            {copy.edit}
          </Button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-6" noValidate>
          <label className="block">
            <span className="text-sm font-semibold text-ink">{copy.label}</span>
            <textarea
              autoFocus
              rows={7}
              value={value}
              placeholder={copy.placeholder}
              aria-invalid={tooLong || undefined}
              onChange={(e) => setValue(e.target.value)}
              className="mt-2 block min-h-40 w-full resize-y rounded-xl border border-input bg-white px-4 py-3 text-base leading-relaxed text-ink shadow-[0_1px_2px_rgb(23_43_58/0.04)] transition-[border-color,box-shadow] outline-none placeholder:text-ink/35 focus-visible:border-teal focus-visible:ring-4 focus-visible:ring-teal/15 aria-invalid:border-destructive aria-invalid:ring-destructive/15"
            />
          </label>
          <p className={cn('mt-2 text-right text-xs tabular-nums', tooLong ? 'text-coral' : 'text-ink-muted')}>
            {fill(copy.count, { count: String(value.trim().length), max })}
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-coral">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={saving || tooLong}>
              {saving ? <Loader2 className="animate-spin" /> : <Check />}
              {t.profile.save}
            </Button>
            <Button type="button" size="sm" variant="ghost" className="text-ink" onClick={() => setEditing(false)}>
              {t.profile.cancel}
            </Button>
          </div>
        </form>
      ) : description ? (
        <p className="mt-5 leading-relaxed break-words whitespace-pre-line text-ink-muted">{description}</p>
      ) : (
        <div className="mt-4">
          <p className="leading-relaxed text-ink-muted">{copy.emptyOwn}</p>
          <Button size="sm" className="mt-5" onClick={startEditing}>
            <Plus />
            {copy.add}
          </Button>
        </div>
      )}
    </div>
  );
}
