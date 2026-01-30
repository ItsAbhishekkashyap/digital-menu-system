import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  return createServerComponentClient<Database>({
    // 👇 FIX: 'Promise.resolve' laga diya.
    // Library ko Promise chahiye tha, humne Promise de diya. Error Khatam.
    cookies: () => Promise.resolve(cookieStore),
  });
};