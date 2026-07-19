import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { defaultLocale, locales } from '@/i18n/config';

// Handles the redirect back from Supabase after email confirmation
// or Google OAuth. Exchanges the one-time code for a session cookie,
// then sends the person on to their dashboard.
//
// SECURITY: `locale` and `next` come from the URL query string, i.e. from
// whoever crafted the link the user clicked — never trust them as-is.
// `locale` is restricted to the known locale list, and `next` must be a
// same-origin, root-relative path (no `//host`, no absolute URL) or it is
// discarded in favor of the safe default. Otherwise an attacker could send
// `/auth/callback?code=...&next=https://evil.example` and, after a real
// Supabase login, silently redirect the victim to a phishing site
// (open redirect).
function isSafeNextPath(next: string | null): next is string {
  if (!next) return false;
  if (!next.startsWith('/')) return false;
  if (next.startsWith('//')) return false;
  return true;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawLocale = searchParams.get('locale');
  const locale = locales.includes(rawLocale as (typeof locales)[number])
    ? (rawLocale as (typeof locales)[number])
    : defaultLocale;
  const rawNext = searchParams.get('next');
  const next = isSafeNextPath(rawNext) ? rawNext : `/${locale}/dashboard`;

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/login?error=auth`);
}
