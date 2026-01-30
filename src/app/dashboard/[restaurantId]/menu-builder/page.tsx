'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import type { DropResult } from '@hello-pangea/dnd';
import Image from 'next/image'
import { UploadCloud, Trash2, Loader2, X, Tag, Plus, GripVertical, ArrowLeft, Eye } from 'lucide-react'
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils'
import type { Database } from '@/types/supabase'

// --- DYNAMIC IMPORTS for DND ---
const DragDropContext = dynamic(() => import('@hello-pangea/dnd').then(mod => mod.DragDropContext), { ssr: false });
const Droppable = dynamic(() => import('@hello-pangea/dnd').then(mod => mod.Droppable), { ssr: false });
const Draggable = dynamic(() => import('@hello-pangea/dnd').then(mod => mod.Draggable), { ssr: false });

// --- TYPE DEFINITIONS ---
interface Tag { id: string; name: string; color: string; }
interface MenuItem {
  id: string; section_id: string | null; name: string; description: string | null;
  price: number; is_featured: boolean | null; is_visible: boolean | null;
  sort_order: number | null; image_url: string | null; tags?: Tag[];
}
interface MenuSection {
  id: string; restaurant_id: string | null; name: string;
  sort_order: number | null; items: MenuItem[]; created_at?: string | null;
}

// --- REDESIGNED SUB-COMPONENTS ---

const ImageUploader = ({ item, restaurantId, onUploadSuccess, onDeleteImage }: { item: MenuItem; restaurantId: string; onUploadSuccess: (url: string) => void; onDeleteImage: () => void; }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    try {
      const supabase = createClientComponentClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `${restaurantId}/${item.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('menu-item-images').upload(filePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      const { data: { publicUrl } } = supabase.storage.from('menu-item-images').getPublicUrl(filePath);
      if (!publicUrl) throw new Error("Could not get public URL.");
      onUploadSuccess(publicUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full sm:w-24 h-24 flex-shrink-0">
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
      {item.image_url ? (
        <>
          <Image src={item.image_url} alt={item.name} layout="fill" objectFit="cover" className="rounded-md" />
          <button onClick={onDeleteImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition-transform hover:scale-110 shadow-lg" aria-label="Delete image">
            <X size={14} />
          </button>
        </>
      ) : (
        <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full h-full border-2 border-dashed border-gray-600 rounded-md flex flex-col items-center justify-center text-gray-400 hover:bg-gray-800/50 hover:border-orange-500/50 transition-colors">
          {isUploading ? <Loader2 className="animate-spin" size={24} /> : <><UploadCloud size={24} /><span className="text-xs mt-1">Upload</span></>}
        </button>
      )}
    </div>
  );
};

const TagSelector = ({ item, availableTags, onAddTag, onRemoveTag, onCreateTag }: { item: MenuItem; availableTags: Tag[]; onAddTag: (tagId: string) => void; onRemoveTag: (tagId: string) => void; onCreateTag: (tagName: string) => Promise<Tag | null>; }) => {
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const itemTagIds = new Set(item.tags?.map(t => t.id) ?? []);
  const unassignedTags = availableTags.filter(t => !itemTagIds.has(t.id));

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setIsCreating(true);
    const newTag = await onCreateTag(newTagName.trim());
    if (newTag) onAddTag(newTag.id);
    setNewTagName('');
    setIsCreating(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {item.tags?.map(tag => (
        <div key={tag.id} className="flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
          <span>{tag.name}</span>
          <button onClick={() => onRemoveTag(tag.id)} className="ml-1.5 text-gray-400 hover:text-white">
            <X size={12} />
          </button>
        </div>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-7 w-7 bg-gray-700/50 border-gray-600 hover:bg-gray-700">
            <Plus size={14} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 bg-gray-800 border-gray-700 text-white">
          <div className="space-y-1">
            {unassignedTags.length > 0 && unassignedTags.map(tag => (
              <Button key={tag.id} variant="ghost" size="sm" className="w-full justify-start h-8 text-xs hover:bg-gray-700" onClick={() => onAddTag(tag.id)}>
                {tag.name}
              </Button>
            ))}
            {unassignedTags.length > 0 && <hr className="my-1 border-gray-700" />}
            <div className="flex items-center space-x-1 p-1">
              <Input placeholder="New tag..." value={newTagName} onChange={(e) => setNewTagName(e.target.value)} className="h-8 text-xs bg-gray-700 border-gray-600" />
              <Button size="sm" onClick={handleCreateTag} disabled={isCreating} className="bg-orange-600 hover:bg-orange-700">Add</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

const ConfirmationDialog = ({ open, onOpenChange, onConfirm, title, description }: { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void; title: string; description: string; }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-700 border-none hover:bg-gray-600">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const MenuBuilderSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {[1, 2].map(i => (
      <div key={i} className="form-card rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-48 bg-gray-700/50 rounded-md"></div>
          <div className="h-8 w-24 bg-gray-700/50 rounded-md"></div>
        </div>
        <div className="space-y-4">
          <div className="h-28 w-full bg-gray-800/50 rounded-lg"></div>
          <div className="h-10 w-full bg-gray-800/50 rounded-lg"></div>
        </div>
      </div>
    ))}
  </div>
);


export default function MenuBuilder() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState({ isOpen: false, title: '', description: '', onConfirm: () => { } });
  const supabase = createClientComponentClient<Database>();
  const [currency, setCurrency] = useState("$");

  const closeDialog = () => setDialogState({ isOpen: false, title: '', description: '', onConfirm: () => { } });

  const fetchMenu = useCallback(async () => {
    const { data: restaurantData, error: restaurantError } = await supabase.from('restaurants').select('subdomain').eq('id', restaurantId).single();
    const { data, error } = await supabase.from('menu_sections').select(`*, items:menu_items (*, tags:menu_item_tags (tags (*)))`).eq('restaurant_id', restaurantId).order('sort_order').order('sort_order', { foreignTable: 'items' });
    const { data: tagsData, error: tagsError } = await supabase.from('tags').select('*').eq('restaurant_id', restaurantId);

    if (error || tagsError || restaurantError) console.error('Error fetching data:', { error, tagsError, restaurantError });
    else if (data) {
      const formattedSections = data.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          tags: ((item.tags || []) as { tags: Tag | null }[]).map(t => t.tags).filter((t): t is Tag => t !== null)
        }))
      }));
      setSections(formattedSections);
      setAvailableTags(tagsData || []);
      setSubdomain(restaurantData?.subdomain || null);
    }
    setLoading(false);
  }, [restaurantId, supabase]);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true); fetchMenu();
    const channel = supabase.channel(`menu-updates-for-${restaurantId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_sections', filter: `restaurant_id=eq.${restaurantId}` }, () => fetchMenu())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => fetchMenu())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_item_tags' }, () => fetchMenu())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, () => fetchMenu())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, fetchMenu, supabase]);

  const addSection = async () => {
    if (!newSectionName.trim()) return
    const maxSortOrder = sections.reduce((max, s) => (s.sort_order ?? 0) > max ? (s.sort_order ?? 0) : max, 0)
    const { data: newSection, error } = await supabase.from('menu_sections').insert({ restaurant_id: restaurantId, name: newSectionName.trim(), sort_order: maxSortOrder + 1, }).select().single();
    if (error) console.error('Failed to add section:', error);
    else if (newSection) {
      setSections(prevSections => [...prevSections, { ...newSection, items: [] }]);
      setNewSectionName('');
    }
  };

  const startEditingSection = (id: string, currentName: string) => {
    setEditingSectionId(id);
    setEditingSectionName(currentName);
  }

  const saveEditingSection = async () => {
    if (!editingSectionId || !editingSectionName.trim()) return;
    const { error } = await supabase.from('menu_sections').update({ name: editingSectionName.trim() }).eq('id', editingSectionId);
    if (error) console.error('Failed to update section:', error);
    else {
      setEditingSectionId(null);
      setEditingSectionName('');
      fetchMenu();
    }
  }

  const deleteSection = async (id: string) => {
    setDialogState({
      isOpen: true,
      title: 'Delete Section?',
      description: 'Are you sure you want to delete this section and all of its items? This action cannot be undone.',
      onConfirm: async () => {
        const { error } = await supabase.from('menu_sections').delete().eq('id', id);
        if (error) console.error('Failed to delete section:', error);
        closeDialog();
      }
    });
  };

  const addItem = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    const maxSortOrder = section.items.reduce((max, item) => Math.max(max, item.sort_order ?? 0), 0);
    const { data: newItem, error } = await supabase.from('menu_items').insert({ section_id: sectionId, name: 'New Item', price: 0, sort_order: maxSortOrder + 1, }).select().single();
    if (error) console.error('Failed to add item:', error);
    else if (newItem) {
      setSections(prevSections => prevSections.map(s => s.id === sectionId ? { ...s, items: [...s.items, { ...newItem, tags: [] }] } : s));
    }
  };

  const updateItemField = <K extends keyof MenuItem>(itemId: string, sectionId: string, field: K, value: MenuItem[K]) => {
    setSections(prevSections => prevSections.map(section => {
      if (section.id !== sectionId) return section;
      return { ...section, items: section.items.map(item => item.id === itemId ? { ...item, [field]: value } : item) };
    }));
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase.from('menu_items').update({ [field]: value }).eq('id', itemId);
      if (error) console.error(`Failed to update item ${String(field)}:`, error);
    }, 500);
  };

  const deleteItem = async (itemId: string) => {
    setDialogState({
      isOpen: true,
      title: 'Delete Item?',
      description: 'Are you sure you want to delete this menu item? This action cannot be undone.',
      onConfirm: async () => {
        const { error } = await supabase.from('menu_items').delete().eq('id', itemId);
        if (error) console.error('Failed to delete item:', error);
        closeDialog();
      }
    });
  }

  const addTagToItem = async (itemId: string, tagId: string) => {
    const tagToAdd = availableTags.find(t => t.id === tagId);
    if (tagToAdd) {
      setSections(prev => prev.map(s => ({ ...s, items: s.items.map(i => i.id === itemId ? { ...i, tags: [...(i.tags ?? []), tagToAdd] } : i) })));
    }
    const { error } = await supabase.from('menu_item_tags').insert({ menu_item_id: itemId, tag_id: tagId });
    if (error) { console.error('Error adding tag:', error); fetchMenu(); }
  };

  const removeTagFromItem = async (itemId: string, tagId: string) => {
    setSections(prev => prev.map(s => ({ ...s, items: s.items.map(i => i.id === itemId ? { ...i, tags: i.tags ? i.tags.filter(t => t.id !== tagId) : [] } : i) })));
    const { error } = await supabase.from('menu_item_tags').delete().match({ menu_item_id: itemId, tag_id: tagId });
    if (error) { console.error('Error removing tag:', error); fetchMenu(); }
  };

  const createTag = async (tagName: string): Promise<Tag | null> => {
    const { data: newTag, error } = await supabase.from('tags').insert({ name: tagName, restaurant_id: restaurantId }).select().single();
    if (error) { console.error('Error creating tag:', error); alert(`Failed to create tag: ${error.message}`); return null; }
    if (newTag) { setAvailableTags(prev => [...prev, newTag]); return newTag; }
    return null;
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;
    if (type === 'section') {
      const reorderedSections = Array.from(sections);
      const [moved] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, moved);
      setSections(reorderedSections);
      const updates = reorderedSections.map((section, index) => supabase.from('menu_sections').update({ sort_order: index }).eq('id', section.id));
      await Promise.all(updates);
    } else if (type === 'item') {
      const sectionsCopy = JSON.parse(JSON.stringify(sections));
      const sourceSection = sectionsCopy.find((s: MenuSection) => s.id === source.droppableId);
      const destSection = sectionsCopy.find((s: MenuSection) => s.id === destination.droppableId);
      if (!sourceSection || !destSection) return;
      const [movedItem] = sourceSection.items.splice(source.index, 1);
      destSection.items.splice(destination.index, 0, movedItem);
      setSections(sectionsCopy);
      const sourceUpdates = sourceSection.items.map((item: MenuItem, index: number) => supabase.from('menu_items').update({ sort_order: index, section_id: sourceSection.id }).eq('id', item.id));
      const destUpdates = destSection.items.map((item: MenuItem, index: number) => supabase.from('menu_items').update({ sort_order: index, section_id: destSection.id }).eq('id', item.id));
      await Promise.all([...sourceUpdates, ...destUpdates]);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 relative">
      <div className="absolute inset-0 opacity-10"><Image src="/restnew.png" alt="Restaurant background" fill className="object-cover" priority /></div>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950 to-gray-950"></div>
      <style jsx global>{`
            .form-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.5); }
            .gradient-text { background: linear-gradient(90deg, #F59E0B, #EF4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        `}</style>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
          <div>
            <Button variant="outline" onClick={() => router.push('/dashboard')} className="bg-transparent border-gray-700 hover:bg-gray-800/50 hover:text-foreground mb-4 sm:mb-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">Menu Builder</h1>
            <p className="text-gray-400 mt-1">Drag and drop to arrange sections and items.</p>
          </div>
          <Button onClick={() => subdomain && window.open(`/menu/${subdomain}`, '_blank')} disabled={!subdomain} className="bg-transparent border border-gray-700 hover:bg-gray-800/50 flex-shrink-0">
            <Eye className="mr-2 h-4 w-4" />
            View Live Menu
          </Button>
        </div>

        <div className="form-card rounded-2xl p-4 sm:p-6 mb-8">
          <form onSubmit={(e) => { e.preventDefault(); addSection(); }} className="flex flex-col sm:flex-row items-center gap-4">
            <Input placeholder="Enter new section name (e.g., Appetizers, Main Course)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} className="bg-gray-800 border-gray-700 w-full" />
            <Button type="submit" disabled={!newSectionName.trim()} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold flex-shrink-0 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
          </form>
        </div>

        {loading ? <MenuBuilderSkeleton /> : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-sections" direction="vertical" type="section">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-8">
                  {sections.map((section, sectionIndex) => (
                    <Draggable key={section.id} draggableId={section.id} index={sectionIndex}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className={cn("form-card rounded-2xl transition-shadow", snapshot.isDragging && "shadow-2xl shadow-orange-500/20")}>
                          <div className="flex flex-col sm:flex-row items-center p-4 border-b border-gray-800 gap-4">
                            <div {...provided.dragHandleProps} className="cursor-move p-2 text-gray-500 hover:text-white">
                              <GripVertical size={20} />
                            </div>
                            {editingSectionId === section.id ? (
                              <Input value={editingSectionName} onChange={(e) => setEditingSectionName(e.target.value)} onBlur={saveEditingSection} onKeyDown={(e) => e.key === 'Enter' && saveEditingSection()} autoFocus className="bg-gray-900 border-gray-700 text-xl font-semibold" />
                            ) : (
                              <h2 className="text-xl font-semibold text-white cursor-pointer flex-grow" onClick={() => startEditingSection(section.id, section.name)}>{section.name}</h2>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => deleteSection(section.id)} className="ml-auto text-red-500/80 hover:bg-red-500/10 hover:text-red-500 flex-shrink-0">Delete Section</Button>
                          </div>

                          <div className="p-4">
                            <Droppable droppableId={section.id} type="item">
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                                  {section.items.map((item, itemIndex) => (
                                    <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                      {(provided, snapshot) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} className={cn("bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 transition-shadow", snapshot.isDragging && "ring-2 ring-orange-500")}>
                                          <div {...provided.dragHandleProps} className="cursor-move p-2 text-gray-500 hover:text-white self-center hidden md:block">
                                            <GripVertical size={20} />
                                          </div>
                                          <ImageUploader item={item} restaurantId={restaurantId} onUploadSuccess={(url) => updateItemField(item.id, section.id, 'image_url', url)} onDeleteImage={() => updateItemField(item.id, section.id, 'image_url', null)} />
                                          <div className="flex-grow space-y-3">
                                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                              <Input value={item.name} onChange={(e) => updateItemField(item.id, section.id, 'name', e.target.value)} className="text-lg font-semibold bg-gray-700/80 border-gray-600 w-full" />
                                              <div className="relative w-full sm:w-32 flex-shrink-0">
                                                {/* Currency Dropdown (Controls Global Currency State) */}
                                                <select
                                                  value={currency}
                                                  onChange={(e) => setCurrency(e.target.value)}
                                                  className="absolute inset-y-0 left-0 pl-2 w-10 bg-transparent border-none text-gray-400 font-bold focus:ring-0 cursor-pointer appearance-none z-10"
                                                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                                                >
                                                  <option value="$" className="bg-gray-800 text-white">$</option>
                                                  <option value="₹" className="bg-gray-800 text-white">₹</option>
                                                </select>

                                                {/* Price Input */}
                                                <Input
                                                  type="number"
                                                  step="0.01"
                                                  min={0}
                                                  value={item.price}
                                                  onChange={(e) => updateItemField(item.id, section.id, 'price', parseFloat(e.target.value) || 0)}
                                                  className="w-full pl-8 bg-gray-700/80 border-gray-600 focus:border-blue-500 transition-colors"
                                                  placeholder="0.00"
                                                />
                                              </div>
                                            </div>
                                            <Textarea placeholder="Description..." value={item.description ?? ''} onChange={(e) => updateItemField(item.id, section.id, 'description', e.target.value)} className="bg-gray-700/80 border-gray-600 text-sm" />
                                            <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-4">
                                              <div className="flex gap-4 items-center">
                                                <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={item.is_featured ?? false} onCheckedChange={(checked) => updateItemField(item.id, section.id, 'is_featured', checked)} />Featured</label>
                                                <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={item.is_visible ?? false} onCheckedChange={(checked) => updateItemField(item.id, section.id, 'is_visible', checked)} />Visible</label>
                                              </div>
                                              <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)} className="text-red-500/80 hover:bg-red-500/10 hover:text-red-500">Delete Item</Button>
                                            </div>
                                            <div className="border-t border-gray-700/50 my-2"></div>
                                            <TagSelector item={item} availableTags={availableTags} onAddTag={(tagId) => addTagToItem(item.id, tagId)} onRemoveTag={(tagId) => removeTagFromItem(item.id, tagId)} onCreateTag={createTag} />
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                            <Button className="mt-4 bg-orange-600/20 text-orange-400 border border-orange-500/30 hover:bg-orange-600/30" onClick={() => addItem(section.id)}>
                              <Plus className="mr-2 h-4 w-4" /> Add Item to {section.name}
                            </Button>
                          </div>
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
      </main>
      <ConfirmationDialog
        open={dialogState.isOpen}
        onOpenChange={(isOpen) => !isOpen && closeDialog()}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        description={dialogState.description}
      />
    </div>
  )
}