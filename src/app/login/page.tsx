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

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// --- SVG ICONS ---
const MailIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
);

const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
);

const LoaderIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const supabase = createClientComponentClient<Database>()

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true)
        setError('')

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else if (data.user) {
            // Role-based redirection logic remains the same
            const role = data.user.user_metadata?.role
            if (role === 'restaurant_owner') {
                router.push('/dashboard') // A single dashboard entry point is cleaner
            } else if (role === 'admin') {
                router.push('/dashboard/admin')
            } else {
                router.push('/') // Redirect to home or another appropriate page
            }
            router.refresh(); // Refresh router state
        }
        setLoading(false)
    }

    return (
        <>
        {/* We can reuse the button style from the onboarding page */}
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
            <div className="hidden lg:block relative">
                <Image
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
                    alt="A vibrant restaurant interior"
                    layout="fill"
                    objectFit="cover"
                    className="opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                <div className="relative flex flex-col justify-end h-full p-12 text-white">
                    <Link href="/" className="text-3xl font-bold">Menu<span className="text-orange-500">.</span></Link>
                    <p className="mt-4 text-lg text-gray-300">The simplest way to bring your restaurant&#39;s menu into the digital age.</p>
                </div>
            </div>
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-400">
                            Or{' '}
                            <Link href="/signup" className="font-medium text-orange-500 hover:text-orange-400">
                                create a new account
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm -space-y-px">
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
                            <div className="relative pt-4">
                                <LockIcon className="pointer-events-none w-5 h-5 absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-md relative block w-full px-3 py-3 pl-12 border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <a href="#" className="font-medium text-orange-500 hover:text-orange-400">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !email || !password}
                                className="group cta-button relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <LoaderIcon className="animate-spin mr-2"/>
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    )
}
