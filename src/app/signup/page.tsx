// 'use client'

// import { useState } from 'react'
// // import { useRouter } from 'next/navigation'
// import { supabase } from '@/lib/supabase'

// export default function SignupPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [role, setRole] = useState<'admin' | 'restaurant_owner' | 'customer'>('customer')
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const [loading, setLoading] = useState(false)
// //   const router = useRouter()

//   const handleSignup = async () => {
//     setLoading(true)
//     setError('')
//     setSuccess('')

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           emailRedirectTo: `${window.location.origin}/auth/callback`,
//         },
        
//       }
//     })

//     if (error) {
//       setError(error.message)
//     } else {
//       setSuccess('Signup successful! Please check your email to confirm.')
//       setEmail('')
//       setPassword('')
//       setRole('customer')
//     }

//     setLoading(false)
//   }

//   console.log('Signup successful — role sent:', role)


//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center px-4">
//       <h1 className="text-3xl font-bold mb-6">Signup</h1>

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

//         <select
//           value={role}
//           onChange={(e) => setRole(e.target.value as 'admin' | 'restaurant_owner' | 'customer')}
//           className="border bg-gray-700 p-2 w-full"
//         >
//           <option value="customer">Customer</option>
//           <option value="restaurant_owner ">Restaurant Owner</option>
//           <option value="admin ">Admin</option>
//         </select>

//         <button
//           onClick={handleSignup}
//           className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
//           disabled={loading}
//         >
//           {loading ? 'Signing up...' : 'Signup'}
//         </button>

//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
//         {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
//       </div>
//     </div>
//   )
// }


// app/signup/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'restaurant_owner' | 'customer'>('customer')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async () => {
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✅ Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-3xl font-bold mb-6">Signup</h1>

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
        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value as 'admin' | 'restaurant_owner' | 'customer')
          }
          className="border p-2 w-full"
        >
          <option value="customer">Customer</option>
          <option value="restaurant_owner">Restaurant Owner</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={handleSignup}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Signup'}
        </button>

        {message && <p className="text-sm mt-2 text-center">{message}</p>}
      </div>
    </div>
  )
}




