// src/middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase'; // Make sure this path is correct

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get session data. This also refreshes the session cookie.
  const { data: { session } } = await supabase.auth.getSession();

  // Get the URL the user is trying to access
  const requestedUrl = req.nextUrl.pathname;

  // --- THIS IS THE CORE PROTECTION LOGIC ---

  // 1. If the user is NOT logged in (no session)...
  if (!session) {
    // ...and they are trying to access a protected dashboard page...
    if (requestedUrl.startsWith('/dashboard')) {
      // ...redirect them to the onboarding page.
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/onboarding';
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. If the user IS logged in, or if they are accessing a public page
  //    (like /menu/[slug]), just continue as normal.
  return res;
}

// This config ensures the middleware runs on all paths except for static assets.
// This is correct because we want to refresh the session on every navigation.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
