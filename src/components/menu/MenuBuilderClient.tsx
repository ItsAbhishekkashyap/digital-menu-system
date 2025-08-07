// src/components/menu/MenuBuilderClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

// We will pass all the types, data, and functions from the main page as props
interface MenuItem {
  id: string;
  section_id: string | null;
  name: string;
  description: string | null;
  price: number;
  is_featured: boolean | null;
  is_visible: boolean | null;
  sort_order: number | null;
  image_url: string | null;
}

interface MenuSection {
  id: string;
  restaurant_id: string | null;
  name: string;
  sort_order: number | null;
  items: MenuItem[];
  created_at?: string | null;
}

interface MenuBuilderClientProps {
  sections: MenuSection[];
  onDragEnd: (result: DropResult) => void;
  // We pass the JSX for the sections and items as a function
  renderSection: (section: MenuSection, index: number) => React.ReactNode;
}

export default function MenuBuilderClient({
  sections,
  onDragEnd,
  renderSection,
}: MenuBuilderClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  // This hook ensures the component only renders on the client, after mounting.
  // This is the key to fixing both errors.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render nothing on the server and during the initial client-side render.
    // This prevents the hydration error.
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="all-sections" type="section">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-6"
          >
            {sections.map((section, index) => renderSection(section, index))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}