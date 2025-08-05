import { createServerClient } from "@/lib/supabase/server";
import { MenuSection } from "@/types/supabase";

export async function getSectionsWithItems(): Promise<MenuSection[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("menu_sections")
    .select(`
      id,
      title,
      items (
        id,
        name,
        price
      )
    `);

  if (error) {
    console.error("Error fetching sections:", error.message);
    return [];
  }

  // Validate and return as MenuSection[]
  return data as unknown as MenuSection[];
}

