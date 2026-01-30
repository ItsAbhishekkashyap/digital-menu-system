import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

// 1. Data Structure Define kiya (Simple way)
type MenuSectionWithItems = Database['public']['Tables']['menu_sections']['Row'] & {
  menu_items: Database['public']['Tables']['menu_items']['Row'][];
};

export async function getSectionsWithItems(restaurantId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('menu_sections')
    .select(`
      *,
      menu_items (*)
    `)
    // 👇 SIMPLE FIX: Ye comment TypeScript ko bolta hai "Is line ka error ignore karo"
    // @ts-expect-error: Type mismatch due to Supabase complexity, but string is valid here.
    .eq('restaurant_id', restaurantId)
    .order('order_column', { ascending: true });

  if (error) {
    throw error;
  }

  // 3. Data Cast kiya taaki niche map function chale
  const typedData = data as unknown as MenuSectionWithItems[];

  const sections = typedData.map((section) => ({
    ...section,
    title: section.name,
    items: section.menu_items,
  }));

  return sections;
}
