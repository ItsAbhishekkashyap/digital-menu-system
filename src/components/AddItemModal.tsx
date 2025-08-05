// components/modals/AddItemModal.tsx

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { addMenuItem } from '@/lib/api'

interface AddItemModalProps {
  sectionId: string
  isOpen: boolean
  onClose: () => void
  onItemAdded: () => void
}

export function AddItemModal({
  sectionId,
  isOpen,
  onClose,
  onItemAdded,
}: AddItemModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAddItem = async () => {
    if (!name || !price) return

    setLoading(true)
    await addMenuItem(sectionId, {
      name,
      description,
      price: parseFloat(price),
    })

    setLoading(false)
    setName('')
    setDescription('')
    setPrice('')
    onItemAdded()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Menu Item</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <Button onClick={handleAddItem} disabled={loading}>
            {loading ? 'Adding...' : 'Add Item'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
