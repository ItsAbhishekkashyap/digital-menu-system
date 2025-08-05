'use client'

import { useEffect, useState } from 'react'
import { getMenuSections } from '@/lib/api'
import { MenuSection } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { AddItemModal } from './AddItemModal' // Make sure the path is correct

interface SectionListProps {
  restaurantId: string
}

export default function SectionList({ restaurantId }: SectionListProps) {
  const [sections, setSections] = useState<MenuSection[] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSections() {
      try {
        const { data, error } = await getMenuSections(restaurantId)
        if (error) {
          console.error('Error fetching sections:', error)
          return
        }

        setSections(data as MenuSection[])
      } catch (err: unknown) {
        console.error('Unexpected error fetching sections:', err)
      }
    }

    fetchSections()
  }, [restaurantId])

  const handleItemAdded = () => {
    // Refresh sections after adding item
    setTimeout(() => {
      // Optional: you can refetch data from API again here
      location.reload()
    }, 500)
  }

  if (!sections || sections.length === 0) {
    return <p className="text-muted-foreground">No sections yet.</p>
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div
          key={section.id}
          className="rounded-lg border p-4 shadow-sm hover:shadow transition-shadow"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <p className="text-sm text-muted-foreground">No description available</p>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setActiveSectionId(section.id)
                setIsModalOpen(true)
              }}
            >
              Add Item
            </Button>
          </div>
        </div>
      ))}

      {/* Modal at root level */}
      {activeSectionId && (
        <AddItemModal
          sectionId={activeSectionId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onItemAdded={handleItemAdded}
        />
      )}
    </div>
  )
}




