// components/AddSectionModal.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { addMenuSection } from '@/lib/api'
import { Label } from '@/components/ui/Label'

interface AddSectionModalProps {
  restaurantId: string
  isOpen: boolean
  onClose: () => void
  onSectionAdded: () => void
}

export default function AddSectionModal({
  restaurantId,
  isOpen,
  onClose,
  onSectionAdded,
}: AddSectionModalProps) {
  const [sectionName, setSectionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!sectionName.trim()) {
      setError('Section name cannot be empty.')
      return
    }

    setIsLoading(true)
    setError(null)

    const {  error } = await addMenuSection(restaurantId, sectionName)

    setIsLoading(false)

    if (error) {
      console.error(error)
      setError('Failed to add section.')
    } else {
      setSectionName('')
      onSectionAdded()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              placeholder="e.g., Starters"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !sectionName.trim()}>
            {isLoading ? 'Adding...' : 'Add Section'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

