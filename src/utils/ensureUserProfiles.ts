// utils/ensureUserProfile.ts
import { supabase } from '@/lib/supabase';

export async function ensureUserProfile(userId: string) {
  

  const { data: existingProfile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error; // unexpected error
  }

  if (!existingProfile) {
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: userId, role: 'owner', full_name: 'New User' });

    if (insertError) throw insertError;
  }
}
