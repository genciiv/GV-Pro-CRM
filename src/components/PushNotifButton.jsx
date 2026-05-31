// src/components/PushNotifButton.jsx
import { useState, useEffect } from 'react'
import { registerSW, requestPermission, hasPermission, startRealtime, notify, playSound } from '../lib/webpush'
import { supabase } from '../lib/supabase'

export default function PushNotifButton({ gymId }) {
  const [status, setStatus] = useState('unknown')  // unknown | granted | denied | unsupported

  useEffect(() => {
    if (!('Notification' in window)) return setStatus('unsupported')
    setStatus(Notification.permission)
    // Regjistro SW gjithmonë
    registerSW()
    // Nëse tashmë ka leje, fillo realtime
    if (Notification.permission === 'granted' && gymId) {
      startRealtime(gymId, supabase)
    }
  }, [gymId])

  async function enable() {
    await registerSW()
    const ok = await requestPermission()
    if (ok) {
      setStatus('granted')
      startRealtime(gymId, supabase)
      // Test notification
      setTimeout(() => {
        playSound('member')
        notify('✅ Njoftime të aktivizuara!', 'Do merrni njoftime për rezervime, pagesa dhe anëtarë.')
      }, 300)
    } else {
      setStatus('denied')
    }
  }

  if (status === 'unsupported') return null

  if (status === 'granted') return (
    <div style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 13px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, fontSize:12, color:'#15803d', fontWeight:600, userSelect:'none' }}>
      <style>{`@keyframes vaqo-pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
      <div style={{ width:7, height:7, borderRadius:'50%', background:'#16a34a', animation:'vaqo-pulse 2s ease-in-out infinite' }}/>
      Live
    </div>
  )

  if (status === 'denied') return (
    <div title="Hap browser settings dhe lejo notifikimet" style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 13px', background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, fontSize:12, color:'#dc2626', fontWeight:600, cursor:'help' }}>
      🔕 Bllokuar
    </div>
  )

  return (
    <button onClick={enable} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 13px', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:8, fontSize:12, color:'#7c3aed', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .2s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
      onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
      title="Aktivizo njoftime push për rezervime, pagesa dhe anëtarë">
      🔔 Aktivizo Njoftimet
    </button>
  )
}
