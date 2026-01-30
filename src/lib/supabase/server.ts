import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createSupabaseServerClient = async () => {
  const cookieStore = await cookies();

  // 👇 Maine wo '@ts-expect-error' wali line hata di hai.
  // Ab code clean hai aur Vercel khushi-khushi deploy karega.
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
};