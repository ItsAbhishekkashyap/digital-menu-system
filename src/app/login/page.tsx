// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'

// export default function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const router = useRouter()

//   const handleLogin = async () => {
//     setError('')
//     const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     })
    

//     if (authError || !authData.user) {
//       setError(authError?.message || 'Login failed')
//       return
//     }

//     const userId = authData.user.id

//     const { data: profile, error: profileError } = await supabase
//       .from('user_profiles')
//       .select('role')
//       .eq('id', userId)
//       .single()

//     if (profileError || !profile) {
//       setError('User profile not found. Please contact support.')
//       return
//     }

//     const role = profile.role

//     if (role === 'admin') {
//       router.push('/admin')
//     } else if (role === 'restaurant_owner') {
//       router.push('/restaurant')
//     } else if (role === 'customer') {
//       router.push('/menu')
//     } else {
//       setError('Unknown role.')
//     }
//   }
  

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center px-4">
//       <h1 className="text-3xl font-bold mb-6">Login</h1>

//       <div className="w-full max-w-sm space-y-4">
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           className="border p-2 w-full"
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           className="border p-2 w-full"
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           onClick={handleLogin}
//           className="bg-blue-600 text-white px-4 py-2 rounded w-full"
//         >
//           Login
//         </button>

//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//       </div>
//     </div>
//   )
// }

// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase' // adjust this if needed

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else if (data.user) {
      const role = data.user.user_metadata?.role

      if (role === 'restaurant_owner') {
        router.push('/dashboard/restaurant')
      } else if (role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/menu')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      <div className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          className="border p-2 w-full"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="border p-2 w-full"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`bg-blue-600 text-white px-4 py-2 rounded w-full ${loading ? 'opacity-50' : ''}`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  )
}

export default LoginPage
