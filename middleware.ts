// src/middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get session data. This is crucial for checking authentication.
  const { data: { session } } = await supabase.auth.getSession();

  // Get the path the user is trying to visit.
  const { pathname } = req.nextUrl;

  // RULE 1: Protect the dashboard.
  // If the user is not logged in and is trying to access the dashboard...
  if (!session && pathname.startsWith('/dashboard')) {
    // ...redirect them to the main landing page to log in.
    const url = req.nextUrl.clone();
    url.pathname = '/'; // Or '/onboarding' or '/login'
    return NextResponse.redirect(url);
  }

  // RULE 2: Allow all other paths.
  // If the request is for any other page (like /menu/...),
  // let it pass through without any checks.
  return res;
}

// This config ensures the middleware runs on all paths
// except for static assets, so we can check the session everywhere.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};