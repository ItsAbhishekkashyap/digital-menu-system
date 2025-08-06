'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' 
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Json } from '@/types/supabase'




interface Restaurant {
  id: string
  name: string

  owner_id: string | null;
  created_at: string | null;
  theme: Json | null;
  logo_url: string | null;
  subdomain?: string | null;
  
}

export default function DashboardPage() {

  const router = useRouter()

  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  async function fetchRestaurants() {
    setLoading(true)
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false })


    if (error) {
      console.error('Error fetching restaurants:', error)
    } else if (data) {
      const typedData = data as Restaurant[]

const formattedData: Restaurant[] = typedData.map((item) => ({
  id: item.id,
  name: item.name,
  logo_url: item.logo_url ?? null,
  owner_id: item.owner_id ?? null,
  theme: item.theme ?? null,
  created_at: item.created_at ?? null,
  subdomain: item.subdomain ?? null, // <- safe now
}))



      setRestaurants(formattedData)
    }
    setLoading(false)
  }

  async function handleCreate() {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error fetching user:', userError)
      return
    }

    const user = userData?.user
    if (!user) {
      alert('User not logged in')
      return
    }

    const newRestaurant = {
      name: 'New Restaurant',
      owner_id: user.id,
      subdomain: `restaurant-${Date.now()}`,
    }

    const { data, error } = await supabase
      .from('restaurants')
      .insert([newRestaurant])
      .select()
      .single()

    if (error) {
      console.error('Error creating restaurant:', error)
    } else if (data) {
      router.push(`/dashboard/${data.id}`)
    }
  }

  useEffect(() => {
    fetchRestaurants()
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Restaurants</h1>
        <Button onClick={handleCreate}>+ Create New</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : restaurants.length === 0 ? (
        <p className="text-muted-foreground">No restaurant found. Please create one first.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              onClick={() => router.push(`/dashboard/${restaurant.id}`)}
              className="cursor-pointer hover:shadow-md transition"
            >
              <CardContent className="p-4">
                <h2 className="text-lg font-bold">{restaurant.name}</h2>
                <p className="text-sm text-muted-foreground">{restaurant.subdomain}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
