// supabase/functions/send-sms/index.ts
// SMS dhe WhatsApp automatike me Twilio

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TEMPLATES: Record<string, (d: any) => string> = {
  appointment_confirm: d =>
    `✅ Rezervimi u konfirmua!\n\n${d.service}${d.staff ? ` me ${d.staff}` : ''}\n📅 ${d.date} ora ${d.time}\n💰 ${d.price} L (cash)\n📍 ${d.gym}\n\nNëse anuloni: ${d.phone}`,

  appointment_reminder: d =>
    `⏰ Kujtues — takimi juaj NESËR!\n\n${d.service}${d.staff ? ` me ${d.staff}` : ''}\n📅 ${d.date} ora ${d.time}\n📍 ${d.gym}\n\nNëse nuk mund të vini: ${d.phone}`,

  appointment_reminder_2h: d =>
    `🔔 Takimi fillon pas 2 orësh!\n\n${d.service} ora ${d.time}\n📍 ${d.gym}\n\nJini gati 5 min para! ✨`,

  payment_confirm: d =>
    `💰 Pagesa u regjistrua!\n\n${d.plan || 'Abonim'}: ${d.amount} L\n📅 ${d.date}\n🏢 ${d.gym}\n\nFaleminderit! 🙏`,

  membership_expiring: d =>
    `⚠️ Abonimi skadon për ${d.days} ditë!\n\n${d.plan} te ${d.gym}\nSkadon: ${d.expiry}\n\nRinovoni: ${d.phone}`,

  membership_expired: d =>
    `❌ Abonimi juaj ka skaduar!\n\n${d.gym}\n\nRinovoni tani: ${d.phone}`,

  class_booking_confirm: d =>
    `✅ Vendi u rezervua!\n\n${d.class} — ${d.date} ora ${d.time}\n⏱ ${d.duration} min · 💰 ${d.price} L\n📍 ${d.gym}\n\nSillni veshje të rehatshme! 🧘`,

  appointment_cancelled: d =>
    `❌ Rezervimi u anulua\n\n${d.service} — ${d.date} ora ${d.time}\n\nPër rezervim të ri: ${d.phone || d.gym}`,

  member_welcome: d =>
    `🎉 Mirë se vini te ${d.gym}!\n\nPlani: ${d.plan || 'Aktiv'}\nApp: vaqo.al\n\nPyetje? ${d.phone}`,

  demo_confirm: d =>
    `📅 Demo u rezervua!\n\nEmri: ${d.name}\n\nDo t'ju kontaktojmë brenda 24 orësh.\n\nVaqo 💪`,
}

async function sendViaTwilio(to: string, body: string, whatsApp: boolean) {
  const sid  = Deno.env.get('TWILIO_ACCOUNT_SID')
  const auth = Deno.env.get('TWILIO_AUTH_TOKEN')
  const fromSMS = Deno.env.get('TWILIO_FROM_SMS')
  const fromWA  = Deno.env.get('TWILIO_FROM_WHATSAPP')

  if (!sid || !auth) throw new Error('Twilio credentials missing')

  let num = to.replace(/\s/g, '')
  if (!num.startsWith('+')) num = '+355' + (num.startsWith('0') ? num.slice(1) : num)

  const from = whatsApp ? fromWA : fromSMS
  const to2  = whatsApp ? `whatsapp:${num}` : num
  if (!from) throw new Error(`Twilio ${whatsApp?'WhatsApp':'SMS'} number not set`)

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: { 'Authorization': `Basic ${btoa(`${sid}:${auth}`)}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: from, To: to2, Body: body }),
    }
  )
  const r = await res.json()
  if (!res.ok) throw new Error(r.message || `Twilio error ${res.status}`)
  return { sid: r.sid, status: r.status }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const { type, to, data, channel = 'sms' } = await req.json()
    if (!to || !type) throw new Error('Missing: to, type')

    const fn = TEMPLATES[type]
    if (!fn) throw new Error(`Unknown type: ${type}`)
    const body = fn(data)

    const results: any = {}
    if (channel === 'sms'       || channel === 'both') { try { results.sms       = await sendViaTwilio(to,body,false) } catch(e:any){results.sms_error=e.message} }
    if (channel === 'whatsapp'  || channel === 'both') { try { results.whatsapp  = await sendViaTwilio(to,body,true)  } catch(e:any){results.wa_error=e.message}  }

    console.log(`📱 [${type}] → ${to}`, results)
    return new Response(JSON.stringify({ success:true, results }), { headers:{...corsHeaders,'Content-Type':'application/json'} })
  } catch(err:any) {
    return new Response(JSON.stringify({ error:err.message }), { status:400, headers:{...corsHeaders,'Content-Type':'application/json'} })
  }
})
