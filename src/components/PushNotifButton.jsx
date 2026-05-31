// src/components/PushNotifButton.jsx
// Butoni për aktivizimin e notifikimeve Push

import { useState, useEffect } from 'react'
import { requestSimplePermission, startRealtimeNotifications, notify } from '../lib/webpush'
import { supabase } from '../lib/supabase'

export default function PushNotifButton({ gymId }) {
  const [status, setStatus] = useState('unknown') // unknown | granted | denied | unsupported

  useEffect(() => {
    if (!('Notification' in window)) return setStatus('unsupported')
    setStatus(Notification.permission)

    // Auto-start realtime if already granted
    if (Notification.permission === 'granted' && gymId) {
      startRealtimeNotifications(gymId, supabase)
    }
  }, [gymId])

  async function enable() {
    const ok = await requestSimplePermission()
    if (ok) {
      setStatus('granted')
      startRealtimeNotifications(gymId, supabase)
      // Test notification
      setTimeout(() => notify('✅ Notifikimet u aktivizuan!', 'Do të merrni njoftime për rezervime, pagesa dhe anëtarë të rinj.'), 500)
    } else {
      setStatus('denied')
    }
  }

  if (status === 'unsupported') return null

  if (status === 'granted') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:9, fontSize:13, color:'#15803d', fontWeight:600 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:'#16a34a', animation:'pulse 2s infinite' }}/>
        Njoftime aktive
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    )
  }

  return (
    <button onClick={enable} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:9, fontSize:13, color:'#7c3aed', fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .2s' }}
      onMouseEnter={e=>e.currentTarget.style.background='#ede9fe'}
      onMouseLeave={e=>e.currentTarget.style.background='#f5f3ff'}>
      🔔 Aktivizo Njoftimet
    </button>
  )
}
