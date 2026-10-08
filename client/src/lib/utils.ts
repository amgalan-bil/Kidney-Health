import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale } from '@/lib/i18n/config';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMnt(amount: number) {
  return `₮${new Intl.NumberFormat('en-US').format(amount)}`;
}

/**
 * Tugriks per US dollar, used only to show amounts in dollars on the English
 * site. Matches the campaign's own $30,000 ≈ ₮105,000,000. Money is always
 * stored and paid in tugriks.
 */
export const MNT_PER_USD = 3_500;

/** A tugrik amount in the reader's currency: dollars in English, tugriks in Mongolian. */
export function formatMoney(mnt: number, locale: Locale) {
  if (locale === 'mn') return formatMnt(mnt);
  const usd = mnt / MNT_PER_USD;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    // Small gifts keep their cents so ₮1,000 doesn't read as "$0".
    maximumFractionDigits: usd < 10 ? 2 : 0,
  }).format(usd);
}

/** Replaces `{key}` placeholders in a copy string. */
export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}

/**
 * Share of a goal reached, 0–100, left unrounded. A first ₮2,000 against a
 * ₮2,700,000 goal is 0.07%, and rounding that to a flat 0 here would tell the
 * bar and the label there is nothing to show.
 */
export function progressPercent(raised: number, goal: number) {
  if (!(goal > 0) || !(raised > 0)) return 0;
  return Math.min((raised / goal) * 100, 100);
}

/**
 * The percentage as a donor should read it: whole numbers once there is real
 * progress, a decimal while it is still small, so an actual gift never reads
 * as "0%".
 */
export function formatPercent(percent: number) {
  if (percent <= 0) return '0%';
  if (percent < 0.1) return '<0.1%';
  if (percent < 10) return `${percent.toFixed(1).replace(/\.0$/, '')}%`;
  return `${Math.round(percent)}%`;
}
