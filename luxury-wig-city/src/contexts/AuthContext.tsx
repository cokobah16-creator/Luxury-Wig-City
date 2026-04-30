import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole, VendorProfile } from '../lib/database.types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  vendorProfile: VendorProfile | null
  loading: boolean
  /** Convenience role checks. */
  isAdmin: boolean
  isVendor: boolean
  isCustomer: boolean
  /** Auth actions. */
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>
  signInWithGoogle: () => Promise<{ error: Error | null }>
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  /** Refresh the cached profile (after vendor onboarding etc.). */
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    setProfile(prof as Profile | null)

    const { data: vp } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    setVendorProfile(vp as VendorProfile | null)
  }, [])

  const refresh = useCallback(async () => {
    if (user) await loadProfile(user.id)
  }, [user, loadProfile])

  useEffect(() => {
    let mounted = true

    // Initial session check
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    // Subscribe to auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!mounted) return
      setSession(sess)
      setUser(sess?.user ?? null)
      if (sess?.user) {
        await loadProfile(sess.user.id)
      } else {
        setProfile(null)
        setVendorProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signUp: AuthContextValue['signUp'] = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    return { error: error as Error | null }
  }

  const signInWithGoogle: AuthContextValue['signInWithGoogle'] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/account` }
    })
    return { error: error as Error | null }
  }

  const signInWithMagicLink: AuthContextValue['signInWithMagicLink'] = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/account` }
    })
    return { error: error as Error | null }
  }

  const signOut: AuthContextValue['signOut'] = async () => {
    await supabase.auth.signOut()
    setProfile(null)
    setVendorProfile(null)
  }

  const role: UserRole = profile?.role ?? 'customer'
  const value: AuthContextValue = {
    user,
    session,
    profile,
    vendorProfile,
    loading,
    isAdmin:    role === 'admin',
    isVendor:   role === 'vendor',
    isCustomer: role === 'customer',
    signIn,
    signUp,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
    refresh
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
