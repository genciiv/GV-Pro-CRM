// src/pages/appointments/AppointmentCalendar.jsx
// Kalendar profesional i rezervimeve — Pamje javore/ditore me realtime

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

// ── HELPERS ──────────────────────────────────────────────
const DAYS_SQ = ['E Hënë','E Martë','E Mërkurë','E Enjte','E Premte','E Shtunë','E Diel']
const DAYS_SHORT = ['Hën','Mar','Mër','Enj','Pre','Sht','Die']
const MONTHS_SQ = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']
const STATUS_CFG = {
  pending:   { label:'Pritje',    bg:'#fffbeb', col:'#d97706', border:'#fde68a' },
  confirmed: { label:'Konfirmuar',bg:'#eff6ff', col:'#2563eb', border:'#bfdbfe' },
  completed: { label:'Kryer',     bg:'#f0fdf4', col:'#16a34a', border:'#bbf7d0' },
  cancelled: { label:'Anuluar',   bg:'#fff1f3', col:'#e0344a', border:'#ffd6db' },
  no_show:   { label:'Nuk erdhi', bg:'#f9fafb', col:'#6b7385', border:'#e8eaef' },
}

const toMin = (t) => { const [h,m]=(t||'00:00').split(':').map(Number); return h*60+m }
const fmtTime = (t) => t?.slice(0,5) || ''
const fmtDate = (d) => {
  const dt = new Date(d)
  return `${dt.getDate()} ${MONTHS_SQ[dt.getMonth()]}`
}
const dateKey = (d) => d.toISOString().split('T')[0]

function getWeekDays(baseDate) {
  const d = new Date(baseDate)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return Array.from({length:7}, (_,i) => {
    const dd = new Date(d)
    dd.setDate(d.getDate() + i)
    return dd
  })
}

// ── BOOKING CARD ─────────────────────────────────────────
function ApptCard({ appt, onSelect, compact = false }) {
  const cfg = STATUS_CFG[appt.status] || STATUS_CFG.pending
  const duration = toMin(appt.end_time) - toMin(appt.start_time)
  const height = Math.max(compact ? 36 : 52, duration * (compact ? 0.8 : 1.1))

  return (
    <div onClick={e=>{e.stopPropagation();onSelect(appt)}}
      style={{
        position:'absolute', left:2, right:2,
        top: (toMin(appt.start_time) - toMin('08:00')) * (compact ? 0.8 : 1.1),
        height, background:cfg.bg, border:`1.5px solid ${cfg.border}`,
        borderLeft:`3px solid ${cfg.col}`, borderRadius:6,
        padding:'3px 6px', cursor:'pointer', overflow:'hidden',
        transition:'all .15s', zIndex:2,
        boxShadow:'0 1px 3px rgba(0,0,0,.06)',
      }}
      onMouseEnter={e=>{e.currentTarget.style.zIndex='10';e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,.15)'}}
      onMouseLeave={e=>{e.currentTarget.style.zIndex='2';e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.06)'}}>
      <div style={{fontSize:11,fontWeight:700,color:cfg.col,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
        {fmtTime(appt.start_time)} {appt.service_name||''}
      </div>
      {height > 44 && (
        <div style={{fontSize:10,color:'#6b7385',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
          {appt.client_name} {appt.staff_name?`· ${appt.staff_name}`:''}
        </div>
      )}
    </div>
  )
}

// ── APPOINTMENT DETAIL MODAL ──────────────────────────────
function ApptModal({ appt, onClose, onUpdate, gymId }) {
  const [loading, setLoading] = useState(false)
  if (!appt) return null
  const cfg = STATUS_CFG[appt.status] || STATUS_CFG.pending

  const updateStatus = async (status) => {
    setLoading(true)
    await supabase.from('appointments').update({status}).eq('id',appt.id)
    onUpdate()
    onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(15,17,23,.4)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
      onClick={onClose}>
      <div style={{background:'#fff',borderRadius:18,width:'100%',maxWidth:440,boxShadow:'0 24px 64px rgba(0,0,0,.18)',overflow:'hidden',animation:'pop .2s ease'}}
        onClick={e=>e.stopPropagation()}>
        <style>{`@keyframes pop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Header */}
        <div style={{padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #f0f0f0'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:10,height:10,borderRadius:'50%',background:cfg.col,flexShrink:0}}/>
            <div>
              <div style={{fontWeight:700,fontSize:15}}>{appt.service_name||'Rezervim'}</div>
              <div style={{fontSize:12,color:'#9aa0b0',marginTop:1}}>
                {fmtDate(appt.appointment_date)} · {fmtTime(appt.start_time)} – {fmtTime(appt.end_time)}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:'none',background:'#f4f6fa',cursor:'pointer',fontSize:16,color:'#6b7385',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>

        {/* Info */}
        <div style={{padding:'16px 20px',display:'flex',flexDirection:'column',gap:10}}>
          {[
            ['👤', 'Klienti', appt.client_name],
            ['📞', 'Telefon', appt.client_phone],
            ['✉️', 'Email', appt.client_email],
            ['💈', 'Punonjësi', appt.staff_name],
            ['💰', 'Çmimi', appt.price ? `${appt.price.toLocaleString('sq-AL')} L` : null],
            ['📋', 'Statusi', cfg.label],
          ].filter(([,,v])=>v).map(([ico,l,v])=>(
            <div key={l} style={{display:'flex',gap:12,alignItems:'center',padding:'8px 12px',background:'#f8f9fc',borderRadius:9}}>
              <span style={{fontSize:16,width:22,textAlign:'center',flexShrink:0}}>{ico}</span>
              <span style={{fontSize:12,color:'#9aa0b0',fontWeight:500,minWidth:70}}>{l}</span>
              <span style={{fontSize:13,fontWeight:600,color:'#0f1117'}}>{v}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{padding:'0 20px 20px',display:'flex',gap:8,flexWrap:'wrap'}}>
          {appt.client_phone && (
            <a href={`tel:${appt.client_phone}`} style={{flex:'0 0 auto',display:'inline-flex',alignItems:'center',gap:6,background:'#0f1117',color:'#fff',padding:'9px 16px',borderRadius:9,fontSize:13,fontWeight:600,textDecoration:'none'}}>
              📞 Telefono
            </a>
          )}
          {appt.status==='pending' && (
            <button onClick={()=>updateStatus('confirmed')} disabled={loading}
              style={{flex:1,background:'#eff6ff',color:'#2563eb',border:'1.5px solid #bfdbfe',padding:'9px 12px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              ✓ Konfirmo
            </button>
          )}
          {['pending','confirmed'].includes(appt.status) && (
            <button onClick={()=>updateStatus('completed')} disabled={loading}
              style={{flex:1,background:'#f0fdf4',color:'#16a34a',border:'1.5px solid #bbf7d0',padding:'9px 12px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
              ✓ Kryer
            </button>
          )}
          {!['completed','cancelled'].includes(appt.status) && (
            <button onClick={()=>updateStatus('cancelled')} disabled={loading}
              style={{background:'#fff1f3',color:'#e0344a',border:'1.5px solid #ffd6db',padding:'9px 12px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',minWidth:80}}>
              Anulo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── QUICK ADD MODAL ───────────────────────────────────────
function QuickAddModal({ date, time, gymId, onClose, onSaved }) {
  const [form, setForm] = useState({client_name:'',client_phone:'',service_id:'',staff_id:'',date:date||dateKey(new Date()),start_time:time||'09:00',notes:''})
  const [services, setServices] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  useEffect(()=>{
    supabase.from('services').select('id,name,price,duration_min').eq('gym_id',gymId).eq('is_active',true).then(({data})=>setServices(data||[]))
    supabase.from('staff').select('id,first_name,last_name').eq('gym_id',gymId).eq('is_active',true).then(({data})=>setStaff(data||[]))
  },[gymId])

  const selectedSvc = services.find(s=>s.id===form.service_id)

  const save = async e => {
    e.preventDefault()
    if (!form.client_name||!form.service_id){setError('Emri dhe shërbimi janë të detyrueshëm');return}
    setLoading(true); setError('')
    try {
      const dur = selectedSvc?.duration_min || 30
      const [h,m] = form.start_time.split(':').map(Number)
      const endMin = h*60+m+dur
      const end_time = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`
      const {error:err} = await supabase.from('appointments').insert({
        gym_id: gymId, service_id: form.service_id || null,
        ...(form.staff_id ? { staff_id: form.staff_id } : {}),
        client_name: form.client_name.trim(),
        client_phone: form.client_phone.trim()||null,
        appointment_date: form.date, start_time: form.start_time+':00',
        end_time: end_time+':00', status:'confirmed',
        price: selectedSvc?.price||0, payment_status:'unpaid',
      })
      if (err) throw err
      onSaved()
    } catch(e){setError(e.message)}
    finally{setLoading(false)}
  }

  const INP = {width:'100%',border:'1.5px solid #e8eaef',borderRadius:9,padding:'10px 12px',fontSize:14,fontFamily:'inherit',outline:'none',background:'#fff',color:'#0f1117',transition:'border-color .15s'}
  const onF = e=>{e.target.style.borderColor='#6c47ff';e.target.style.boxShadow='0 0 0 3px rgba(108,71,255,.1)'}
  const onB = e=>{e.target.style.borderColor='#e8eaef';e.target.style.boxShadow='none'}

  return (
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(15,17,23,.4)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:18,width:'100%',maxWidth:420,boxShadow:'0 24px 64px rgba(0,0,0,.18)',overflow:'hidden',animation:'pop .2s ease'}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:'18px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #f0f0f0'}}>
          <div style={{fontWeight:700,fontSize:15}}>+ Rezervim i Ri</div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:'none',background:'#f4f6fa',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <form onSubmit={save} style={{padding:20,display:'flex',flexDirection:'column',gap:12}}>
          {error&&<div style={{background:'#fff1f3',border:'1px solid #ffd6db',borderRadius:8,padding:'9px 12px',fontSize:13,color:'#e0344a'}}>⚠️ {error}</div>}

          <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Emri i Klientit *</label>
            <input style={INP} value={form.client_name} onChange={e=>set('client_name',e.target.value)} placeholder="Emri Mbiemri" onFocus={onF} onBlur={onB} required/></div>

          <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Telefon</label>
            <input style={INP} value={form.client_phone} onChange={e=>set('client_phone',e.target.value)} placeholder="+355 69..." onFocus={onF} onBlur={onB}/></div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Data *</label>
              <input type="date" style={INP} value={form.date} onChange={e=>set('date',e.target.value)} onFocus={onF} onBlur={onB}/></div>
            <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Ora *</label>
              <input type="time" style={INP} value={form.start_time} onChange={e=>set('start_time',e.target.value)} onFocus={onF} onBlur={onB}/></div>
          </div>

          <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Shërbimi *</label>
            <select style={{...INP,cursor:'pointer'}} value={form.service_id} onChange={e=>set('service_id',e.target.value)} onFocus={onF} onBlur={onB} required>
              <option value="">— Zgjidh shërbimin —</option>
              {services.map(s=><option key={s.id} value={s.id}>{s.name} · {s.duration_min}min · {s.price?.toLocaleString('sq-AL')} L</option>)}
            </select></div>

          <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Punonjësi</label>
            <select style={{...INP,cursor:'pointer'}} value={form.staff_id} onChange={e=>set('staff_id',e.target.value)} onFocus={onF} onBlur={onB}>
              <option value="">— Cile do (opsionale) —</option>
              {staff.map(s=><option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
            </select></div>

          {selectedSvc && (
            <div style={{background:'#f0edff',borderRadius:9,padding:'10px 14px',fontSize:13,color:'#6c47ff',fontWeight:600}}>
              ⏱ Kohëzgjatja: {selectedSvc.duration_min} min · 💰 {selectedSvc.price?.toLocaleString('sq-AL')} L
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{background:'#6c47ff',color:'#fff',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:4,boxShadow:'0 4px 12px rgba(108,71,255,.3)'}}>
            {loading&&<div style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
            {loading?'Duke ruajtur...':'Ruaj Rezervimin'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── MAIN CALENDAR ─────────────────────────────────────────
export default function AppointmentCalendar({ gymId }) {
  const [view,       setView]       = useState('week')   // week | day | list
  const [weekBase,   setWeekBase]   = useState(new Date())
  const [appts,      setAppts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)     // for detail modal
  const [addModal,   setAddModal]   = useState(null)     // {date,time}
  const [filterSt,   setFilterSt]   = useState('all')
  const [liveCount,  setLiveCount]  = useState(0)

  const weekDays  = getWeekDays(weekBase)
  const todayKey  = dateKey(new Date())
  const START_H   = 8    // 08:00
  const END_H     = 20   // 20:00
  const HOURS     = Array.from({length: END_H-START_H}, (_,i) => START_H+i)
  const DAY_PX    = 68   // height per hour in px

  // Selected day for day view
  const [dayDate, setDayDate] = useState(new Date())

  // ── LOAD APPOINTMENTS
  const load = useCallback(async () => {
    setLoading(true)
    const from = dateKey(weekDays[0])
    const to   = dateKey(view === 'day' ? dayDate : weekDays[6])
    const { data } = await supabase
      .from('appointments')
      .select(`
        id, appointment_date, start_time, end_time, status,
        client_name, client_phone, client_email, price,
        services(name), staff(first_name, last_name)
      `)
      .eq('gym_id', gymId)
      .gte('appointment_date', view==='day' ? dateKey(dayDate) : from)
      .lte('appointment_date', to)
      .neq('is_test', true)
      .order('appointment_date')
      .order('start_time')

    const enriched = (data||[]).map(a=>({
      ...a,
      service_name: a.services?.name,
      staff_name: a.staff ? `${a.staff.first_name} ${a.staff.last_name}` : null,
    }))
    setAppts(enriched)
    setLoading(false)
  }, [gymId, weekBase, view, dayDate])

  useEffect(()=>{ load() }, [load])

  // ── REALTIME SUBSCRIPTION
  useEffect(()=>{
    if (!gymId) return
    const channel = supabase
      .channel(`appts-calendar-${gymId}`)
      .on('postgres_changes',
        { event:'*', schema:'public', table:'appointments', filter:`gym_id=eq.${gymId}` },
        () => { setLiveCount(c=>c+1); load() }
      )
      .subscribe()
    return () => channel.unsubscribe()
  }, [gymId, load])

  // ── NAVIGATION
  const prevWeek = () => { const d=new Date(weekBase); d.setDate(d.getDate()-7); setWeekBase(d) }
  const nextWeek = () => { const d=new Date(weekBase); d.setDate(d.getDate()+7); setWeekBase(d) }
  const goToday  = () => { setWeekBase(new Date()); setDayDate(new Date()) }

  // ── FILTER
  const filtered = filterSt==='all' ? appts : appts.filter(a=>a.status===filterSt)

  // ── STATS
  const todayAppts    = appts.filter(a=>a.appointment_date===todayKey)
  const todayRevenue  = todayAppts.filter(a=>a.status==='completed').reduce((s,a)=>s+(a.price||0),0)
  const weekRevenue   = appts.filter(a=>a.status==='completed').reduce((s,a)=>s+(a.price||0),0)
  const pending       = appts.filter(a=>a.status==='pending').length

  const monthLabel = `${MONTHS_SQ[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`

  return (
    <div style={{fontFamily:'system-ui,sans-serif',color:'#0f1117',height:'100%',display:'flex',flexDirection:'column'}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        .cal-slot:hover{background:rgba(108,71,255,.04)!important;cursor:pointer}
        .appt-row:hover{background:#f8f9fc!important}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#e8eaef;border-radius:4px}
      `}</style>

      {/* ── HEADER ── */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
        <div>
          <div style={{fontFamily:'Georgia,serif',fontSize:22,fontWeight:900,marginBottom:2}}>Kalendari</div>
          <div style={{fontSize:13,color:'#9aa0b0',display:'flex',alignItems:'center',gap:8}}>
            {monthLabel}
            {liveCount>0&&<span style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#16a34a',fontWeight:600}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#16a34a',display:'inline-block',animation:'pulse 2s infinite'}}/>
              Live
            </span>}
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          {/* View toggle */}
          <div style={{display:'flex',background:'#f4f6fa',borderRadius:9,padding:3,gap:2}}>
            {[['week','Javore'],['day','Ditore'],['list','Lista']].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)} style={{padding:'6px 14px',borderRadius:7,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',background:view===v?'#fff':'transparent',color:view===v?'#0f1117':'#9aa0b0',boxShadow:view===v?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .15s'}}>
                {l}
              </button>
            ))}
          </div>
          {/* Week nav */}
          {view!=='list'&&<>
            <button onClick={prevWeek} style={{width:34,height:34,border:'1px solid #e8eaef',background:'#fff',borderRadius:8,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            <button onClick={goToday} style={{padding:'6px 14px',border:'1px solid #e8eaef',background:'#fff',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit'}}>Sot</button>
            <button onClick={nextWeek} style={{width:34,height:34,border:'1px solid #e8eaef',background:'#fff',borderRadius:8,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          </>}
          {/* Add booking */}
          <button onClick={()=>setAddModal({date:todayKey,time:'09:00'})} style={{display:'flex',alignItems:'center',gap:6,background:'#6c47ff',color:'#fff',border:'none',padding:'8px 16px',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 12px rgba(108,71,255,.3)'}}>
            + Rezervim
          </button>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
        {[
          ['📅', 'Sot', todayAppts.length, 'rezervime', '#6c47ff','#f0edff'],
          ['⏳', 'Pritje Konfirmimi', pending, 'rezervime', '#d97706','#fffbeb'],
          ['💰', 'Sot (fituar)', `${todayRevenue.toLocaleString('sq-AL')} L`, '', '#16a34a','#f0fdf4'],
          ['📈', 'Java (fituar)', `${weekRevenue.toLocaleString('sq-AL')} L`, '', '#2563eb','#eff6ff'],
        ].map(([ico,label,val,unit,col,bg])=>(
          <div key={label} style={{background:'#fff',border:'1px solid #e8eaef',borderRadius:12,padding:'12px 14px',boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:6}}>
              <div style={{width:28,height:28,borderRadius:7,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{ico}</div>
              <div style={{fontSize:11,color:'#9aa0b0',fontWeight:500,lineHeight:1.2}}>{label}</div>
            </div>
            <div style={{fontSize:22,fontWeight:800,color:col,lineHeight:1}}>{val}</div>
            {unit&&<div style={{fontSize:10,color:'#9aa0b0',marginTop:2}}>{unit}</div>}
          </div>
        ))}
      </div>

      {/* ── STATUS FILTER ── */}
      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
        {[['all','Të gjitha',appts.length],...Object.entries(STATUS_CFG).map(([k,v])=>[k,v.label,appts.filter(a=>a.status===k).length])].map(([v,l,c])=>(
          <button key={v} onClick={()=>setFilterSt(v)} style={{padding:'5px 12px',borderRadius:20,border:`1.5px solid ${filterSt===v?(v==='all'?'#6c47ff':STATUS_CFG[v]?.col||'#6c47ff'):'#e8eaef'}`,background:filterSt===v?(v==='all'?'#f0edff':STATUS_CFG[v]?.bg||'#f0edff'):'#fff',color:filterSt===v?(v==='all'?'#6c47ff':STATUS_CFG[v]?.col||'#6c47ff'):'#9aa0b0',fontSize:12,fontWeight:filterSt===v?700:500,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
            {l}{c>0?` (${c})`:''}
          </button>
        ))}
      </div>

      {/* ── CALENDAR BODY ── */}
      {loading ? (
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'#9aa0b0',gap:10}}>
          <div style={{width:20,height:20,border:'2px solid #e8eaef',borderTopColor:'#6c47ff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
          Duke ngarkuar rezervimet...
        </div>
      ) : view==='week' ? (

        // ── WEEK VIEW ──
        <div style={{flex:1,overflow:'auto',background:'#fff',border:'1px solid #e8eaef',borderRadius:14,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
          {/* Day headers */}
          <div style={{display:'grid',gridTemplateColumns:'52px repeat(7,1fr)',borderBottom:'1px solid #e8eaef',position:'sticky',top:0,background:'#fff',zIndex:10}}>
            <div style={{borderRight:'1px solid #f0f0f0'}}/>
            {weekDays.map((d,i)=>{
              const key = dateKey(d)
              const isToday = key===todayKey
              const dayAppts = filtered.filter(a=>a.appointment_date===key).length
              return (
                <div key={i} onClick={()=>{setDayDate(d);setView('day')}}
                  style={{padding:'10px 6px',textAlign:'center',borderRight:i<6?'1px solid #f0f0f0':'none',cursor:'pointer',background:isToday?'#f0edff':'transparent',transition:'background .15s'}}
                  onMouseEnter={e=>!isToday&&(e.currentTarget.style.background='#f8f9fc')}
                  onMouseLeave={e=>!isToday&&(e.currentTarget.style.background='transparent')}>
                  <div style={{fontSize:10,fontWeight:600,color:isToday?'#6c47ff':'#9aa0b0',textTransform:'uppercase',letterSpacing:'.05em'}}>{DAYS_SHORT[i]}</div>
                  <div style={{fontSize:18,fontWeight:isToday?800:500,color:isToday?'#6c47ff':'#0f1117',lineHeight:1.3,marginTop:2}}>{d.getDate()}</div>
                  {dayAppts>0&&<div style={{width:18,height:18,borderRadius:'50%',background:isToday?'#6c47ff':'#e8eaef',color:isToday?'#fff':'#6b7385',fontSize:9,fontWeight:700,margin:'2px auto 0',display:'flex',alignItems:'center',justifyContent:'center'}}>{dayAppts}</div>}
                </div>
              )
            })}
          </div>

          {/* Time grid */}
          <div style={{display:'grid',gridTemplateColumns:'52px repeat(7,1fr)'}}>
            {HOURS.map(h=>(
              <div key={h} style={{display:'contents'}}>
                {/* Time label */}
                <div style={{height:DAY_PX,borderRight:'1px solid #f0f0f0',borderBottom:'1px solid #f8f9fc',display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:8,paddingTop:4,flexShrink:0}}>
                  <span style={{fontSize:10,color:'#c8cdd8',fontWeight:500}}>{String(h).padStart(2,'0')}:00</span>
                </div>
                {/* Day columns */}
                {weekDays.map((d,di)=>{
                  const key = dateKey(d)
                  const slotAppts = filtered.filter(a=>a.appointment_date===key && toMin(a.start_time)>=h*60 && toMin(a.start_time)<(h+1)*60)
                  return (
                    <div key={di} className="cal-slot"
                      onClick={()=>setAddModal({date:key,time:`${String(h).padStart(2,'0')}:00`})}
                      style={{height:DAY_PX,borderRight:di<6?'1px solid #f0f0f0':'none',borderBottom:'1px solid #f8f9fc',position:'relative',background:dateKey(d)===todayKey?'rgba(108,71,255,.015)':'transparent'}}>
                      {slotAppts.map(a=>(
                        <ApptCard key={a.id} appt={a} onSelect={setSelected} compact/>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

      ) : view==='day' ? (

        // ── DAY VIEW ──
        <div style={{flex:1,overflow:'auto',background:'#fff',border:'1px solid #e8eaef',borderRadius:14,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
          {/* Day nav */}
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',borderBottom:'1px solid #e8eaef',position:'sticky',top:0,background:'#fff',zIndex:10}}>
            <button onClick={()=>{const d=new Date(dayDate);d.setDate(d.getDate()-1);setDayDate(d)}} style={{width:30,height:30,border:'1px solid #e8eaef',background:'#fff',borderRadius:7,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            <div style={{flex:1,textAlign:'center'}}>
              <span style={{fontWeight:700,fontSize:15}}>{DAYS_SQ[(dayDate.getDay()||7)-1]}</span>
              <span style={{fontSize:15,color:'#9aa0b0',marginLeft:8}}>{fmtDate(dateKey(dayDate))}</span>
              {dateKey(dayDate)===todayKey&&<span style={{marginLeft:8,background:'#6c47ff',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20}}>SOT</span>}
            </div>
            <button onClick={()=>{const d=new Date(dayDate);d.setDate(d.getDate()+1);setDayDate(d)}} style={{width:30,height:30,border:'1px solid #e8eaef',background:'#fff',borderRadius:7,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          </div>

          {/* Hour grid */}
          <div style={{display:'grid',gridTemplateColumns:'52px 1fr'}}>
            {HOURS.map(h=>{
              const dayKey = dateKey(dayDate)
              const slotAppts = filtered.filter(a=>a.appointment_date===dayKey && toMin(a.start_time)>=h*60 && toMin(a.start_time)<(h+1)*60)
              return (
                <div key={h} style={{display:'contents'}}>
                  <div style={{height:DAY_PX*1.5,borderRight:'1px solid #f0f0f0',borderBottom:'1px solid #f8f9fc',display:'flex',alignItems:'flex-start',justifyContent:'flex-end',paddingRight:8,paddingTop:4}}>
                    <span style={{fontSize:10,color:'#c8cdd8',fontWeight:500}}>{String(h).padStart(2,'0')}:00</span>
                  </div>
                  <div className="cal-slot"
                    onClick={()=>setAddModal({date:dateKey(dayDate),time:`${String(h).padStart(2,'0')}:00`})}
                    style={{height:DAY_PX*1.5,borderBottom:'1px solid #f8f9fc',position:'relative',background:h%2===0?'#fafbfc':'#fff'}}>
                    {slotAppts.map(a=>(
                      <ApptCard key={a.id} appt={a} onSelect={setSelected}/>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      ) : (

        // ── LIST VIEW ──
        <div style={{flex:1,overflow:'auto',background:'#fff',border:'1px solid #e8eaef',borderRadius:14,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
          {filtered.length===0 ? (
            <div style={{padding:52,textAlign:'center'}}>
              <div style={{fontSize:44,marginBottom:14,opacity:.2}}>📅</div>
              <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>Asnjë rezervim</div>
              <div style={{fontSize:13,color:'#9aa0b0'}}>Kliko "+ Rezervim" për të shtuar</div>
            </div>
          ) : (
            <>
              {/* Group by date */}
              {Object.entries(filtered.reduce((acc,a)=>{
                if(!acc[a.appointment_date])acc[a.appointment_date]=[]
                acc[a.appointment_date].push(a)
                return acc
              },{})).sort().map(([date,dayAppts])=>(
                <div key={date}>
                  <div style={{padding:'10px 18px',background:'#f8f9fc',borderBottom:'1px solid #e8eaef',display:'flex',alignItems:'center',gap:10,position:'sticky',top:0,zIndex:5}}>
                    <span style={{fontWeight:700,fontSize:13}}>{DAYS_SQ[(new Date(date+'T12:00').getDay()||7)-1]}, {fmtDate(date)}</span>
                    {date===todayKey&&<span style={{background:'#6c47ff',color:'#fff',fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20}}>SOT</span>}
                    <span style={{marginLeft:'auto',fontSize:12,color:'#9aa0b0'}}>{dayAppts.length} rezervime</span>
                  </div>
                  {dayAppts.map(a=>{
                    const cfg = STATUS_CFG[a.status]||STATUS_CFG.pending
                    return (
                      <div key={a.id} className="appt-row"
                        onClick={()=>setSelected(a)}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',borderBottom:'1px solid #f0f0f0',cursor:'pointer',transition:'background .1s'}}>
                        {/* Time */}
                        <div style={{textAlign:'center',minWidth:44,flexShrink:0}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#0f1117'}}>{fmtTime(a.start_time)}</div>
                          <div style={{fontSize:10,color:'#9aa0b0'}}>{fmtTime(a.end_time)}</div>
                        </div>
                        {/* Status bar */}
                        <div style={{width:3,height:40,borderRadius:2,background:cfg.col,flexShrink:0}}/>
                        {/* Info */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:600,fontSize:14,color:'#0f1117'}}>{a.client_name}</div>
                          <div style={{fontSize:12,color:'#9aa0b0',marginTop:1}}>
                            {a.service_name}{a.staff_name&&` · ${a.staff_name}`}
                            {a.client_phone&&` · ${a.client_phone}`}
                          </div>
                        </div>
                        {/* Price */}
                        {a.price>0&&<div style={{fontSize:13,fontWeight:700,color:'#16a34a',flexShrink:0}}>{a.price.toLocaleString('sq-AL')} L</div>}
                        {/* Status badge */}
                        <div style={{fontSize:11,fontWeight:700,background:cfg.bg,color:cfg.col,padding:'3px 10px',borderRadius:20,flexShrink:0,border:`1px solid ${cfg.border}`}}>{cfg.label}</div>
                        <div style={{fontSize:16,color:'#c8cdd8',flexShrink:0}}>›</div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {selected && <ApptModal appt={selected} gymId={gymId} onClose={()=>setSelected(null)} onUpdate={()=>{setSelected(null);load()}}/>}
      {addModal  && <QuickAddModal {...addModal} gymId={gymId} onClose={()=>setAddModal(null)} onSaved={()=>{setAddModal(null);load()}}/>}
    </div>
  )
}
