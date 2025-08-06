'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Database } from '@/types/supabase'

type Restaurant = Database['public']['Tables']['restaurants']['Row']

export default function CreateRestaurantPage() {
  const router = useRouter()
  const supabase = useSupabaseClient<Database>()
  const user = useUser()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)

    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    // ✅ Step 1: Ensure profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      setError('Failed to check profile: ' + profileError.message)
      setLoading(false)
      return
    }

    if (!profile) {
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            full_name: user.email?.split('@')[0] ?? 'Unnamed',
            role: 'owner',
          },
        ])

      if (insertProfileError) {
        setError('Failed to create profile: ' + insertProfileError.message)
        setLoading(false)
        return
      }
    }

    // ✅ Step 2: Insert restaurant
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
      setError('Failed to create restaurant: ' + insertError.message)
    } else {
      router.push(`/dashboard/${data.id}/menu-builder`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Restaurant</h1>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="subdomain">Subdomain</Label>
          <Input
            id="subdomain"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="e.g. antonio-foods"
            required
          />
        </div>

        <div>
          <Label htmlFor="logo">Logo URL (optional)</Label>
          <Input
            id="logo"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
          />
        </div>

        <Button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create Restaurant'}
        </Button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}



