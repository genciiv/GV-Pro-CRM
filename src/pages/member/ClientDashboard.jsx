import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

function BookingCard({ appt, onRebook }) {
  const isUpcoming = new Date(appt.appointment_date + 'T23:59') >= new Date()
  const statusColors = {
    pending:   { bg:'#fffbeb', color:'#92400e', label:'⏳ Pret konfirmim' },
    confirmed: { bg:'#eff6ff', color:'#1d4ed8', label:'✅ Konfirmuar' },
    completed: { bg:'#f0fdf4', color:'#15803d', label:'✓ Kryer' },
    cancelled: { bg:'#fef2f2', color:'#dc2626', label:'❌ Anuluar' },
  }
  const sc = statusColors[appt.status] || statusColors.pending

  return (
    <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaef',padding:'18px 20px',marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,.05)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div>
          <div style={{fontWeight:700,fontSize:16}}>{appt.services?.name || 'Shërbim'}</div>
          <div style={{fontSize:13,color:'#9aa0b0',marginTop:2}}>{appt.gym?.name}</div>
        </div>
        <span style={{background:sc.bg,color:sc.color,fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:20}}>{sc.label}</span>
      </div>
      <div style={{display:'flex',gap:20,fontSize:13,color:'#6b7385',marginBottom:12}}>
        <span>📅 {new Date(appt.appointment_date+'T12:00').toLocaleDateString('sq-AL',{weekday:'short',day:'numeric',month:'long'})}</span>
        <span>🕐 {appt.start_time?.slice(0,5)}</span>
        {appt.staff && <span>👤 {appt.staff.first_name} {appt.staff.last_name}</span>}
      </div>
      {appt.price > 0 && <div style={{fontSize:13,color:'#16a34a',fontWeight:600,marginBottom:8}}>💰 {appt.price?.toLocaleString('sq-AL')} L (cash)</div>}
      {appt.status==='completed' && (
        <button onClick={()=>onRebook(appt)} style={{background:'#f5f3ff',border:'1px solid #ddd6fe',color:'#6c47ff',padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
          🔄 Rezervo Përsëri
        </button>
      )}
      {isUpcoming && appt.gym?.phone && (appt.status==='pending'||appt.status==='confirmed') && (
        <a href={`tel:${appt.gym.phone}`} style={{display:'inline-block',background:'#fff',border:'1px solid #e8eaef',color:'#3d3a33',padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:500,textDecoration:'none',marginLeft:8}}>
          📞 Kontakto
        </a>
      )}
    </div>
  )
}

export default function ClientDashboard({ logout }) {
  const { user } = useAuth()
  const [appts,    setAppts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('upcoming')

  useEffect(() => {
    if (!user?.email) return
    supabase.from('appointments')
      .select('*, services(name,price), staff(first_name,last_name), gym:gyms(name,phone,city,slug,business_type)')
      .eq('client_email', user.email)
      .order('appointment_date', { ascending: false })
      .then(({ data }) => { setAppts(data || []); setLoading(false) })
  }, [user?.email])

  const today     = new Date().toISOString().split('T')[0]
  const upcoming  = appts.filter(a => a.appointment_date >= today && a.status !== 'cancelled')
  const past      = appts.filter(a => a.appointment_date < today || a.status === 'completed' || a.status === 'cancelled')

  const rebook = (appt) => {
    window.location.href = `/book/${appt.gym?.slug || appt.gym_id}`
  }

  const bizIco = { barbershop:'💈', salon:'💅', gym:'🏋️', spa:'💆', yoga:'🧘' }

  return (
    <div style={{minHeight:'100vh',background:'#f8f9fc',fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap')`}</style>

      {/* Topbar */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8eaef',padding:'0 20px',height:54,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{fontWeight:900,fontSize:20,color:'#6c47ff',fontFamily:'Georgia,serif'}}>Vaqo</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:13,color:'#9aa0b0'}}>{user?.email}</span>
          <button onClick={logout} style={{background:'#f5f3ff',border:'1px solid #ddd6fe',color:'#6c47ff',padding:'7px 14px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Dil</button>
        </div>
      </div>

      <div style={{maxWidth:600,margin:'0 auto',padding:'24px 16px'}}>

        {/* Hero greeting */}
        <div style={{background:'linear-gradient(135deg,#6c47ff,#9333ea)',borderRadius:16,padding:'24px 24px',marginBottom:24,color:'#fff'}}>
          <div style={{fontSize:28,marginBottom:8}}>👋</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:22,fontWeight:700,marginBottom:4}}>Rezervimet tuaja</div>
          <div style={{fontSize:14,opacity:.8}}>{appts.length} rezervime gjithsej</div>
        </div>

        {/* Quick actions */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:24}}>
          <a href="/explore" style={{background:'#fff',border:'1px solid #e8eaef',borderRadius:12,padding:'16px',textDecoration:'none',color:'#0f1117',display:'flex',flexDirection:'column',gap:6,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <span style={{fontSize:24}}>🔍</span>
            <span style={{fontWeight:600,fontSize:14}}>Gjej Biznesin</span>
            <span style={{fontSize:12,color:'#9aa0b0'}}>Rezervo tani</span>
          </a>
          <div style={{background:'#fff',border:'1px solid #e8eaef',borderRadius:12,padding:'16px',display:'flex',flexDirection:'column',gap:6,boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
            <span style={{fontSize:24}}>📅</span>
            <span style={{fontWeight:600,fontSize:14}}>Tjetri juaj</span>
            <span style={{fontSize:12,color:upcoming.length>0?'#6c47ff':'#9aa0b0'}}>{upcoming.length>0 ? `${new Date(upcoming[0].appointment_date+'T12:00').toLocaleDateString('sq-AL',{weekday:'short',day:'numeric',month:'short'})} · ${upcoming[0].start_time?.slice(0,5)}` : 'Nuk ka rezervime'}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,background:'#f0edf9',borderRadius:10,padding:4,marginBottom:20}}>
          {[['upcoming',`📅 Të ardhshme (${upcoming.length})`],['past',`📋 Historiku (${past.length})`]].map(([id,l])=>(
            <button key={id} onClick={()=>setTab(id)}
              style={{flex:1,padding:'9px',borderRadius:8,border:'none',fontFamily:'inherit',fontSize:13,fontWeight:tab===id?700:400,background:tab===id?'#fff':'transparent',color:tab===id?'#6c47ff':'#6b7385',cursor:'pointer',boxShadow:tab===id?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .15s'}}>
              {l}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{textAlign:'center',padding:48,color:'#9aa0b0'}}>
            <div style={{width:24,height:24,border:'3px solid #ede9fe',borderTopColor:'#6c47ff',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto 12px'}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            Duke ngarkuar...
          </div>
        ) : tab==='upcoming' ? (
          upcoming.length===0 ? (
            <div style={{textAlign:'center',padding:48}}>
              <div style={{fontSize:48,marginBottom:12,opacity:.3}}>📅</div>
              <div style={{fontWeight:600,fontSize:16,marginBottom:8}}>Nuk ka rezervime të ardhshme</div>
              <p style={{fontSize:14,color:'#9aa0b0',marginBottom:20}}>Rezervo tani tek bizneset tona</p>
              <a href="/explore" style={{background:'#6c47ff',color:'#fff',padding:'11px 28px',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none',display:'inline-block'}}>Gjej Biznesin →</a>
            </div>
          ) : upcoming.map(a=><BookingCard key={a.id} appt={a} onRebook={rebook}/>)
        ) : (
          past.length===0 ? (
            <div style={{textAlign:'center',padding:48}}>
              <div style={{fontSize:48,marginBottom:12,opacity:.3}}>📋</div>
              <div style={{fontWeight:600,color:'#9aa0b0'}}>Nuk ka historik rezervimesh</div>
            </div>
          ) : past.map(a=><BookingCard key={a.id} appt={a} onRebook={rebook}/>)
        )}
      </div>
    </div>
  )
}
