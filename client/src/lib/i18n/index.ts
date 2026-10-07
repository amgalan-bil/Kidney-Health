import type { Locale } from './config';
import { en, type Dictionary } from './en';
import { mn } from './mn';

export * from './config';
export type { Dictionary } from './en';

const dictionaries: Record<Locale, Dictionary> = { en, mn };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
