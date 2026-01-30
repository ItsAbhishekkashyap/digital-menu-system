import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createSupabaseServerClient = async () => {
  // Next.js 15 mein cookies ek Promise hai, isliye await zaroori hai
  const cookieStore = await cookies();

  //@ts-expect-error: Suppressing type mismatch because library expects Promise but runtime needs object
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};