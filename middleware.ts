// src/middleware.ts

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase'; // Make sure this path is correct

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient<Database>({ req, res });

  // This line is crucial. It refreshes the session cookie on every request,
  // so your server components (like layouts) can read it.
  await supabase.auth.getSession();

  return res;
}

// This config ensures the middleware runs on all paths except for static assets.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

