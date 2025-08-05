'use client'

import { withAuth } from '@/components/withAuth'

function MenuPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Customer Menu</h1>
    </div>
  )
}

export default withAuth(MenuPage, ['customer'])
