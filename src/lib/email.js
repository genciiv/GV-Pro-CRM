// src/lib/email.js
// Helper për dërgimin e emaileve automatike

import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY     = import.meta.env.VITE_SUPABASE_ANON_KEY

// Funksioni bazë i dërgimit
async function sendEmail(type, to, data) {
  if (!to || !to.includes('@')) {
    console.log(`Email skipped — no valid email for type: ${type}`)
    return { skipped: true }
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ANON_KEY}`,
        'apikey': ANON_KEY,
      },
      body: JSON.stringify({ type, to, data }),
    })
    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Email failed')
    console.log(`✅ Email sent: ${type} → ${to}`)
    return result
  } catch (err) {
    // Mos bllo UI nëse emaili dështon
    console.warn(`⚠️ Email failed (${type}):`, err.message)
    return { error: err.message }
  }
}

// ── 1. KONFIRMIM REZERVIMI (Barbershop/Salon/Spa) ─────────
export async function emailAppointmentConfirm({ appointment, gym }) {
  if (!appointment.client_email) return
  return sendEmail('appointment_confirm', appointment.client_email, {
    clientName:  appointment.client_name,
    serviceName: appointment.service?.name || 'Shërbim',
    staffName:   appointment.staff?.name,
    date:        new Date(appointment.appointment_date).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' }),
    time:        appointment.start_time?.slice(0, 5),
    price:       appointment.price?.toLocaleString('sq-AL'),
    gymName:     gym?.name || 'Biznesi',
    gymPhone:    gym?.phone,
    gymAddress:  gym?.address ? `${gym.address}, ${gym.city}` : gym?.city,
  })
}

// ── 2. KUJTUES 24H PARA TAKIMIT ───────────────────────────
export async function emailAppointmentReminder({ appointment, gym }) {
  if (!appointment.client_email) return
  return sendEmail('appointment_reminder', appointment.client_email, {
    clientName:  appointment.client_name,
    serviceName: appointment.service?.name || 'Shërbim',
    staffName:   appointment.staff?.name,
    date:        new Date(appointment.appointment_date).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' }),
    time:        appointment.start_time?.slice(0, 5),
    gymName:     gym?.name || 'Biznesi',
    gymPhone:    gym?.phone,
  })
}

// ── 3. NJOFTIM SKADIMI ABONIMI ────────────────────────────
export async function emailMembershipExpiring({ member, plan, expiryDate, daysLeft, gym }) {
  if (!member.email) return
  return sendEmail('membership_expiring', member.email, {
    memberName:  member.full_name || `${member.first_name} ${member.last_name}`,
    planName:    plan?.name || 'Abonim',
    expiryDate:  new Date(expiryDate).toLocaleDateString('sq-AL', { day:'numeric', month:'long', year:'numeric' }),
    daysLeft,
    gymName:     gym?.name || 'Palestra',
    gymPhone:    gym?.phone,
  })
}

// ── 4. MIRËSEARDHJE ANËTARIT TË RI ────────────────────────
export async function emailMemberWelcome({ member, plan, gym }) {
  if (!member.email) return
  return sendEmail('member_welcome', member.email, {
    memberName:  member.full_name || `${member.first_name} ${member.last_name}`,
    planName:    plan?.name,
    gymName:     gym?.name || 'Palestra',
    gymPhone:    gym?.phone,
    registerUrl: `${window.location.origin}/register`,
    appUrl:      window.location.origin,
  })
}

// ── 5. NJOFTIM BOOK DEMO (te admin) ───────────────────────
export async function emailDemoRequest({ demoRequest, adminEmail }) {
  const to = adminEmail || import.meta.env.VITE_ADMIN_EMAIL || 'vaqogenci@gmail.com'
  return sendEmail('demo_request', to, {
    name:    demoRequest.name,
    phone:   demoRequest.phone,
    email:   demoRequest.email,
    bizType: demoRequest.biz_type,
    bizName: demoRequest.biz_name,
    city:    demoRequest.city,
    hours:   demoRequest.preferred_hours,
    message: demoRequest.message,
  })
}

// ── 6. KONFIRMIM REZERVIMI KLASE (Yoga/Pilates) ───────────
export async function emailClassBookingConfirm({ booking, yogaClass, gym }) {
  if (!booking.client_email) return
  return sendEmail('class_booking_confirm', booking.client_email, {
    clientName: booking.client_name,
    className:  yogaClass?.class_type || 'Klasë',
    date:       new Date(yogaClass?.date).toLocaleDateString('sq-AL', { weekday:'long', day:'numeric', month:'long' }),
    time:       yogaClass?.start_time?.slice(0, 5),
    duration:   yogaClass?.duration_min,
    price:      (yogaClass?.price || 0).toLocaleString('sq-AL'),
    gymName:    gym?.name || 'Studio',
    gymPhone:   gym?.phone,
  })
}

// ── CRON JOB — Dërgon kujtues ditore ─────────────────────
// Thirr këtë funksion çdo ditë në orën 09:00
// (nga Supabase Cron ose çdo herë kur hapet dashboard)
export async function sendDailyReminders(gymId) {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Merr rezervimet e nesërme
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*, service:services(name), staff(name), gym:gyms(name,phone)')
      .eq('gym_id', gymId)
      .eq('appointment_date', tomorrowStr)
      .eq('status', 'confirmed')
      .not('client_email', 'is', null)

    for (const appt of appointments || []) {
      await emailAppointmentReminder({ appointment: appt, gym: appt.gym })
      // Prit 200ms mes emaileve — mos dërgo shumë njëherësh
      await new Promise(r => setTimeout(r, 200))
    }

    // Merr anëtarët me abonim që skadon brenda 3 ditësh
    const in3days = new Date()
    in3days.setDate(in3days.getDate() + 3)
    const in3daysStr = in3days.toISOString().split('T')[0]

    const { data: expiring } = await supabase
      .from('members_with_status')
      .select('*, gym:gyms(name,phone)')
      .eq('gym_id', gymId)
      .gte('days_remaining', 0)
      .lte('days_remaining', 3)
      .not('email', 'is', null)

    for (const member of expiring || []) {
      await emailMembershipExpiring({
        member,
        plan: { name: member.plan_name },
        expiryDate: member.membership_end,
        daysLeft: member.days_remaining,
        gym: member.gym,
      })
      await new Promise(r => setTimeout(r, 200))
    }

    console.log(`✅ Daily reminders sent for gym ${gymId}`)
    return { appointments: appointments?.length || 0, expiring: expiring?.length || 0 }
  } catch (err) {
    console.error('Daily reminders error:', err)
    return { error: err.message }
  }
}
