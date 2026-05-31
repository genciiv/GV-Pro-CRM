// src/lib/webpush.js
// Web Push Notifications — pa VAPID, direkt nga browser

// ── Regjistro Service Worker ──────────────────────────────
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return false
  try {
    await navigator.serviceWorker.register('/sw.js')
    return true
  } catch(e) {
    console.warn('SW registration failed:', e)
    return false
  }
}

// ── Kërko leje ───────────────────────────────────────────
export async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function hasPermission() {
  return 'Notification' in window && Notification.permission === 'granted'
}

// ── Dërgo notifikim browser ───────────────────────────────
export function notify(title, body, options = {}) {
  if (!hasPermission()) return
  const n = new Notification(title, {
    body,
    icon:    '/favicon.svg',
    badge:   '/favicon.svg',
    tag:     options.tag || 'vaqo-' + Date.now(),
    vibrate: [200, 100, 200],
    requireInteraction: options.requireInteraction || false,
    silent:  options.silent || false,
  })
  if (options.url) n.onclick = () => { window.focus(); window.location.href = options.url; n.close() }
  // Auto-close after 6s
  if (!options.requireInteraction) setTimeout(() => n.close(), 6000)
  return n
}

// ── Tinguj me Web Audio API ───────────────────────────────
export function playSound(type = 'booking') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const sequences = {
      booking: [[523,.12,.28],[659,.10,.0],[784,.14,.0]],   // C-E-G  ding ding ding
      payment: [[784,.10,.0],[1047,.10,.0],[1319,.16,.0]],   // G-C-E  bing!
      member:  [[523,.08,.0],[659,.08,.0],[784,.08,.0],[1047,.2,.0]], // tada!
      checkin: [[880,.06,.0],[1108,.08,.0]],                  // quick beep
    }
    const notes = sequences[type] || sequences.booking
    let t = ctx.currentTime
    notes.forEach(([freq, dur, delay]) => {
      t += delay
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.25, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
      osc.start(t); osc.stop(t + dur + 0.05)
      t += dur
    })
  } catch(e) {}
}

// ── Notifikime specifike ──────────────────────────────────
export function notifyBooking(appt) {
  const time = appt.start_time?.slice(0,5)
  const date = appt.appointment_date
    ? new Date(appt.appointment_date).toLocaleDateString('sq-AL',{weekday:'short',day:'numeric',month:'short'})
    : ''
  playSound('booking')
  notify(
    '📅 Rezervim i Ri!',
    `${appt.client_name || 'Klient'} · ${appt.service_name || 'Shërbim'}\n${date} ora ${time}`,
    { tag:'booking', requireInteraction: true, url: '/#bookings' }
  )
}

export function notifyPayment(pay) {
  playSound('payment')
  notify(
    '💰 Pagesa e Re!',
    `${pay.member_name || 'Klient'} · ${(pay.amount||0).toLocaleString('sq-AL')} L`,
    { tag:'payment', url: '/#payments' }
  )
}

export function notifyMember(member) {
  playSound('member')
  notify(
    '🎉 Anëtar i Ri!',
    `${member.first_name || ''} ${member.last_name || ''} u regjistrua`,
    { tag:'member', url: '/#members' }
  )
}

export function notifyCheckin(member) {
  playSound('checkin')
  notify(
    '🚪 Check-in',
    `${member.first_name || ''} ${member.last_name || ''} hyri`,
    { tag:'checkin', silent: false }
  )
}

// ── Realtime listener (Supabase) ──────────────────────────
let channel = null

export function startRealtime(gymId, supabaseClient) {
  if (channel) { channel.unsubscribe(); channel = null }
  if (!gymId || !supabaseClient) return

  channel = supabaseClient
    .channel(`push-${gymId}`)
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'appointments', filter:`gym_id=eq.${gymId}` },
      p => { if (!p.new.is_test) notifyBooking(p.new) })
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'payments', filter:`gym_id=eq.${gymId}` },
      p => notifyPayment(p.new))
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'members', filter:`gym_id=eq.${gymId}` },
      p => notifyMember(p.new))
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'checkins', filter:`gym_id=eq.${gymId}` },
      p => notifyCheckin(p.new))
    .subscribe()

  return channel
}

export function stopRealtime() {
  if (channel) { channel.unsubscribe(); channel = null }
}
