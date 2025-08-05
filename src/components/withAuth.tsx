'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/useAuthStore'

export function withAuth(Component: React.FC, allowedRoles: string[]) {
  return function ProtectedRoute() {
    const user = useAuthStore((state) => state.user)
    const router = useRouter()

    useEffect(() => {
      if (!user) {
        router.replace('/login')
      } else {
        const role = user.user_metadata?.role
        if (!allowedRoles.includes(role)) {
          router.replace('/login')
        }
      }
    }, [user, router])

    if (!user) return null // or loading spinner

    const role = user.user_metadata?.role
    if (!allowedRoles.includes(role)) return null

    return <Component />
  }
}
