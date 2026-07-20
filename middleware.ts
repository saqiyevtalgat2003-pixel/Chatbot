import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  const isAuthPath = path.startsWith('/login');
  const isProtectedPath = path.startsWith('/dashboard');

  // is_admin тексеруі мұнда емес — ол middleware-де DB round-trip жасамас
  // үшін dashboard/layout.tsx-те (requireAdmin арқылы) орындалады.
  if (!user && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|auth|.*\\..*).*)'],
};
