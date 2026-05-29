import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, memberName, gymName, gymId } = await req.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email është i detyrueshëm' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Krijo admin client me Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Kontrollo nëse useri ekziston tashmë
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.email === email)

    let userId = existingUser?.id

    if (!existingUser) {
      // Krijo user të ri
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // Konfirmo direkt pa email verifikimi
        user_metadata: { gym_name: gymName, member_name: memberName }
      })

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      userId = newUser.user.id
    }

    // Lidh auth_id me members tabela
    if (userId && gymId) {
      await supabaseAdmin
        .from('members')
        .update({ auth_id: userId })
        .eq('email', email)
        .eq('gym_id', gymId)
        .is('auth_id', null)
    }

    // Dërgo Magic Link (OTP)
    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    const { error: otpError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: siteUrl,
        data: { gym_name: gymName, member_name: memberName }
      }
    })

    // Nëse generateLink nuk funksionon, përdor inviteUserByEmail
    if (otpError) {
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: siteUrl,
        data: { gym_name: gymName }
      })
      if (inviteError) throw new Error(inviteError.message)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `📧 Invitation u dërgua te ${email}`,
        userId,
        isNew: !existingUser
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
