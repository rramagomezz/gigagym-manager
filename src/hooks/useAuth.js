import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_EMAILS = ['rg17415@gmail.com', 'gigagym.centro@gmail.com', 'franco.83ed@gmail.com']

export function useAuth() {
  const [user, setUser] = useState(null)
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchEmployee(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchEmployee(session.user)
      else { setEmployee(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchEmployee(user) {
    try {
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setEmployee(data)
    } catch {
      setEmployee(null)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user ? ADMIN_EMAILS.includes(user.email) : false

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, employee, loading, isAdmin, signIn, signOut }
}
