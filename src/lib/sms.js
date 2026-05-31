// src/lib/sms.js
// Helper për SMS dhe WhatsApp automatike me Twilio

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY     = import.meta.env.VITE_SUPABASE_ANON_KEY

// channel: 'sms' | 'whatsapp' | 'both'
async function sendSMS(type, to, data, channel = 'sms') {
  if (!to || to.length < 9) {
    console.log(`SMS skipped — no valid phone for: ${type}`)
    return { skipped: true }
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
      },
      body: JSON.stringify({ type, to, data, channel }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'SMS failed')
    console.log(`✅ SMS [${type}] → ${to}`)
    return result
  } catch (err) {
    // Mos bllo UI nëse SMS dështon
    console.warn(`⚠️ SMS failed [${type}]:`, err.message)
    return { error: err.message }
  }
}

// ── 1. Konfirmim Rezervimi (Barbershop/Salon/Spa) ─────────
export async function smsAppointmentConfirm({ appointment, gym, channel }) {
  if (!appointment.client_phone) return
  return sendSMS('appointment_confirm', appointment.client_phone, {
    service: appointment.service?.name || 'Shërbim',
    staff:   appointment.staff?.name,
    date:    new Date(appointment.appointment_date).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' }),
    time:    appointment.start_time?.slice(0,5),
    price:   appointment.price?.toLocaleString('sq-AL') || '—',
    gym:     gym?.name || 'Biznesi',
    phone:   gym?.phone || '',
    address: gym?.address ? `${gym.address}, ${gym.city}` : gym?.city,
  }, channel || 'sms')
}

// ── 2. Kujtues 24h Para ───────────────────────────────────
export async function smsAppointmentReminder({ appointment, gym, channel }) {
  if (!appointment.client_phone) return
  return sendSMS('appointment_reminder', appointment.client_phone, {
    service: appointment.service?.name || 'Shërbim',
    staff:   appointment.staff?.name,
    date:    new Date(appointment.appointment_date).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' }),
    time:    appointment.start_time?.slice(0,5),
    gym:     gym?.name || 'Biznesi',
    phone:   gym?.phone || '',
  }, channel || 'sms')
}

// ── 3. Kujtues 2h Para ────────────────────────────────────
export async function smsAppointmentReminder2h({ appointment, gym, channel }) {
  if (!appointment.client_phone) return
  return sendSMS('appointment_reminder_2h', appointment.client_phone, {
    service: appointment.service?.name || 'Shërbim',
    time:    appointment.start_time?.slice(0,5),
    gym:     gym?.name || 'Biznesi',
  }, channel || 'sms')
}

// ── 4. Konfirmim Pagese ───────────────────────────────────
export async function smsPaymentConfirm({ member, amount, plan, gym, channel }) {
  if (!member.phone) return
  return sendSMS('payment_confirm', member.phone, {
    plan:   plan?.name || 'Abonim',
    amount: Number(amount).toLocaleString('sq-AL'),
    date:   new Date().toLocaleDateString('sq-AL', { day:'numeric', month:'long', year:'numeric' }),
    gym:    gym?.name || 'Biznesi',
  }, channel || 'sms')
}

// ── 5. Abonim Skadon (3 Ditë) ────────────────────────────
export async function smsMembershipExpiring({ member, plan, expiryDate, daysLeft, gym, channel }) {
  if (!member.phone) return
  return sendSMS('membership_expiring', member.phone, {
    plan:   plan?.name || 'Abonim',
    days:   daysLeft,
    expiry: new Date(expiryDate).toLocaleDateString('sq-AL', { day:'numeric', month:'long' }),
    gym:    gym?.name || 'Biznesi',
    phone:  gym?.phone || '',
  }, channel || 'sms')
}

// ── 6. Abonim i Skaduar ───────────────────────────────────
export async function smsMembershipExpired({ member, gym, channel }) {
  if (!member.phone) return
  return sendSMS('membership_expired', member.phone, {
    gym:   gym?.name || 'Biznesi',
    phone: gym?.phone || '',
  }, channel || 'sms')
}

// ── 7. Konfirmim Klase (Yoga/Pilates) ─────────────────────
export async function smsClassBookingConfirm({ booking, yogaClass, gym, channel }) {
  if (!booking.client_phone) return
  return sendSMS('class_booking_confirm', booking.client_phone, {
    class:    yogaClass?.class_type || 'Klasë',
    date:     new Date(yogaClass?.date).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' }),
    time:     yogaClass?.start_time?.slice(0,5),
    duration: yogaClass?.duration_min,
    price:    (yogaClass?.price || 0).toLocaleString('sq-AL'),
    gym:      gym?.name || 'Studio',
  }, channel || 'sms')
}

// ── 8. Anulim Rezervimi ───────────────────────────────────
export async function smsAppointmentCancelled({ appointment, gym, channel }) {
  if (!appointment.client_phone) return
  return sendSMS('appointment_cancelled', appointment.client_phone, {
    service: appointment.service?.name || 'Shërbim',
    date:    new Date(appointment.appointment_date).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' }),
    time:    appointment.start_time?.slice(0,5),
    gym:     gym?.name || 'Biznesi',
    phone:   gym?.phone || '',
  }, channel || 'sms')
}

// ── 9. Mirëseardhje Anëtar ────────────────────────────────
export async function smsMemberWelcome({ member, plan, gym, channel }) {
  if (!member.phone) return
  return sendSMS('member_welcome', member.phone, {
    name:  member.full_name || `${member.first_name} ${member.last_name}`,
    plan:  plan?.name,
    gym:   gym?.name || 'Biznesi',
    phone: gym?.phone || '',
  }, channel || 'sms')
}

// ── 10. Demo Konfirmim (te klienti) ──────────────────────
export async function smsDemoConfirm({ demoRequest, channel }) {
  if (!demoRequest.phone) return
  return sendSMS('demo_confirm', demoRequest.phone, {
    name:    demoRequest.name,
    bizType: demoRequest.biz_type,
  }, channel || 'sms')
}

// ── BULK: Dërgon Kujtues Ditore ───────────────────────────
// Thirr nga dashboard çdo ditë — dërgon tek të gjithë klientët nesër
export async function sendDailySMSReminders(supabase, gymId, channel = 'sms') {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  try {
    const { data: gym } = await supabase.from('gyms').select('name,phone').eq('id', gymId).single()

    // Rezervimet e nesërme
    const { data: appts } = await supabase
      .from('appointments')
      .select('*, service:services(name), staff(name)')
      .eq('gym_id', gymId)
      .eq('appointment_date', tomorrowStr)
      .eq('status', 'confirmed')
      .not('client_phone', 'is', null)

    let sent = 0
    for (const a of appts || []) {
      await smsAppointmentReminder({ appointment: a, gym, channel })
      await new Promise(r => setTimeout(r, 300)) // Rate limit
      sent++
    }

    // Anëtarë me abonim që skadon brenda 3 ditësh
    const { data: expiring } = await supabase
      .from('members_with_status')
      .select('*')
      .eq('gym_id', gymId)
      .gte('days_remaining', 0)
      .lte('days_remaining', 3)
      .not('phone', 'is', null)

    for (const m of expiring || []) {
      await smsMembershipExpiring({
        member: m,
        plan: { name: m.plan_name },
        expiryDate: m.membership_end,
        daysLeft: m.days_remaining,
        gym,
        channel,
      })
      await new Promise(r => setTimeout(r, 300))
      sent++
    }

    return { sent, appointments: appts?.length || 0, expiring: expiring?.length || 0 }
  } catch (err) {
    console.error('Daily SMS reminders error:', err)
    return { error: err.message }
  }
}
