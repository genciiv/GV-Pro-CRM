import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, password, gym_id, owner_name, role } = await req.json()

    // Admin client me service_role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Krijo Auth User
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // konfirmo direkt pa email
    })

    if (authError) {
      // Nëse useri ekziston, merr ID-n
      if (authError.message.includes('already registered')) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existing = existingUsers?.users?.find(u => u.email === email)
        if (existing) {
          // Linko me gym_users
          await supabaseAdmin.from('gym_users').upsert({
            auth_id: existing.id, gym_id, name: owner_name, email, role: role || 'owner', is_active: true
          }, { onConflict: 'auth_id' })
          return new Response(JSON.stringify({ success: true, user_id: existing.id, note: 'existing user linked' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
      throw authError
    }

    // 2. Shto në gym_users
    const { error: guError } = await supabaseAdmin.from('gym_users').insert({
      auth_id: authUser.user.id,
      gym_id,
      name: owner_name,
      email,
      role: role || 'owner',
      is_active: true
    })

    if (guError) throw guError

    return new Response(JSON.stringify({ success: true, user_id: authUser.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
