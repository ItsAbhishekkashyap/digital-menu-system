'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'



export default function CreateRestaurantPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('restaurants')
      .insert([
        {
          owner_id: user.id,
          name,
          description,
          subdomain,
          logo_url: logoUrl || null,
          theme: {
            primaryColor: '#FF5733',
            textColor: '#000000',
          },
          is_published: false,
        },
      ])
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
    } else {
      // Redirect to menu builder with restaurantId
      router.push(`/dashboard/${data.id}/menu-builder`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Restaurant</h1>

      <div className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <Label>Subdomain</Label>
          <Input
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="e.g. my-restaurant"
            required
          />
        </div>

        <div>
          <Label>Logo URL (optional)</Label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
        </div>

        <Button disabled={loading} onClick={handleCreate}>
          {loading ? 'Creating...' : 'Create Restaurant'}
        </Button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}
