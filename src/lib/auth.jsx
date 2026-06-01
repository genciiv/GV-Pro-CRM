import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from './supabase'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (u) => {
    if (!u) { setProfile(null); setLoading(false); return }
    const timeout = setTimeout(() => { setProfile(null); setLoading(false) }, 8000)
    try {
      // 1. Platform Admin
      const { data: admin } = await supabase.from('platform_admins').select('*').eq('auth_id', u.id).maybeSingle()
      if (admin) { clearTimeout(timeout); setProfile({ type:'admin', data:admin }); setLoading(false); return }

      // 2. Nutritionist
      const { data: nutr } = await supabase.from('nutritionists').select('*').eq('auth_id', u.id).eq('status','approved').maybeSingle()
      if (nutr) { clearTimeout(timeout); setProfile({ type:'nutritionist', data:nutr }); setLoading(false); return }

      // 3. Gym User me auth_id
      const { data: gymUser } = await supabase.from('gym_users').select('*, gym:gyms(*)').eq('auth_id', u.id).eq('is_active', true).maybeSingle()
      if (gymUser) {
        const bizType = gymUser.gym?.business_type || 'gym'
        const profileType = ['barbershop','salon','spa','yoga','pilates','martial_arts'].includes(bizType) ? bizType : 'gym'
        clearTimeout(timeout); setProfile({ type: profileType, data:gymUser, gym:gymUser.gym }); setLoading(false); return
      }

      // 4. Member me auth_id
      const { data: member } = await supabase.from('members').select('*, gym:gyms(name,status)').eq('auth_id', u.id).eq('is_active', true).maybeSingle()
      if (member) { clearTimeout(timeout); setProfile({ type:'member', data:member, gym:member.gym }); setLoading(false); return }

      // 5. Gym User me email
      const { data: byEmail } = await supabase.from('gym_users').select('*, gym:gyms(*)').eq('email', u.email).is('auth_id', null).eq('is_active', true).maybeSingle()
      if (byEmail) {
        await supabase.from('gym_users').update({ auth_id: u.id }).eq('id', byEmail.id)
        const bizType = byEmail.gym?.business_type || 'gym'
        const profileType = ['barbershop','salon','spa','yoga','pilates','martial_arts'].includes(bizType) ? bizType : 'gym'
        clearTimeout(timeout); setProfile({ type: profileType, data:{...byEmail, auth_id:u.id}, gym:byEmail.gym }); setLoading(false); return
      }

      // 6. Nutritionist me email
      const { data: nutrByEmail } = await supabase.from('nutritionists').select('*').eq('email', u.email).is('auth_id', null).eq('status','approved').maybeSingle()
      if (nutrByEmail) {
        await supabase.from('nutritionists').update({ auth_id: u.id }).eq('id', nutrByEmail.id)
        clearTimeout(timeout); setProfile({ type:'nutritionist', data:{...nutrByEmail, auth_id:u.id} }); setLoading(false); return
      }

      // 7. Member me email
      const { data: memberByEmail } = await supabase.from('members').select('*, gym:gyms(name,status)').eq('email', u.email).is('auth_id', null).eq('is_active', true).maybeSingle()
      if (memberByEmail) {
        await supabase.from('members').update({ auth_id: u.id }).eq('id', memberByEmail.id)
        clearTimeout(timeout); setProfile({ type:'member', data:{...memberByEmail, auth_id:u.id}, gym:memberByEmail.gym }); setLoading(false); return
      }

      // 8. Google/Apple user i ri — client i zakonshëm (explore user)
      clearTimeout(timeout)
      setProfile({ type:'client', data:{ email: u.email, name: u.user_metadata?.full_name || u.email } })
      setLoading(false)

    } catch(e) { clearTimeout(timeout); setProfile(null); setLoading(false) }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null; setUser(u); loadProfile(u)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null; setUser(u)
      if (event === 'SIGNED_IN') loadProfile(u)
      if (event === 'SIGNED_OUT') { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  }

  const loginWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw new Error(error.message)
  }

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
  }

  const logout = async () => {
    await supabase.auth.signOut(); setUser(null); setProfile(null)
    window.location.href = '/login'
  }

  return (
    <Ctx.Provider value={{ user, profile, loading, login, loginWithGoogle, loginWithApple, logout,
      isAdmin:        profile?.type === 'admin',
      isGym:          profile?.type === 'gym',
      isNutritionist: profile?.type === 'nutritionist',
      isMember:       profile?.type === 'member',
      isClient:       profile?.type === 'client',
      gymId:          profile?.gym?.id ?? profile?.data?.gym_id ?? null,
    }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
