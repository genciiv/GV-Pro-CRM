import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function QRCheckin() {
  const [status, setStatus] = useState('loading') // loading | success | expired | error
  const [member, setMember] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const code = window.location.pathname.split('/checkin/')[1]
    if (!code) { setStatus('error'); setMessage('QR kod i pavlefshëm'); return }
    processCheckin(code)
  }, [])

  const processCheckin = async (qrCode) => {
    try {
      // Gjej anëtarin nga QR kodi
      const { data: m } = await supabase
        .from('members')
        .select('*, gym:gyms(id,name), memberships:memberships(id,status,end_date,plan:plans(name,emoji))')
        .eq('qr_code', qrCode)
        .eq('is_active', true)
        .maybeSingle()

      if (!m) { setStatus('error'); setMessage('QR kod nuk u gjet'); return }

      setMember(m)

      // Kontrollo abonimin aktiv
      const activeMembership = (m.memberships||[]).find(ms =>
        ms.status === 'active' && new Date(ms.end_date) >= new Date()
      )

      if (!activeMembership) {
        setStatus('expired')
        setMessage('Abonimi ka skaduar')
        return
      }

      // Regjistro check-in
      const { error } = await supabase.from('check_ins').insert({
        gym_id: m.gym?.id,
        member_id: m.id,
        membership_id: activeMembership.id,
        method: 'qr',
      })

      if (error) {
        if (error.message.includes('unique')) {
          // Tashmë i regjistruar sot
          setStatus('already')
        } else {
          throw error
        }
      } else {
        setStatus('success')
      }

    } catch(e) {
      setStatus('error')
      setMessage(e.message)
    }
  }

  const daysLeft = member?.memberships
    ?.find(ms => ms.status==='active' && new Date(ms.end_date) >= new Date())
    ?.end_date
    ? Math.ceil((new Date(member.memberships.find(ms=>ms.status==='active' && new Date(ms.end_date)>=new Date()).end_date) - new Date()) / 86400000)
    : null

  const activePlan = member?.memberships?.find(ms => ms.status==='active' && new Date(ms.end_date) >= new Date())

  const ini = member ? (member.first_name[0]||'')+(member.last_name[0]||'') : ''
  const AVC = ['#18181b','#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#be185d']

  const screens = {
    loading: (
      <div style={{textAlign:'center'}}>
        <div style={{width:56,height:56,border:'3px solid rgba(255,255,255,.2)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 20px'}}/>
        <div style={{fontSize:16,color:'rgba(255,255,255,.7)'}}>Duke regjistruar hyrjen...</div>
      </div>
    ),
    success: (
      <div style={{textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,margin:'0 auto 20px'}}>✓</div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>Mirë se erdhe!</div>
        <div style={{fontSize:28,fontFamily:'serif',fontWeight:900,marginBottom:4}}>{member?.first_name} {member?.last_name}</div>
        {activePlan&&<div style={{fontSize:14,color:'rgba(255,255,255,.7)',marginBottom:16}}>{activePlan.plan?.emoji} {activePlan.plan?.name}</div>}
        {daysLeft!=null&&<div style={{background:'rgba(255,255,255,.1)',borderRadius:10,padding:'10px 20px',fontSize:14,color:'rgba(255,255,255,.8)'}}>⏳ {daysLeft} ditë të mbetura</div>}
      </div>
    ),
    already: (
      <div style={{textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,margin:'0 auto 20px'}}>👋</div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>Tashmë i Regjistruar!</div>
        <div style={{fontSize:28,fontFamily:'serif',fontWeight:900,marginBottom:4}}>{member?.first_name} {member?.last_name}</div>
        {activePlan&&<div style={{fontSize:14,color:'rgba(255,255,255,.7)',marginBottom:16}}>{activePlan.plan?.emoji} {activePlan.plan?.name}</div>}
        <div style={{background:'rgba(255,255,255,.1)',borderRadius:10,padding:'10px 20px',fontSize:14,color:'rgba(255,255,255,.8)'}}>✅ Hyrja e sotme është regjistruar</div>
      </div>
    ),
    expired: (
      <div style={{textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(248,113,113,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,margin:'0 auto 20px'}}>⚠️</div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:6}}>Abonimi Skaduar</div>
        <div style={{fontSize:28,fontFamily:'serif',fontWeight:900,marginBottom:16}}>{member?.first_name} {member?.last_name}</div>
        <div style={{background:'rgba(248,113,113,.2)',border:'1px solid rgba(248,113,113,.4)',borderRadius:10,padding:'12px 20px',fontSize:14,color:'#fca5a5'}}>
          Kontakto recepsionin për të rinovuar abonimin
        </div>
      </div>
    ),
    error: (
      <div style={{textAlign:'center'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(248,113,113,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,margin:'0 auto 20px'}}>❌</div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:12}}>Gabim</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,.6)'}}>{message}</div>
      </div>
    ),
  }

  const bgColor = {
    loading: '#18181b', success: '#16a34a', already: '#2563eb',
    expired: '#991b1b', error: '#7f1d1d'
  }

  return (
    <div style={{minHeight:'100vh',background:bgColor[status]||'#18181b',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32,color:'#fff',transition:'background .5s'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Gym name */}
      <div style={{position:'absolute',top:24,left:0,right:0,textAlign:'center',fontSize:13,color:'rgba(255,255,255,.4)',fontWeight:600,letterSpacing:'.05em',textTransform:'uppercase'}}>
        {member?.gym?.name||'Vaqo Gym'}
      </div>

      {/* Logo */}
      <div style={{width:48,height:48,borderRadius:12,background:'rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:32}}>💪</div>

      {/* Content */}
      <div style={{width:'100%',maxWidth:320}}>
        {screens[status]}
      </div>

      {/* Time */}
      <div style={{position:'absolute',bottom:24,fontSize:12,color:'rgba(255,255,255,.3)'}}>
        {new Date().toLocaleTimeString('sq-AL',{hour:'2-digit',minute:'2-digit'})} · Vaqo
      </div>
    </div>
  )
}
