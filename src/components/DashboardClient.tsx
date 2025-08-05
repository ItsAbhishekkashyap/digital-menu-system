'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import AddSectionModal from '@/components/AddSectionModal'
import { MenuSection } from '@/types/supabase'

interface DashboardClientProps {
  initialSections: MenuSection[]
  restaurantId: string
}

export default function DashboardClient({
  initialSections,
  restaurantId,
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sections, setSections] = useState(initialSections)

  const refreshSections = async () => {
    try {
      const res = await fetch(`/api/sections?restaurantId=${restaurantId}`)
      if (!res.ok) throw new Error('Failed to fetch sections')

      const fresh: MenuSection[] = await res.json()
      setSections(fresh)
    } catch (error) {
      console.error('Error refreshing sections:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-row bg-gray-100 dark:bg-gray-900">
      {/* Left Panel: Editor */}
      <div className="w-2/5 p-6 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          🍽️ Menu Editor
        </h1>

        <div className="mb-6 space-y-4">
          {sections.map((section) => (
            <div key={section.id}>
              <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
                {section.title}
              </h3>
              <ul className="pl-4 list-disc text-sm text-gray-600 dark:text-gray-400">
                {section.items.map((item) => (
                  <li key={item.id}>
                    {item.name} - ₹{item.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200">
            📋 Section List
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm space-y-1">
            {sections.map((section) => (
              <li key={`section-title-${section.id}`}>{section.title}</li>
            ))}
          </ul>
        </div>

        <Button
          className="bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Section
        </Button>

        {/* Add Section Modal */}
        <AddSectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSectionAdded={refreshSections}
          restaurantId={restaurantId}
        />
      </div>

      {/* Right Panel: Live Preview */}
      <div className="w-3/5 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          🔍 Live Preview
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow rounded p-6 space-y-6">
          {sections.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nothing to show yet...</p>
          ) : (
            sections.map((section) => (
              <div key={section.id}>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  {section.title}
                </h2>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-sm border-b pb-1 text-gray-700 dark:text-gray-300"
                    >
                      <span>{item.name}</span>
                      <span className="font-medium">₹{item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
