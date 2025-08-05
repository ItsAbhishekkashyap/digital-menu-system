'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function OwnerDashboard() {
  const [restaurantName, setRestaurantName] = useState('')
  const [menuItems, setMenuItems] = useState([{ name: '', price: '' }])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', price: '' }])
  }

  const updateMenuItem = (index: number, field: string, value: string) => {
    const newItems = [...menuItems]
    newItems[index][field as 'name' | 'price'] = value

    setMenuItems(newItems)
  }

  const handleSubmit = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('User not authenticated')
      return
    }

    const { error } = await supabase.from('menus').insert([
      {
        owner_id: user.id,
        restaurant_name: restaurantName,
        menu_items: menuItems,
      },
    ])

    if (error) {
      alert('Error saving menu: ' + error.message)
    } else {
      alert('Menu saved successfully!')
      router.push('/owner-dashboard') // Reload
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>

      <input
        className="border w-full p-2 mb-4"
        placeholder="Restaurant Name"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
      />

      <h2 className="font-semibold mb-2">Menu Items:</h2>
      {menuItems.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            className="border p-2 flex-1"
            placeholder="Item Name"
            value={item.name}
            onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
          />
          <input
            className="border p-2 w-24"
            placeholder="Price"
            value={item.price}
            onChange={(e) => updateMenuItem(index, 'price', e.target.value)}
          />
        </div>
      ))}
      <button onClick={addMenuItem} className="bg-gray-200 px-3 py-1 rounded mb-4">
        + Add Item
      </button>

      <br />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving...' : 'Save Menu'}
      </button>
    </div>
  )
}
