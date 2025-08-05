'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const refreshSession = async () => {
      await supabase.auth.getSession()
      router.push('/login') // redirect after confirming
    }
    refreshSession()
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Confirming your email...</p>
    </div>
  )
}

