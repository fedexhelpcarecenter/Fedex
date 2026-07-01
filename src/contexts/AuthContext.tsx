import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  gender: string | null
  location: string | null
  avatar_url: string | null
  id_card_front: string | null
  id_card_back: string | null
  id_verified: boolean
  balance: number
  is_active: boolean
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  dbError: string | null
  login: (email: string, password: string) => Promise<{ error: any }>
  signup: (email: string, password: string, data: Partial<Profile>) => Promise<{ error: any }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
        setDbError('Unable to connect to database. Some features may be unavailable.')
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (data) setProfile(data as Profile)
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signup(email: string, password: string, data: Partial<Profile>) {
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data }
    })
    if (signUpErr) return { error: signUpErr }

    const { data: { user: newUser }, error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
    if (signInErr || !newUser) return { error: signInErr || new Error('Sign in after signup failed') }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        phone: data.phone || null,
        gender: data.gender || null,
        location: data.location || null,
        id_card_front: data.id_card_front || null,
        id_card_back: data.id_card_back || null,
        avatar_url: data.avatar_url || null,
      })
      .eq('id', newUser.id)

    if (updateErr) return { error: updateErr }

    await supabase.auth.signOut()
    return { error: null }
  }

  async function logout() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, dbError, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
