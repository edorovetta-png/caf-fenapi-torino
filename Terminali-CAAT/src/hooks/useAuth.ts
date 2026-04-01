import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

interface AuthState {
  session: Session | null
  profile: Profile | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null, profile: null, loading: true,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id).then((profile) =>
          setState({ session, profile, loading: false }))
      } else {
        setState({ session: null, profile: null, loading: false })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          const profile = await fetchProfile(session.user.id)
          setState({ session, profile, loading: false })
        } else {
          setState({ session: null, profile: null, loading: false })
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const isAdmin = state.profile?.role === 'admin'
  const role: UserRole | null = state.profile?.role ?? null

  return { ...state, login, logout, isAdmin, role }
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}
