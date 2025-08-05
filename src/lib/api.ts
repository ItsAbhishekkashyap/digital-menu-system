// lib/api.ts
import { supabase } from './supabase'
import type { MenuItemInput} from './types'


export async function getRestaurant(ownerId: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('owner_id', ownerId)
    .single()
  return { data, error }
}

export async function createRestaurant(ownerId: string, name: string) {
  const { data, error } = await supabase
    .from('restaurants')
    .insert([{ owner_id: ownerId, name }])
    .select()
    .single()
  return { data, error }
}


export async function getMenuSections(restaurantId: string) {
  const { data, error } = await supabase
    .from('menu_sections')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('order', { ascending: true })
  return { data, error }
}

export async function addMenuSection(restaurantId: string, name: string) {
  const { data, error } = await supabase
    .from('menu_sections')
    .insert([{ restaurant_id: restaurantId, name }])
    .select()
    .single()
  return { data, error }
}

export async function updateMenuSection(sectionId: string, name: string) {
  const { data, error } = await supabase
    .from('menu_sections')
    .update({ name })
    .eq('id', sectionId)
    .select()
    .single();

  return { data, error };
}


export async function deleteMenuSection(sectionId: string) {
  const { error } = await supabase
    .from('menu_sections')
    .delete()
    .eq('id', sectionId)
  return { error }
}


export async function getMenuItems(sectionId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('section_id', sectionId)
    .order('order', { ascending: true })
  return { data, error }
}

export async function addMenuItem(sectionId: string, item: MenuItemInput) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([{ section_id: sectionId, ...item }])
    .select()
    .single()
  return { data, error }
}

export async function deleteMenuItem(itemId: string) {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', itemId)
  return { error }
}
