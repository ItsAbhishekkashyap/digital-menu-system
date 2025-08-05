'use client'

import { withAuth } from '@/components/withAuth'

function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    </div>
  )
}

export default withAuth(AdminPage, ['admin'])
