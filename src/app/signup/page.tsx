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
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// --- SVG ICONS ---
const UserIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
);
const MailIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);
const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);
const LoaderIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'restaurant_owner' | 'customer'>('restaurant_owner')
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)
        setMessage('')
        setIsError(false)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { role },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage(error.message)
            setIsError(true)
        } else {
            setMessage('✅ Check your email to confirm your account.')
            setIsError(false)
        }

        setLoading(false)
    }

    return (
        <>
        <style jsx global>{`
            .cta-button {
                background: linear-gradient(90deg, #F97316, #EA580C);
                transition: all 0.3s ease;
            }
            .cta-button:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
            }
        `}</style>
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-gray-900">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            Create Your Account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400">
                                Sign In
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSignup}>
                        <div className="rounded-md shadow-sm space-y-4">
                            {/* Email Input */}
                            <div className="relative">
                                <MailIcon className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400" />
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-3 pl-12 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {/* Password Input */}
                            <div className="relative">
                                <LockIcon className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                    className="appearance-none rounded-md relative block w-full px-3 py-3 pl-12 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Password (min. 6 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                             {/* Role Selector */}
                            <div className="relative">
                                <UserIcon className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400" />
                                <select
                                    id="role"
                                    name="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as 'restaurant_owner' | 'customer')}
                                    className=" rounded-md relative block w-full px-3 py-3 pl-12 border border-gray-700 bg-gray-800 text-gray-200 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                >
                                    <option value="restaurant_owner">I am a Restaurant Owner</option>
                                    <option value="customer">I am a Customer</option>
                                </select>
                            </div>
                        </div>

                        {message && (
                            <p className={`text-sm text-center ${isError ? 'text-red-400' : 'text-green-400'}`}>
                                {message}
                            </p>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !email || !password}
                                className="group cta-button relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <LoaderIcon className="animate-spin mr-2"/>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="hidden lg:block relative">
                <Image
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1974&auto=format&fit=crop"
                    alt="A modern restaurant dining area"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="relative flex flex-col justify-end h-full p-12 text-white">
                    <Link href="/" className="text-3xl font-bold"><span className="text-orange-500 mr-1">✦</span>Menu<span className=" text-orange-500">Luxe</span></Link>
                    <p className="mt-4 text-lg text-gray-300">Join a community of modern restaurants. Go digital in minutes, not weeks.</p>
                </div>
            </div>
        </div>
        </>
    )
}




