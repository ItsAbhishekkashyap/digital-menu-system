'use client'

import { withAuth } from '@/components/withAuth'

function OwnerPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Restaurant Owner Panel</h1>
    </div>
  )
}

export default withAuth(OwnerPage, ['restaurant_owner'])
