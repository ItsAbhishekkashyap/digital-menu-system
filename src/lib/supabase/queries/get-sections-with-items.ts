// src/lib/supabase/queries/get-sections-with-items.ts
import { createServerClient } from '@/lib/supabase/server'

export async function getSectionsWithItems(restaurantId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('menu_sections')
    .select('*, menu_items(*)')
    .eq('restaurant_id', restaurantId) // filter by restaurant_id
    .order('order_column', { ascending: true }) // optional ordering

  if (error) {
    throw error
  }
// Convert Supabase format to match your MenuSection type
  const sections = data.map((section) => ({
    ...section,
    title: section.name,           // map 'name' to 'title'
    items: section.menu_items,     // map 'menu_items' to 'items'
  }))

  return sections
}
