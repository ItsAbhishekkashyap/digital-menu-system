import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerComponentClient<Database>({
    // 👇 ENGINEER FIX: 
    // Runtime needs: 'cookieStore' (Object) -> We pass this.
    // TypeScript wants: 'Promise' -> We cast it as a Promise to trick the compiler.
    // We use 'typeof cookieStore' to match the exact type structure without 'any'.
    cookies: () => cookieStore as unknown as Promise<typeof cookieStore>,
  });
}