'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/switch'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

interface MenuItem {
  id: string
  section_id: string | null
  name: string
  description: string | null
  price: number
  is_featured: boolean | null
  is_visible: boolean | null
  sort_order: number | null

}

interface MenuSection {
  id: string;
  restaurant_id: string | null;
  name: string
  sort_order: number | null
  items: MenuItem[]
  created_at?: string | null
}

export default function MenuBuilder() {

  const params = useParams()
  const restaurantId = params.restaurantId as string

  const [sections, setSections] = useState<MenuSection[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [newSectionName, setNewSectionName] = useState('')
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState('')

  // Fetch menu sections and their items
  const fetchMenu = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('menu_sections')
      .select(`
        id,
        restaurant_id,
        name,
        sort_order,
        created_at,
        items:menu_items (
          id,
          section_id,
          name,
          description,
          price,
          is_featured,
          is_visible,
          sort_order
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching menu:', error)
    } else if (data) {
      setSections(data)
    }
    setLoading(false)
  }, [restaurantId, supabase])

  // Realtime subscription to menu_sections and menu_items
  useEffect(() => {

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session);
    };
    checkSession();



    fetchMenu()

    const sectionSubscription = supabase
      .channel(`public:menu_sections:restaurant_id=eq.${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_sections', filter: `restaurant_id=eq.${restaurantId}` },
        () => fetchMenu()
      )
      .subscribe()

    const itemsSubscription = supabase
      .channel(`public:menu_items:restaurant_id=eq.${restaurantId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_items', filter: `section_id=in.(select id from menu_sections where restaurant_id='${restaurantId}')` },
        () => fetchMenu()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(sectionSubscription)
      supabase.removeChannel(itemsSubscription)
    }
  }, [fetchMenu, restaurantId, supabase])

  // Add a new section
  const addSection = async () => {
    if (!newSectionName.trim()) return

    const maxSortOrder = sections.reduce((max, s) => (s.sort_order ?? 0) > max ? (s.sort_order ?? 0) : max, 0)

    const { error } = await supabase.from('menu_sections').insert([{
      restaurant_id: restaurantId,
      name: newSectionName.trim(),
      sort_order: maxSortOrder + 1,
    }])

    if (error) {
      console.error('Failed to add section:', error)
    } else {
      setNewSectionName('')
      fetchMenu()
    }
  }

  // Edit section name
  const startEditingSection = (id: string, currentName: string) => {
    setEditingSectionId(id)
    setEditingSectionName(currentName)
  }

  const saveEditingSection = async () => {
    if (!editingSectionId || !editingSectionName.trim()) return

    const { error } = await supabase
      .from('menu_sections')
      .update({ name: editingSectionName.trim() })
      .eq('id', editingSectionId)

    if (error) {
      console.error('Failed to update section:', error)
    } else {
      setEditingSectionId(null)
      setEditingSectionName('')
      fetchMenu()
    }
  }

  // Delete a section (cascade deletes items)
  const deleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section and all its items?')) return
    const { error } = await supabase.from('menu_sections').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete section:', error)
    } else {
      fetchMenu()
    }
  }

  // Add a new item to a section
  const addItem = async (sectionId: string) => {
    const { error } = await supabase.from('menu_items').insert([{
      section_id: sectionId,
      name: 'New Item',
      description: '',
      price: 0,
      is_featured: false,
      is_visible: true,
      sort_order: 0,
    }])
    if (error) {
      console.error('Failed to add item:', error)
    } else {
      fetchMenu()
    }
  }

  // Update an item field
  const updateItemField = async <
    K extends keyof MenuItem
  >(
    itemId: string,
    field: K,
    value: MenuItem[K]
  ) => {
    const { error } = await supabase.from('menu_items').update({ [field]: value }).eq('id', itemId)
    if (error) {
      console.error('Failed to update item:', error)
    } else {
      fetchMenu()
    }
  }

  // Delete an item
  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId)
    if (error) {
      console.error('Failed to delete item:', error)
    } else {
      fetchMenu()
    }
  }

  // Handle drag and drop reorder of sections and items
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return

    if (type === 'section') {
      // Reorder sections
      const reorderedSections = Array.from(sections)
      const [moved] = reorderedSections.splice(source.index, 1)
      reorderedSections.splice(destination.index, 0, moved)

      setSections(reorderedSections)


      // Update sort_order in DB
      for (let i = 0; i < reorderedSections.length; i++) {
        console.log("Updating section:", reorderedSections[i]);


        const { error } = await supabase.from('menu_sections').update({ sort_order: i }).eq('id', reorderedSections[i].id)
        console.log("Setting sort_order to", i, "for id", reorderedSections[i].id)
        if (error) {
          console.error("Error updating section:", error)
        }

      }
      fetchMenu()
    } else if (type === 'item') {
      // Reorder items within a section
      const sectionIndex = sections.findIndex(s => s.id === source.droppableId)
      if (sectionIndex === -1) return

      const section = sections[sectionIndex]
      const reorderedItems = Array.from(section.items)
      const [movedItem] = reorderedItems.splice(source.index, 1)
      reorderedItems.splice(destination.index, 0, movedItem)

      const updatedSections = [...sections]
      updatedSections[sectionIndex] = { ...section, items: reorderedItems }
      setSections(updatedSections)

      // Update sort_order in DB for the section's items
      for (let i = 0; i < reorderedItems.length; i++) {
        console.log("Updating item:", reorderedItems[i]);
        const { error } = await supabase
          .from('menu_items')
          .update({ sort_order: i })
          .eq('id', reorderedItems[i].id)

        if (error) {
          console.error("Error updating item:", error)
        }

      }
      fetchMenu()
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Menu Builder</h1>

      <div className="mb-4 flex space-x-2">
        <Input
          placeholder="New Section Name"
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
        />
        <Button onClick={addSection} disabled={!newSectionName.trim()}>
          + Add Section
        </Button>
      </div>

      {loading ? (
        <p>Loading menu...</p>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-sections" type="section">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                {sections.map((section, sectionIndex) => (
                  <Draggable draggableId={section.id} index={sectionIndex} key={section.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="border p-4 rounded bg-white shadow"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div {...provided.dragHandleProps} className="cursor-move">
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                            </svg>
                          </div>
                          {editingSectionId === section.id ? (
                            <input
                              className="border-b border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
                              value={editingSectionName}
                              onChange={(e) => setEditingSectionName(e.target.value)}
                              onBlur={saveEditingSection}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveEditingSection()
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <h2
                              className="text-xl font-semibold cursor-pointer"
                              onClick={() => startEditingSection(section.id, section.name)}
                            >
                              {section.name}
                            </h2>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSection(section.id)}
                          >
                            Delete
                          </Button>
                        </div>

                        {/* Items List */}
                        <Droppable droppableId={section.id} type="item">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="space-y-2"
                            >
                              {section.items.map((item, itemIndex) => (
                                <Draggable
                                  draggableId={item.id}
                                  index={itemIndex}
                                  key={item.id}
                                >
                                  {(provided) => (
                                    <div
                                      className="border rounded p-3 flex flex-col gap-2 bg-gray-50"
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div {...provided.dragHandleProps} className="cursor-move mr-2">
                                          <svg
                                            className="w-4 h-4 text-gray-500"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                                          </svg>
                                        </div>
                                        <Input
                                          className="flex-grow"
                                          value={item.name}
                                          onChange={(e) =>
                                            updateItemField(item.id, 'name', e.target.value)
                                          }
                                        />
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => deleteItem(item.id)}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                      <Input
                                        placeholder="Description"
                                        value={item.description ?? ''}
                                        onChange={(e) =>
                                          updateItemField(item.id, 'description', e.target.value)
                                        }
                                      />
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min={0}
                                        placeholder="Price"
                                        value={item.price.toString()}
                                        onChange={(e) =>
                                          updateItemField(item.id, 'price', parseFloat(e.target.value) || 0)
                                        }
                                      />
                                      <div className="flex gap-4 items-center">
                                        <label className="flex items-center gap-2">
                                          <Switch
                                            checked={item.is_featured ?? false}
                                            onCheckedChange={(checked) =>
                                              updateItemField(item.id, 'is_featured', checked)
                                            }
                                          />
                                          Featured
                                        </label>
                                        <label className="flex items-center gap-2">
                                          <Switch
                                            checked={item.is_visible ?? false}
                                            onCheckedChange={(checked) =>
                                              updateItemField(item.id, 'is_visible', checked)
                                            }
                                          />
                                          Visible
                                        </label>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              <Button onClick={() => addItem(section.id)}>+ Add Item</Button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  )
}


