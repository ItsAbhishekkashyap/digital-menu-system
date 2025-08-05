import {create} from 'zustand'
import type {User} from '@supabase/supabase-js'

interface AuthState {
    user: User | null;
    role: string | null;
    setRole: (role: string) => void;
    setUser: (user: User | null)=> void
}

export const useAuthStore = create<AuthState>((set)=>({
    user: null,
    role: null,
    setUser:(user) => set({user}),
    setRole: (role) => set({ role }),
}))