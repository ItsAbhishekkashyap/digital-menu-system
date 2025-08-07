// 'use client'

// import React, { useEffect, useRef, useState, useCallback } from 'react'
// import { useParams } from 'next/navigation'
// import { supabase } from '@/lib/supabase/client'
// import { Button } from '@/components/ui/Button'
// import { Input } from '@/components/ui/Input'
// import { Switch } from '@/components/ui/switch'
// import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

// interface MenuItem {
//     id: string
//     section_id: string | null
//     name: string
//     description: string | null
//     price: number
//     is_featured: boolean | null
//     is_visible: boolean | null
//     sort_order: number | null

// }

// interface MenuSection {
//     id: string;
//     restaurant_id: string | null;
//     name: string
//     sort_order: number | null
//     items: MenuItem[]
//     created_at?: string | null
// }

// export default function MenuBuilder() {

//     const params = useParams()
//     const restaurantId = params.restaurantId as string

//     const [sections, setSections] = useState<MenuSection[]>([])
//     const [loading, setLoading] = useState<boolean>(true)
//     const [newSectionName, setNewSectionName] = useState('')
//     const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
//     const [editingSectionName, setEditingSectionName] = useState('')
//     const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//     // Fetch menu sections and their items
//     const fetchMenu = useCallback(async () => {
//         setLoading(true)
//         const { data, error } = await supabase
//             .from('menu_sections')
//             .select(`
//         id,
//         restaurant_id,
//         name,
//         sort_order,
//         created_at,
//         items:menu_items (
//           id,
//           section_id,
//           name,
//           description,
//           price,
//           is_featured,
//           is_visible,
//           sort_order
//         )
//       `)
//             .eq('restaurant_id', restaurantId)
//             .order('sort_order', { ascending: true })

//         if (error) {
//             console.error('Error fetching menu:', error)
//         } else if (data) {
//             setSections(data)
//         }
//         setLoading(false)
//     }, [restaurantId, supabase])

//     // Realtime subscription to menu_sections and menu_items
//     useEffect(() => {

//         const checkSession = async () => {
//             const { data: { session } } = await supabase.auth.getSession();
//             console.log('Current session:', session);
//         };
//         checkSession();



//         fetchMenu()

//         const sectionSubscription = supabase
//             .channel(`public:menu_sections:restaurant_id=eq.${restaurantId}`)
//             .on(
//                 'postgres_changes',
//                 { event: '*', schema: 'public', table: 'menu_sections', filter: `restaurant_id=eq.${restaurantId}` },
//                 () => fetchMenu()
//             )
//             .subscribe()

//         const itemsSubscription = supabase
//             .channel(`public:menu_items:restaurant_id=eq.${restaurantId}`)
//             .on(
//                 'postgres_changes',
//                 { event: '*', schema: 'public', table: 'menu_items', filter: `section_id=in.(select id from menu_sections where restaurant_id='${restaurantId}')` },
//                 () => fetchMenu()
//             )
//             .subscribe()

//         return () => {
//             supabase.removeChannel(sectionSubscription)
//             supabase.removeChannel(itemsSubscription)
//         }
//     }, [fetchMenu, restaurantId, supabase])

//     // Add a new section
//     const addSection = async () => {
//         if (!newSectionName.trim()) return

//         const maxSortOrder = sections.reduce((max, s) => (s.sort_order ?? 0) > max ? (s.sort_order ?? 0) : max, 0)

//         const { error } = await supabase.from('menu_sections').insert([{
//             restaurant_id: restaurantId,
//             name: newSectionName.trim(),
//             sort_order: maxSortOrder + 1,
//         }])

//         if (error) {
//             console.error('Failed to add section:', error)
//         } else {
//             setNewSectionName('')
//             fetchMenu()
//         }
//     }

//     // Edit section name
//     const startEditingSection = (id: string, currentName: string) => {
//         setEditingSectionId(id)
//         setEditingSectionName(currentName)
//     }

//     const saveEditingSection = async () => {
//         if (!editingSectionId || !editingSectionName.trim()) return

//         const { error } = await supabase
//             .from('menu_sections')
//             .update({ name: editingSectionName.trim() })
//             .eq('id', editingSectionId)

//         if (error) {
//             console.error('Failed to update section:', error)
//         } else {
//             setEditingSectionId(null)
//             setEditingSectionName('')
//             fetchMenu()
//         }
//     }

//     // Delete a section (cascade deletes items)
//     const deleteSection = async (id: string) => {
//         if (!confirm('Are you sure you want to delete this section and all its items?')) return
//         const { error } = await supabase.from('menu_sections').delete().eq('id', id)
//         if (error) {
//             console.error('Failed to delete section:', error)
//         } else {
//             fetchMenu()
//         }
//     }

//     // Add a new item to a section
//     const addItem = async (sectionId: string) => {
//         const { error } = await supabase.from('menu_items').insert([{
//             section_id: sectionId,
//             name: 'New Item',
//             description: '',
//             price: 0,
//             is_featured: false,
//             is_visible: true,
//             sort_order: 0,
//         }])
//         if (error) {
//             console.error('Failed to add item:', error)
//         } else {
//             fetchMenu()
//         }
//     }

//     // Update an item field
//     // Replace your old updateItemField function with this new one
//     const updateItemField = <
//         K extends keyof MenuItem
//     >(
//         itemId: string,
//         sectionId: string, // We now need the sectionId to find the item
//         field: K,
//         value: MenuItem[K]
//     ) => {
//         // 1. Update the UI state instantly. This makes typing feel fast.
//         setSections(prevSections =>
//             prevSections.map(section => {
//                 if (section.id !== sectionId) {
//                     return section;
//                 }
//                 return {
//                     ...section,
//                     items: section.items.map(item =>
//                         item.id === itemId ? { ...item, [field]: value } : item
//                     ),
//                 };
//             })
//         );

//         // 2. Debounce the database update to avoid saving on every keystroke.
//         if (debounceTimeoutRef.current) {
//             clearTimeout(debounceTimeoutRef.current);
//         }

//         debounceTimeoutRef.current = setTimeout(async () => {
//             const { error } = await supabase
//                 .from('menu_items')
//                 .update({ [field]: value })
//                 .eq('id', itemId);

//             if (error) {
//                 console.error(`Failed to update item ${String(field)}:`, error);
//                 // In a real app, you might show a toast notification here
//             }
//         }, 500); // Wait 500ms after the user stops typing to save
//     };

//     // Delete an item
//     const deleteItem = async (itemId: string) => {
//         if (!confirm('Are you sure you want to delete this item?')) return
//         const { error } = await supabase.from('menu_items').delete().eq('id', itemId)
//         if (error) {
//             console.error('Failed to delete item:', error)
//         } else {
//             fetchMenu()
//         }
//     }

//     // Handle drag and drop reorder of sections and items
//     const onDragEnd = async (result: DropResult) => {
//         const { source, destination, type } = result
//         if (!destination) return

//         if (type === 'section') {
//             // Reorder sections
//             const reorderedSections = Array.from(sections)
//             const [moved] = reorderedSections.splice(source.index, 1)
//             reorderedSections.splice(destination.index, 0, moved)

//             setSections(reorderedSections)


//             // Update sort_order in DB
//             for (let i = 0; i < reorderedSections.length; i++) {
//                 console.log("Updating section:", reorderedSections[i]);


//                 const { error } = await supabase.from('menu_sections').update({ sort_order: i }).eq('id', reorderedSections[i].id)
//                 console.log("Setting sort_order to", i, "for id", reorderedSections[i].id)
//                 if (error) {
//                     console.error("Error updating section:", error)
//                 }

//             }
//             fetchMenu()
//         } else if (type === 'item') {
//             // Reorder items within a section
//             const sectionIndex = sections.findIndex(s => s.id === source.droppableId)
//             if (sectionIndex === -1) return

//             const section = sections[sectionIndex]
//             const reorderedItems = Array.from(section.items)
//             const [movedItem] = reorderedItems.splice(source.index, 1)
//             reorderedItems.splice(destination.index, 0, movedItem)

//             const updatedSections = [...sections]
//             updatedSections[sectionIndex] = { ...section, items: reorderedItems }
//             setSections(updatedSections)

//             // Update sort_order in DB for the section's items
//             for (let i = 0; i < reorderedItems.length; i++) {
//                 console.log("Updating item:", reorderedItems[i]);
//                 const { error } = await supabase
//                     .from('menu_items')
//                     .update({ sort_order: i })
//                     .eq('id', reorderedItems[i].id)

//                 if (error) {
//                     console.error("Error updating item:", error)
//                 }

//             }
//             fetchMenu()
//         }
//     }

//     return (
//         <div className="p-6">
//             <h1 className="text-3xl font-bold mb-6">Menu Builder</h1>

//             <div className="mb-4 flex space-x-2">
//                 <Input
//                     placeholder="New Section Name"
//                     value={newSectionName}
//                     onChange={(e) => setNewSectionName(e.target.value)}
//                 />
//                 <Button onClick={addSection} disabled={!newSectionName.trim()}>
//                     + Add Section
//                 </Button>
//             </div>

//             {loading ? (
//                 <p>Loading menu...</p>
//             ) : (
//                 <DragDropContext onDragEnd={onDragEnd}>
//                     <Droppable droppableId="all-sections" type="section">
//                         {(provided) => (
//                             <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
//                                 {sections.map((section, sectionIndex) => (
//                                     <Draggable draggableId={section.id} index={sectionIndex} key={section.id}>
//                                         {(provided) => (
//                                             <div
//                                                 ref={provided.innerRef}
//                                                 {...provided.draggableProps}
//                                                 className="border p-4 rounded bg-white shadow"
//                                             >
//                                                 <div className="flex justify-between items-center mb-2">
//                                                     <div {...provided.dragHandleProps} className="cursor-move">
//                                                         <svg
//                                                             className="w-5 h-5 text-gray-500"
//                                                             fill="none"
//                                                             stroke="currentColor"
//                                                             strokeWidth={2}
//                                                             viewBox="0 0 24 24"
//                                                         >
//                                                             <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
//                                                         </svg>
//                                                     </div>
//                                                     {editingSectionId === section.id ? (
//                                                         <input
//                                                             className="border-b border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
//                                                             value={editingSectionName}
//                                                             onChange={(e) => setEditingSectionName(e.target.value)}
//                                                             onBlur={saveEditingSection}
//                                                             onKeyDown={(e) => {
//                                                                 if (e.key === 'Enter') {
//                                                                     saveEditingSection()
//                                                                 }
//                                                             }}
//                                                             autoFocus
//                                                         />
//                                                     ) : (
//                                                         <h2
//                                                             className="text-xl font-semibold cursor-pointer"
//                                                             onClick={() => startEditingSection(section.id, section.name)}
//                                                         >
//                                                             {section.name}
//                                                         </h2>
//                                                     )}
//                                                     <Button
//                                                         variant="destructive"
//                                                         size="sm"
//                                                         onClick={() => deleteSection(section.id)}
//                                                     >
//                                                         Delete
//                                                     </Button>
//                                                 </div>

//                                                 {/* Items List */}
//                                                 <Droppable droppableId={section.id} type="item">
//                                                     {(provided) => (
//                                                         <div
//                                                             ref={provided.innerRef}
//                                                             {...provided.droppableProps}
//                                                             className="space-y-2"
//                                                         >
//                                                             {section.items.map((item, itemIndex) => (
//                                                                 <Draggable
//                                                                     draggableId={item.id}
//                                                                     index={itemIndex}
//                                                                     key={item.id}
//                                                                 >
//                                                                     {(provided) => (
//                                                                         <div
//                                                                             className="border rounded p-3 flex flex-col gap-2 bg-gray-50"
//                                                                             ref={provided.innerRef}
//                                                                             {...provided.draggableProps}
//                                                                         >
//                                                                             <div className="flex justify-between items-center">
//                                                                                 <div {...provided.dragHandleProps} className="cursor-move mr-2">
//                                                                                     <svg
//                                                                                         className="w-4 h-4 text-gray-500"
//                                                                                         fill="none"
//                                                                                         stroke="currentColor"
//                                                                                         strokeWidth={2}
//                                                                                         viewBox="0 0 24 24"
//                                                                                     >
//                                                                                         <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
//                                                                                     </svg>
//                                                                                 </div>
//                                                                                 <Input
//                                                                                     className="flex-grow"
//                                                                                     value={item.name}
//                                                                                     onChange={(e) =>
//                                                                                         updateItemField(item.id,section.id, 'name', e.target.value)
//                                                                                     }
//                                                                                 />
//                                                                                 <Button
//                                                                                     variant="destructive"
//                                                                                     size="sm"
//                                                                                     onClick={() => deleteItem(item.id)}
//                                                                                 >
//                                                                                     Delete
//                                                                                 </Button>
//                                                                             </div>
//                                                                             <Input
//                                                                                 placeholder="Description"
//                                                                                 value={item.description ?? ''}
//                                                                                 onChange={(e) =>
//                                                                                     updateItemField(item.id,section.id, 'description', e.target.value)
//                                                                                 }
//                                                                             />
//                                                                             <Input
//                                                                                 type="number"
//                                                                                 step="0.01"
//                                                                                 min={0}
//                                                                                 placeholder="Price"
//                                                                                 value={item.price.toString()}
//                                                                                 onChange={(e) =>
//                                                                                     updateItemField(item.id,section.id, 'price', parseFloat(e.target.value) || 0)
//                                                                                 }
//                                                                             />
//                                                                             <div className="flex gap-4 items-center">
//                                                                                 <label className="flex items-center gap-2">
//                                                                                     <Switch
//                                                                                         checked={item.is_featured ?? false}
//                                                                                         onCheckedChange={(checked) =>
//                                                                                             updateItemField(item.id,section.id, 'is_featured', checked)
//                                                                                         }
//                                                                                     />
//                                                                                     Featured
//                                                                                 </label>
//                                                                                 <label className="flex items-center gap-2">
//                                                                                     <Switch
//                                                                                         checked={item.is_visible ?? false}
//                                                                                         onCheckedChange={(checked) =>
//                                                                                             updateItemField(item.id,section.id, 'is_visible', checked)
//                                                                                         }
//                                                                                     />
//                                                                                     Visible
//                                                                                 </label>
//                                                                             </div>
//                                                                         </div>
//                                                                     )}
//                                                                 </Draggable>
//                                                             ))}
//                                                             {provided.placeholder}
//                                                             <Button onClick={() => addItem(section.id)}>+ Add Item</Button>
//                                                         </div>
//                                                     )}
//                                                 </Droppable>
//                                             </div>
//                                         )}
//                                     </Draggable>
//                                 ))}
//                                 {provided.placeholder}
//                             </div>
//                         )}
//                     </Droppable>
//                 </DragDropContext>
//             )}
//         </div>
//     )
// }


'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client' // Ensure you use the client Supabase instance
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/switch'
import type { DropResult } from '@hello-pangea/dnd';
import MenuBuilderClient from '@/components/menu/MenuBuilderClient';
import Image from 'next/image'
import { UploadCloud, Trash2, Loader2 } from 'lucide-react'
// At the top of menu-builder/page.tsx, below other imports
import dynamic from 'next/dynamic';

// Dynamically import the components with SSR turned off
const DragDropContext = dynamic(
  () =>
    import('@hello-pangea/dnd').then((mod) => {
      return mod.DragDropContext;
    }),
  { ssr: false }
);

const Droppable = dynamic(
  () =>
    import('@hello-pangea/dnd').then((mod) => {
      return mod.Droppable;
    }),
  { ssr: false }
);

const Draggable = dynamic(
  () =>
    import('@hello-pangea/dnd').then((mod) => {
      return mod.Draggable;
    }),
  { ssr: false }
);

// 1. UPDATE THE MenuItem INTERFACE
interface MenuItem {
  id: string
  section_id: string | null
  name: string
  description: string | null
  price: number
  is_featured: boolean | null
  is_visible: boolean | null
  sort_order: number | null
  image_url: string | null // Add the new image_url property
}

interface MenuSection {
  id: string;
  restaurant_id: string | null;
  name: string
  sort_order: number | null
  items: MenuItem[]
  created_at?: string | null
}


// 2. NEW COMPONENT: ImageUploader
// This component handles the logic for uploading and displaying an item's image.
const ImageUploader = ({
  item,
  restaurantId,
  onUploadSuccess,
  onDeleteImage,
}: {
  item: MenuItem;
  restaurantId: string;
  onUploadSuccess: (url: string) => void;
  onDeleteImage: () => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create a unique file path to prevent overwrites
      const fileExt = file.name.split('.').pop();
      const filePath = `${restaurantId}/${item.id}-${Date.now()}.${fileExt}`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('menu-item-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          metadata: {
            itemId: item.id,
          },
        });

      if (uploadError) {
       console.error("Supabase upload error:", uploadError);
        throw new Error(uploadError.message);
      }

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('menu-item-images')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error("Could not get public URL for the uploaded file.")
      }

      // Call the parent component's callback with the new URL
      onUploadSuccess(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
       alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-24 h-24 flex-shrink-0 mr-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {item.image_url ? (
        <>
          <Image
            src={item.image_url}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
          <button
            onClick={onDeleteImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Delete image"
          >
            <Trash2 size={14} />
          </button>
        </>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-full border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <UploadCloud size={24} />
              <span className="text-xs mt-1">Upload</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};





export default function MenuBuilder() {

  const params = useParams()
  const restaurantId = params.restaurantId as string

  const [sections, setSections] = useState<MenuSection[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [newSectionName, setNewSectionName] = useState('')
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingSectionName, setEditingSectionName] = useState('')
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);



  // Fetch menu sections and their items
  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_sections')
      // The only change is removing the space after "menu_items"
      .select(`
        id,
        restaurant_id,
        name,
        sort_order,
        created_at,
        items:menu_items(
          id,
          section_id,
          name,
          description,
          price,
          is_featured,
          is_visible,
          sort_order,
          image_url
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })
      // This line correctly orders the items within each section
      .order('sort_order', { foreignTable: 'menu_items', ascending: true });

    if (error) {
      console.error('Error fetching menu:', error);
    } else if (data) {
      setSections(data);
    }
    setLoading(false);
  }, [restaurantId]);

  // Realtime subscription
  useEffect(() => {
    if (!restaurantId) return;
    fetchMenu();

    const channel = supabase.channel(`menu-updates-for-${restaurantId}`);

    const subscriptions = {
      sections: {
        table: 'menu_sections',
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      items: {
        table: 'menu_items',
        filter: `section_id=in.(select id from menu_sections where restaurant_id='${restaurantId}')`,
      },
    };

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: subscriptions.sections.table, filter: subscriptions.sections.filter },
        () => fetchMenu()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: subscriptions.items.table, filter: subscriptions.items.filter },
        () => fetchMenu()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId, fetchMenu]);


  // Add a new section
  const addSection = async () => {
    if (!newSectionName.trim()) return

    const maxSortOrder = sections.reduce((max, s) => (s.sort_order ?? 0) > max ? (s.sort_order ?? 0) : max, 0)

    // FIX: Use .select() to get the new section back and update the UI instantly.
    const { data: newSection, error } = await supabase
      .from('menu_sections')
      .insert({
        restaurant_id: restaurantId,
        name: newSectionName.trim(),
        sort_order: maxSortOrder + 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add section:', error);
    } else if (newSection) {
      // Add the new section to the local state for an instant update
      setSections(prevSections => [...prevSections, { ...newSection, items: [] }]);
      setNewSectionName('');
    }
  };

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
    }
  }

  // Delete a section (cascade deletes items)
  const deleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section and all its items?')) return
    const { error } = await supabase.from('menu_sections').delete().eq('id', id)
    if (error) {
      console.error('Failed to delete section:', error)
    }
  }

  // Add a new item to a section
  const addItem = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const maxSortOrder = section.items.reduce((max, item) => Math.max(max, item.sort_order ?? 0), 0);
    
    // FIX: Use .select() to get the new item back and update the UI instantly.
    const { data: newItem, error } = await supabase
      .from('menu_items')
      .insert({
        section_id: sectionId,
        name: 'New Item',
        price: 0,
        sort_order: maxSortOrder + 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add item:', error);
    } else if (newItem) {
      // Add the new item to the correct section in the local state
      setSections(prevSections =>
        prevSections.map(s =>
          s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
        )
      );
    }
  };


  // Update an item field (with Debouncing)
  const updateItemField = <K extends keyof MenuItem>(
    itemId: string,
    sectionId: string,
    field: K,
    value: MenuItem[K]
  ) => {
    // Instantly update the UI for a smooth experience
    setSections(prevSections =>
      prevSections.map(section => {
        if (section.id !== sectionId) {
          return section;
        }
        return {
          ...section,
          items: section.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
          ),
        };
      })
    );

    // Debounce the database update
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('menu_items')
        .update({ [field]: value })
        .eq('id', itemId);

      if (error) {
        console.error(`Failed to update item ${String(field)}:`, error);
      }
    }, 500); // Save 500ms after user stops typing
  };

  // Delete an item
  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    const { error } = await supabase.from('menu_items').delete().eq('id', itemId)
    if (error) {
      console.error('Failed to delete item:', error)
    }
  }

  // Handle drag and drop reorder
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result
    if (!destination) return

    // Re-ordering sections
    if (type === 'section') {
      const reorderedSections = Array.from(sections)
      const [moved] = reorderedSections.splice(source.index, 1)
      reorderedSections.splice(destination.index, 0, moved)
      setSections(reorderedSections) // Optimistic UI update

      // Update sort_order in DB
      const updates = reorderedSections.map((section, index) =>
        supabase.from('menu_sections').update({ sort_order: index }).eq('id', section.id)
      );
      await Promise.all(updates);
    }

    // Re-ordering items
    else if (type === 'item') {
      const sourceSectionId = source.droppableId;
      const destSectionId = destination.droppableId;

      const sectionsCopy = JSON.parse(JSON.stringify(sections));
      const sourceSection = sectionsCopy.find((s: MenuSection) => s.id === sourceSectionId);
      const destSection = sectionsCopy.find((s: MenuSection) => s.id === destSectionId);

      if (!sourceSection || !destSection) return;

      const [movedItem] = sourceSection.items.splice(source.index, 1);
      destSection.items.splice(destination.index, 0, movedItem);

      setSections(sectionsCopy); // Optimistic UI update

      // Update DB for source section
      const sourceUpdates = sourceSection.items.map((item: MenuItem, index: number) =>
        supabase.from('menu_items').update({ sort_order: index, section_id: sourceSection.id }).eq('id', item.id)
      );

      // Update DB for destination section (if different)
      const destUpdates = destSection.items.map((item: MenuItem, index: number) =>
        supabase.from('menu_items').update({ sort_order: index, section_id: destSection.id }).eq('id', item.id)
      );

      await Promise.all([...sourceUpdates, ...destUpdates]);
    }
  }

  return (
    <div className="p-4 md:p-6">
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
        <MenuBuilderClient
          sections={sections}
          onDragEnd={onDragEnd}
          renderSection={(section, sectionIndex) => (
            <Draggable
              draggableId={section.id}
              index={sectionIndex}
              key={section.id}
            >
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className="border p-4 rounded-lg bg-white shadow-md"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div {...provided.dragHandleProps} className="cursor-move p-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" /></svg>
                    </div>
                    {editingSectionId === section.id ? (
                      <Input
                        value={editingSectionName}
                        onChange={(e) => setEditingSectionName(e.target.value)}
                        onBlur={saveEditingSection}
                        onKeyDown={(e) => e.key === 'Enter' && saveEditingSection()}
                        autoFocus
                      />
                    ) : (
                      <h2 className="text-xl font-semibold cursor-pointer" onClick={() => startEditingSection(section.id, section.name)}>
                        {section.name}
                      </h2>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => deleteSection(section.id)}>Delete</Button>
                  </div>

                  {/* Items List */}
                  <Droppable droppableId={section.id} type="item">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                        {section.items.map((item, itemIndex) => (
                          <Draggable draggableId={item.id} index={itemIndex} key={item.id}>
                            {(provided) => (
                              <div
                                className="border rounded-lg p-3 flex items-start bg-gray-50/50"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <div {...provided.dragHandleProps} className="cursor-move p-2 self-center">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" /></svg>
                                </div>

                                <ImageUploader
                                  item={item}
                                  restaurantId={restaurantId}
                                  onUploadSuccess={(url) => updateItemField(item.id, section.id, 'image_url', url)}
                                  onDeleteImage={() => updateItemField(item.id, section.id, 'image_url', null)}
                                />

                                <div className="flex-grow flex flex-col gap-2">
                                  <div className="flex justify-between items-center gap-2">
                                    <Input
                                      className="flex-grow font-semibold"
                                      value={item.name}
                                      onChange={(e) => updateItemField(item.id, section.id, 'name', e.target.value)}
                                    />
                                    <Button variant="destructive" size="sm" onClick={() => deleteItem(item.id)}>Delete</Button>
                                  </div>
                                  <Input
                                    placeholder="Description"
                                    value={item.description ?? ''}
                                    onChange={(e) => updateItemField(item.id, section.id, 'description', e.target.value)}
                                  />
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min={0}
                                      placeholder="Price"
                                      className="w-28"
                                      value={item.price}
                                      onChange={(e) => updateItemField(item.id, section.id, 'price', parseFloat(e.target.value) || 0)}
                                    />
                                    <div className="flex gap-4 items-center">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <Switch checked={item.is_featured ?? false} onCheckedChange={(checked) => updateItemField(item.id, section.id, 'is_featured', checked)} />
                                        Featured
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <Switch checked={item.is_visible ?? false} onCheckedChange={(checked) => updateItemField(item.id, section.id, 'is_visible', checked)} />
                                        Visible
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <Button className="mt-2" onClick={() => addItem(section.id)}>+ Add Item</Button>
                      </div>
                    )}
                  </Droppable>
                </div>
              )}
            </Draggable>
          )}
        />
      )}
    </div>
  )
}