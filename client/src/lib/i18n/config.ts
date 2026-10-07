export const locales = ['en', 'mn'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** How a donor pays: from abroad by card through Donorbox, or from Mongolia with QPay. */
export type Region = 'international' | 'mongolia';

/** The donate card opens on the option that fits the page language; donors can switch. */
export const defaultRegionFor = {
  en: 'international',
  mn: 'mongolia',
} as const satisfies Record<Locale, Region>;

/** International card donations (the campaign's existing Donorbox page). */
export const DONORBOX_URL = 'https://donorbox.org/little-faces-big-smile';
