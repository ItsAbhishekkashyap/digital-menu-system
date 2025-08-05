'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('restaurants').select('*')
      console.log({ data, error })
    }
    fetchData()
  }, [])

  return <div className="p-6 text-xl font-semibold">Check console for Supabase test!</div>
}
