import { createServerClient } from '@/lib/supabase/server'

export async function getRestaurantId() {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error('No user found:', userError?.message)
    return null
  }

  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    console.error('No restaurant found for user:', error?.message)
    return null
  }

  return data.id
}
