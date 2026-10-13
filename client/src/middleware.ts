import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, type Locale } from '@/lib/i18n/config';

function preferredLocale(request: NextRequest): Locale {
  const header = request.headers.get('accept-language') ?? '';
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.toLowerCase().split('-')[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const match = ranked.find(({ lang }) => isLocale(lang));
  return match && isLocale(match.lang) ? match.lang : defaultLocale;
}

/** Pages from the previous version of the site, so old shared links still land somewhere useful. */
const legacyPaths: Record<string, string> = {
  '/donate': '#donate',
  '/thank-you': '',
  '/login': '/sign-in',
  '/reset-password': '/reset-password',
};

/**
 * The one address the site should be used from. The API only accepts sign-ups,
 * sign-ins and payments from this address, so other production addresses of
 * the same Vercel project (like an old *.vercel.app link shared in a chat)
 * load the pages but fail with "Request failed (500)" on every form.
 */
const SITE_HOST = process.env.SITE_HOST || 'www.hopebridge.site';
const IS_PRODUCTION =
  (process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV) === 'production';

/** Sends production visitors on a *.vercel.app address to the real site, keeping the page they asked for. */
function toSiteHost(request: NextRequest) {
  if (!IS_PRODUCTION) return null; // preview deployments keep their own addresses for testing
  const host = (request.headers.get('host') ?? '').toLowerCase();
  if (!host.endsWith('.vercel.app') || host === SITE_HOST) return null;
  const { pathname, search } = request.nextUrl;
  return NextResponse.redirect(`https://${SITE_HOST}${pathname}${search}`, 307);
}

/** Visitors without a language prefix go to /en or /mn based on their browser language. */
export default function middleware(request: NextRequest) {
  const moved = toSiteHost(request);
  if (moved) return moved;

  const { pathname } = request.nextUrl;

  const firstSegment = pathname.split('/')[1] ?? '';
  if (isLocale(firstSegment)) return;

  const url = request.nextUrl.clone();
  const locale = preferredLocale(request);
  const legacy = legacyPaths[pathname];
  if (legacy === undefined) {
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  } else if (legacy.startsWith('#')) {
    url.pathname = `/${locale}`;
    url.hash = legacy;
  } else {
    url.pathname = `/${locale}${legacy}`;
  }
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    // Skip API calls too: they're proxied to Express and the locale redirect never applies.
    // And Vercel Analytics, whose page-view beacons would otherwise be redirected to /en/_vercel/….
    '/((?!_next|_vercel|api/|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
