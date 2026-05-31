// src/lib/webpush.js
// Web Push Notifications — Rezervim, Pagesa, Anëtar i ri

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

// ── Konverto VAPID key ────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// ── Kërko leje për notifikime ─────────────────────────────
export async function requestPushPermission() {
  if (!('Notification' in window)) return { ok: false, reason: 'not_supported' }
  if (!('serviceWorker' in navigator)) return { ok: false, reason: 'no_sw' }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return { ok: false, reason: 'denied' }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    return { ok: true, subscription }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

// ── Dërgo notifikim lokal (pa server) ────────────────────
// Kjo funksionon pa VAPID — direkt nga browser
export function notify(title, body, options = {}) {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    tag: options.tag || 'vaqo',
    requireInteraction: options.requireInteraction || false,
    silent: options.silent || false,
    ...options,
  })

  notification.onclick = () => {
    window.focus()
    if (options.url) window.location.href = options.url
    notification.close()
  }

  return notification
}

// ── Kërko leje pa VAPID (simpler) ────────────────────────
export async function requestSimplePermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const result = await Notification.requestPermission()
  return result === 'granted'
}

// ── Notifikime specifike të Vaqo ─────────────────────────

export function notifyNewBooking(appointment) {
  const time = appointment.start_time?.slice(0,5)
  const date = new Date(appointment.appointment_date).toLocaleDateString('sq-AL', { weekday:'short', day:'numeric', month:'short' })
  notify(
    `📅 Rezervim i Ri!`,
    `${appointment.client_name} · ${appointment.service?.name || 'Shërbim'}\n${date} ora ${time}`,
    { tag:'booking', url:'/dashboard', requireInteraction: true }
  )
  // Sound via AudioContext
  playSound('booking')
}

export function notifyNewPayment(payment) {
  notify(
    `💰 Pagesa e Re!`,
    `${payment.member_name || 'Klient'} · ${payment.amount?.toLocaleString('sq-AL')} L`,
    { tag:'payment', url:'/dashboard/payments' }
  )
  playSound('payment')
}

export function notifyNewMember(member) {
  notify(
    `🎉 Anëtar i Ri!`,
    `${member.first_name} ${member.last_name} u regjistrua`,
    { tag:'member', url:'/dashboard/members' }
  )
  playSound('success')
}

export function notifyMembershipExpiring(member, daysLeft) {
  notify(
    `⚠️ Abonim po Skadon`,
    `${member.first_name} ${member.last_name} · ${daysLeft} ditë të mbetura`,
    { tag:`expiring-${member.id}`, url:'/dashboard/memberships' }
  )
}

export function notifyCheckin(member) {
  notify(
    `🚪 Check-in`,
    `${member.first_name} ${member.last_name} hyri`,
    { tag:'checkin', silent: true }
  )
}

// ── Tinguj me Web Audio API ───────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const sounds = {
      booking: { freq:[523, 659, 784], dur:0.12, vol:0.3 },
      payment: { freq:[659, 784, 1047], dur:0.1, vol:0.25 },
      success: { freq:[523, 659, 784, 1047], dur:0.08, vol:0.2 },
    }

    const s = sounds[type] || sounds.booking
    let time = ctx.currentTime

    s.freq.forEach(freq => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.setValueAtTime(freq, time)
      o.type = 'sine'
      g.gain.setValueAtTime(s.vol, time)
      g.gain.exponentialRampToValueAtTime(0.001, time + s.dur)
      o.start(time); o.stop(time + s.dur)
      time += s.dur * 0.8
    })
  } catch(e) {
    // Audio not supported — silently fail
  }
}

// ── Realtime listener — dëgjon rezervimet e reja ─────────
let realtimeChannel = null

export function startRealtimeNotifications(gymId, supabase) {
  if (realtimeChannel) realtimeChannel.unsubscribe()

  realtimeChannel = supabase
    .channel(`gym-${gymId}-notifications`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'appointments',
      filter: `gym_id=eq.${gymId}`,
    }, payload => {
      if (!payload.new.is_test) notifyNewBooking(payload.new)
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'payments',
      filter: `gym_id=eq.${gymId}`,
    }, payload => {
      notifyNewPayment(payload.new)
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'members',
      filter: `gym_id=eq.${gymId}`,
    }, payload => {
      notifyNewMember(payload.new)
    })
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'checkins',
      filter: `gym_id=eq.${gymId}`,
    }, payload => {
      notifyCheckin(payload.new)
    })
    .subscribe()

  return realtimeChannel
}

export function stopRealtimeNotifications() {
  if (realtimeChannel) {
    realtimeChannel.unsubscribe()
    realtimeChannel = null
  }
}
