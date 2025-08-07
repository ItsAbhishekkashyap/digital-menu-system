// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { Database } from "@/types/supabase"; // If you're using Supabase types

// export function createServerClient() {
//   const cookieStore = cookies();
//   return createServerComponentClient<Database>({ cookies: () => cookieStore });
// }


// src/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
};


