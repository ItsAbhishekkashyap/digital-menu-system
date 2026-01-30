import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// 1. Outer function ASYNC rahega
export const createSupabaseServerClient = async () => {
  
  // 2. Cookies ko AWAIT kar (Ye runtime ke liye zaroori hai)
  const cookieStore = await cookies();

  // 3. FIX: 'cookies' property ke aage 'async' laga de taaki TypeScript khush rahe
  //    Ye 'cookieStore' ko Promise mein wrap karke return karega.
  return createServerComponentClient<Database>({ 
    cookies: async () => cookieStore 
  });
};