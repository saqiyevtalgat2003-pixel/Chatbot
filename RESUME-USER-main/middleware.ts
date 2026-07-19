import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/config';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false,
});

const AUTH_PATHS = ['login', 'signup'];
const PROTECTED_PATHS = ['dashboard'];

export default async function middleware(request: NextRequest) {
  // 1. Refresh the Supabase session first so cookies stay valid.
  const { response: supabaseResponse, user } = await updateSession(request);

  // 2. Figure out the locale-stripped path, e.g. /kk/login -> /login
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  const hasLocale = locales.includes(segments[0] as (typeof locales)[number]);
  const rest = hasLocale ? segments.slice(1) : segments;
  const path = rest.join('/');
  const locale = hasLocale ? segments[0] : defaultLocale;

  // 3. Guard auth-only and public-only routes.
  if (!user && PROTECTED_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  if (user && AUTH_PATHS.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // 4. Hand off to next-intl for locale rewriting, preserving Supabase cookies.
  const intlResponse = intlMiddleware(request);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|auth|.*\\..*).*)'],
};
