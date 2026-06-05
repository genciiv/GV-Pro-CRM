// src/pages/public/PublicBooking.jsx
// Faqja publike rezervimi — klientët rezervojnë pa llogari

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { VaqoLogo } from '../../components/VaqoLogo'
import { smsAppointmentConfirm } from '../../lib/sms'
import { emailAppointmentConfirm } from '../../lib/email'

const MONTHS = ['Janar','Shkurt','Mars','Prill','Maj','Qershor','Korrik','Gusht','Shtator','Tetor','Nëntor','Dhjetor']
const DAYS   = ['Die','Hën','Mar','Mër','Enj','Pre','Sht']

function useW() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return w < 640
}

export default function PublicBooking() {
  const isMobile = useW()
  const slug = window.location.pathname.replace('/book/','').replace(/\/$/,'')

  const [gym,      setGym]      = useState(null)
  const [services, setServices] = useState([])
  const [staff,    setStaff]    = useState([])
  const [step,     setStep]     = useState(1)  // 1=service, 2=staff, 3=date/time, 4=contact, 5=success
  const [loading,  setLoading]  = useState(true)
  const [submitting,setSubmitting]=useState(false)
  const [error,    setError]    = useState('')

  const [selSvc,   setSelSvc]   = useState(null)
  const [selStaff, setSelStaff] = useState(null)  // null = any
  const [selDate,  setSelDate]  = useState('')
  const [selTime,  setSelTime]  = useState('')
  const [slots,    setSlots]    = useState([])
  const [slotsLoad,setSlotsLoad]=useState(false)
  const [form,     setForm]     = useState({name:'',phone:'',email:'',notes:''})
  const [saved,    setSaved]    = useState(null)

  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  // ── Load gym by slug
  useEffect(()=>{
    supabase.from('gyms').select('id,name,city,address,phone,email,logo_url,business_type,slug').or(`slug.eq.${slug},id.eq.${slug}`).eq('status','approved').limit(1)
      .then(({data,error:err})=>{
        const bizData = Array.isArray(data) ? data[0] : data
        if (err || !bizData) { setError('Biznesi nuk u gjet'); setLoading(false); return }
        setGym(bizData)
        return Promise.all([
          supabase.from('services').select('id,name,price,duration_min,description').eq('gym_id',bizData.id).eq('is_active',true).order('sort_order'),
          supabase.from('staff').select('id,first_name,last_name,speciality,avatar_url').eq('gym_id',bizData.id).eq('is_active',true),
        ])
      })
      .then(([svcRes, staffRes]) => {
        if (svcRes) setServices(svcRes.data||[])
        if (staffRes) setStaff(staffRes.data||[])
        setLoading(false)
      })
      .catch(()=>setLoading(false))
  },[slug])

  // ── Load available time slots when date changes
  useEffect(()=>{
    if (!selDate || !selSvc || !gym) return
    setSlotsLoad(true)
    const loadSlots = async () => {
      // Get existing bookings for that day
      const { data: booked } = await supabase.from('appointments')
        .select('start_time,end_time,staff_id')
        .eq('gym_id', gym.id)
        .eq('appointment_date', selDate)
        .in('status', ['pending','confirmed'])
        .eq(selStaff ? 'staff_id' : 'gym_id', selStaff ? selStaff.id : gym.id)

      // Generate slots 08:00-19:00 every 30min
      const dur = selSvc.duration_min || 30
      const allSlots = []
      for (let h=8; h<19; h++) {
        for (let m=0; m<60; m+=30) {
          const startMin = h*60+m
          const endMin = startMin+dur
          if (endMin > 19*60) break
          const start = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
          const end   = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`
          // Check if conflicts with booked
          const conflict = (booked||[]).some(b => {
            const bs = parseInt(b.start_time.replace(':',''))
            const be = parseInt(b.end_time.replace(':',''))
            const ts = parseInt(start.replace(':',''))
            const te = parseInt(end.replace(':',''))
            return ts < be && te > bs
          })
          if (!conflict) allSlots.push(start)
        }
      }
      setSlots(allSlots)
      setSlotsLoad(false)
    }
    loadSlots()
  },[selDate, selSvc, selStaff, gym])

  // ── Submit booking
  const submit = async () => {
    if (!form.name.trim()||!form.phone.trim()){setError('Emri dhe telefoni janë të detyrueshëm');return}
    setSubmitting(true); setError('')
    try {
      const dur = selSvc.duration_min || 30
      const [h,m] = selTime.split(':').map(Number)
      const endMin = h*60+m+dur
      const end_time = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00`

      const {data, error:err} = await supabase.from('appointments').insert({
        gym_id: gym.id,
        service_id: selSvc.id,
        staff_id: selStaff?.id || null,
        client_name: form.name.trim(),
        client_phone: form.phone.trim(),
        client_email: form.email.trim()||null,
        appointment_date: selDate,
        start_time: selTime+':00',
        end_time,
        status: 'pending',
        price: selSvc.price||0,
        payment_status: 'unpaid',
        notes: form.notes||null,
      }).select().single()
      if (err) throw err

      setSaved(data)
      // Notifications
      try { await smsAppointmentConfirm({ appointment:{...data, client_phone:form.phone, service:{name:selSvc.name}, staff:selStaff}, gym }) } catch(e){}
      try { await emailAppointmentConfirm({ appointment:{...data, client_email:form.email, client_name:form.name, service:{name:selSvc.name}, staff:selStaff}, gym }) } catch(e){}

      setStep(5)
    } catch(e){setError(e.message)}
    finally{setSubmitting(false)}
  }

  const INP = {width:'100%',border:'1.5px solid #e8eaef',borderRadius:10,padding:'11px 14px',fontSize:15,fontFamily:'inherit',outline:'none',background:'#fff',color:'#0f1117',transition:'all .15s',boxSizing:'border-box'}
  const onF = e=>{e.target.style.borderColor='#6c47ff';e.target.style.boxShadow='0 0 0 3px rgba(108,71,255,.1)'}
  const onB = e=>{e.target.style.borderColor='#e8eaef';e.target.style.boxShadow='none'}

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f9fc',fontFamily:'system-ui,sans-serif'}}>
      <div style={{display:'flex',gap:12,alignItems:'center',color:'#9aa0b0'}}>
        <div style={{width:20,height:20,border:'2px solid #e8eaef',borderTopColor:'#6c47ff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
        Duke ngarkuar...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (error && !gym) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f9fc',fontFamily:'system-ui,sans-serif',padding:24}}>
      <div style={{textAlign:'center',maxWidth:360}}>
        <div style={{fontSize:52,marginBottom:16,opacity:.3}}>😕</div>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:22,fontWeight:900,marginBottom:10}}>Biznesi nuk u gjet</h2>
        <p style={{fontSize:14,color:'#9aa0b0',marginBottom:24}}>URL-ja nuk është e saktë ose biznesi nuk është aktiv.</p>
        <a href="/explore" style={{background:'#6c47ff',color:'#fff',padding:'11px 28px',borderRadius:9,fontSize:14,fontWeight:700,textDecoration:'none'}}>Shfleto Bizneset →</a>
      </div>
    </div>
  )

  // Step progress
  const steps = [
    { n:1, l:'Shërbimi' },
    { n:2, l:'Punonjësi' },
    { n:3, l:'Data & Ora' },
    { n:4, l:'Kontakti' },
  ]

  const dateOptions = Array.from({length:14},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()+i+1)
    return d
  }).filter(d => d.getDay()!==0) // exclude Sundays (customize per gym)

  return (
    <div style={{minHeight:'100vh',background:'#f8f9fc',fontFamily:'system-ui,-apple-system,sans-serif',color:'#0f1117'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Nav */}
      <div style={{background:'#fff',borderBottom:'1px solid #e8eaef',padding:`12px ${isMobile?16:32}px`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <a href="/" style={{textDecoration:'none'}}><VaqoLogo size="sm"/></a>
        {gym && (
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#6b7385'}}>
            <span style={{fontWeight:600,color:'#0f1117'}}>{gym.name}</span>
            {gym.city&&<span>· {gym.city}</span>}
          </div>
        )}
      </div>

      <div style={{maxWidth:640,margin:'0 auto',padding:`${isMobile?20:40}px ${isMobile?16:20}px 64px`,animation:'pop .4s ease both'}}>

        {/* SUCCESS */}
        {step===5 ? (
          <div style={{background:'#fff',borderRadius:20,padding:isMobile?28:44,textAlign:'center',border:'1px solid #e8eaef',boxShadow:'0 4px 24px rgba(15,17,23,.06)'}}>
            <div style={{width:80,height:80,borderRadius:'50%',background:'#f0fdf4',border:'3px solid #bbf7d0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,margin:'0 auto 20px'}}>✅</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?22:28,fontWeight:900,marginBottom:10}}>Rezervimi u Konfirmua!</h2>
            <p style={{fontSize:15,color:'#6b7385',lineHeight:1.75,marginBottom:24}}>
              Faleminderit <strong style={{color:'#0f1117'}}>{form.name}</strong>!<br/>
              Do të merrni konfirmim në <strong style={{color:'#0f1117'}}>{form.phone}</strong>.
            </p>
            <div style={{background:'#f8f9fc',borderRadius:14,padding:'16px 20px',marginBottom:24,textAlign:'left',border:'1px solid #e8eaef'}}>
              {[
                ['✂️','Shërbimi', selSvc?.name],
                ['👤','Punonjësi', selStaff?`${selStaff.first_name} ${selStaff.last_name}`:'Çdo disponueshëm'],
                ['📅','Data', selDate ? new Date(selDate+'T12:00').toLocaleDateString('sq-AL',{weekday:'long',day:'numeric',month:'long'}) : ''],
                ['🕐','Ora', selTime],
                ['💰','Çmimi', `${selSvc?.price?.toLocaleString('sq-AL')||0} L (cash)`],
              ].map(([ico,l,v])=>(
                <div key={l} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:'1px solid #f0f0f0',fontSize:14}}>
                  <span style={{width:22,textAlign:'center',fontSize:16}}>{ico}</span>
                  <span style={{color:'#9aa0b0',minWidth:80}}>{l}</span>
                  <span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#78350f',marginBottom:20}}>
              ⚠️ Nëse nuk mund të vini, anuloni të paktën 24 orë para takimit duke telefonuar <strong>{gym?.phone||'+355 692 291 041'}</strong>
            </div>
            {/* Google sign-up offer */}
            <div style={{background:'#f8f9fc',border:'1px solid #e8eaef',borderRadius:14,padding:'20px 24px',marginBottom:20,textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>📱 Shiko rezervimet tuaja</div>
              <p style={{fontSize:13,color:'#6b7385',lineHeight:1.65,marginBottom:14}}>
                Krijoni llogari falas me Google për të parë të gjitha rezervimet, marrë kujtesa dhe rezervuar më shpejt herën tjetër.
              </p>
              <button
                onClick={async () => {
                  const { supabase } = await import('../../lib/supabase')
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin + '/member' }
                  })
                }}
                style={{display:'flex',alignItems:'center',gap:10,background:'#fff',border:'1.5px solid #e8eaef',borderRadius:10,padding:'11px 20px',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',width:'100%',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,.06)'}}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>
                Vazhdo me Google
              </button>
              <p style={{fontSize:11,color:'#9aa0b0',marginTop:10,textAlign:'center'}}>Falas gjithmonë · Pa kartë krediti</p>
            </div>
            <a href={`/b/${slug}`} style={{background:'var(--pu)',color:'#fff',padding:'12px 32px',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none',display:'inline-block'}}>
              ← Kthehu te Profili
            </a>
          </div>
        ) : (
          <>
            {/* Gym header */}
            <div style={{marginBottom:24,textAlign:'center'}}>
              <div style={{fontFamily:'Georgia,serif',fontSize:isMobile?22:28,fontWeight:900,marginBottom:4}}>{gym?.name}</div>
              {gym?.city&&<div style={{fontSize:14,color:'#9aa0b0'}}>📍 {gym.address||''} {gym.city}</div>}
            </div>

            {/* Step progress */}
            <div style={{display:'flex',alignItems:'center',marginBottom:28,gap:4}}>
              {steps.map((s,i)=>(
                <div key={s.n} style={{display:'flex',alignItems:'center',flex:i<3?'1':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,background:step>s.n?'#16a34a':step===s.n?'#6c47ff':'#e8eaef',color:step>=s.n?'#fff':'#9aa0b0',transition:'all .3s'}}>
                      {step>s.n?'✓':s.n}
                    </div>
                    {!isMobile&&<span style={{fontSize:12,fontWeight:step===s.n?700:400,color:step===s.n?'#6c47ff':'#9aa0b0',whiteSpace:'nowrap'}}>{s.l}</span>}
                  </div>
                  {i<3&&<div style={{flex:1,height:2,background:step>s.n?'#16a34a':'#e8eaef',margin:'0 6px',transition:'background .3s'}}/>}
                </div>
              ))}
            </div>

            {/* Error */}
            {error&&<div style={{background:'#fff1f3',border:'1px solid #ffd6db',borderRadius:10,padding:'11px 16px',marginBottom:16,fontSize:14,color:'#e0344a'}}>⚠️ {error}</div>}

            <div style={{background:'#fff',borderRadius:16,border:'1px solid #e8eaef',padding:isMobile?20:28,boxShadow:'0 2px 12px rgba(15,17,23,.05)'}}>

              {/* STEP 1 — Service */}
              {step===1&&(
                <>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:900,marginBottom:4}}>Zgjidh Shërbimin</div>
                  <div style={{fontSize:13,color:'#9aa0b0',marginBottom:20}}>Çfarë dëshiron të bësh?</div>
                  {services.length===0 ? (
                    <div style={{textAlign:'center',padding:32,color:'#9aa0b0'}}>Nuk ka shërbime të disponueshme</div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {services.map(s=>(
                        <div key={s.id} onClick={()=>{setSelSvc(s);setStep(2)}}
                          style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',border:`1.5px solid ${selSvc?.id===s.id?'#6c47ff':'#e8eaef'}`,background:selSvc?.id===s.id?'#f0edff':'#fff',borderRadius:12,cursor:'pointer',transition:'all .15s'}}
                          onMouseEnter={e=>{if(selSvc?.id!==s.id){e.currentTarget.style.borderColor='#c8c0ff';e.currentTarget.style.background='#faf9ff'}}}
                          onMouseLeave={e=>{if(selSvc?.id!==s.id){e.currentTarget.style.borderColor='#e8eaef';e.currentTarget.style.background='#fff'}}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{s.name}</div>
                            {s.description&&<div style={{fontSize:13,color:'#9aa0b0',marginBottom:3}}>{s.description}</div>}
                            <div style={{fontSize:12,color:'#6b7385'}}>⏱ {s.duration_min} minuta</div>
                          </div>
                          <div style={{textAlign:'right',flexShrink:0,marginLeft:16}}>
                            <div style={{fontWeight:800,fontSize:18,color:'#0f1117'}}>{s.price?.toLocaleString('sq-AL')} L</div>
                            <div style={{fontSize:12,color:'#9aa0b0'}}>cash</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* STEP 2 — Staff */}
              {step===2&&(
                <>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:900,marginBottom:4}}>Zgjidh Punonjësin</div>
                  <div style={{fontSize:13,color:'#9aa0b0',marginBottom:20}}>Me cilin dëshiron të bësh {selSvc?.name}?</div>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {/* Any available */}
                    <div onClick={()=>{setSelStaff(null);setStep(3)}}
                      style={{display:'flex',alignItems:'center',gap:14,padding:'16px 18px',border:'1.5px solid #e8eaef',borderRadius:12,cursor:'pointer',transition:'all .15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8c0ff';e.currentTarget.style.background='#faf9ff'}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='#e8eaef';e.currentTarget.style.background='#fff'}}>
                      <div style={{width:44,height:44,borderRadius:'50%',background:'#f0edff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>🎲</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:15}}>Çdo disponueshëm</div>
                        <div style={{fontSize:13,color:'#9aa0b0'}}>Cakton automatikisht</div>
                      </div>
                    </div>
                    {staff.map(s=>(
                      <div key={s.id} onClick={()=>{setSelStaff(s);setStep(3)}}
                        style={{display:'flex',alignItems:'center',gap:14,padding:'16px 18px',border:'1.5px solid #e8eaef',borderRadius:12,cursor:'pointer',transition:'all .15s'}}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor='#c8c0ff';e.currentTarget.style.background='#faf9ff'}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor='#e8eaef';e.currentTarget.style.background='#fff'}}>
                        <div style={{width:44,height:44,borderRadius:'50%',background:'#6c47ff',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,flexShrink:0}}>
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <div>
                          <div style={{fontWeight:700,fontSize:15}}>{s.first_name} {s.last_name}</div>
                          {s.speciality&&<div style={{fontSize:13,color:'#9aa0b0'}}>{s.speciality}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setStep(1)} style={{marginTop:16,background:'none',border:'none',color:'#9aa0b0',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>← Prapa</button>
                </>
              )}

              {/* STEP 3 — Date & Time */}
              {step===3&&(
                <>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:900,marginBottom:4}}>Zgjidh Datën dhe Orën</div>
                  <div style={{fontSize:13,color:'#9aa0b0',marginBottom:20}}>{selSvc?.name} · {selSvc?.duration_min} min · {selSvc?.price?.toLocaleString('sq-AL')} L</div>

                  {/* Date scroll */}
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#3d4350',marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>Data</div>
                    <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
                      {dateOptions.map(d=>{
                        const key = d.toISOString().split('T')[0]
                        const isSelected = selDate===key
                        return (
                          <div key={key} onClick={()=>setSelDate(key)}
                            style={{flexShrink:0,width:58,textAlign:'center',padding:'10px 6px',borderRadius:12,border:`1.5px solid ${isSelected?'#6c47ff':'#e8eaef'}`,background:isSelected?'#6c47ff':'#fff',cursor:'pointer',transition:'all .15s'}}>
                            <div style={{fontSize:10,fontWeight:600,color:isSelected?'rgba(255,255,255,.7)':'#9aa0b0',textTransform:'uppercase'}}>{DAYS[d.getDay()]}</div>
                            <div style={{fontSize:20,fontWeight:800,color:isSelected?'#fff':'#0f1117',lineHeight:1.2}}>{d.getDate()}</div>
                            <div style={{fontSize:10,color:isSelected?'rgba(255,255,255,.6)':'#9aa0b0'}}>{MONTHS[d.getMonth()].slice(0,3)}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Time slots */}
                  {selDate&&(
                    <div style={{marginBottom:20}}>
                      <div style={{fontSize:12,fontWeight:700,color:'#3d4350',marginBottom:10,textTransform:'uppercase',letterSpacing:'.05em'}}>
                        Orari i Disponueshëm
                        {slotsLoad&&<span style={{marginLeft:8,color:'#9aa0b0',fontWeight:400}}>duke ngarkuar...</span>}
                      </div>
                      {!slotsLoad&&slots.length===0&&<div style={{color:'#9aa0b0',fontSize:14,padding:'12px 0'}}>Nuk ka orare të lira për këtë datë.</div>}
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8}}>
                        {slots.map(t=>(
                          <div key={t} onClick={()=>setSelTime(t)}
                            style={{padding:'10px 6px',textAlign:'center',borderRadius:10,border:`1.5px solid ${selTime===t?'#6c47ff':'#e8eaef'}`,background:selTime===t?'#f0edff':'#fff',cursor:'pointer',fontSize:13,fontWeight:selTime===t?700:500,color:selTime===t?'#6c47ff':'#3d4350',transition:'all .15s'}}>
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{display:'flex',gap:10,marginTop:4}}>
                    <button onClick={()=>setStep(2)} style={{background:'#f4f6fa',border:'1px solid #e8eaef',color:'#6b7385',padding:'11px 20px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Prapa</button>
                    <button onClick={()=>selDate&&selTime&&setStep(4)} disabled={!selDate||!selTime}
                      style={{flex:1,background:selDate&&selTime?'#6c47ff':'#e8eaef',color:selDate&&selTime?'#fff':'#9aa0b0',border:'none',padding:'11px',borderRadius:9,fontSize:14,fontWeight:700,cursor:selDate&&selTime?'pointer':'not-allowed',fontFamily:'inherit',transition:'all .2s'}}>
                      Vazhdo →
                    </button>
                  </div>
                </>
              )}

              {/* STEP 4 — Contact */}
              {step===4&&(
                <>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,fontWeight:900,marginBottom:4}}>Detajet e Kontaktit</div>
                  <div style={{fontSize:13,color:'#9aa0b0',marginBottom:20}}>Kush je ti?</div>

                  {/* Summary */}
                  <div style={{background:'#f0edff',borderRadius:12,padding:'12px 16px',marginBottom:20,fontSize:13}}>
                    <div style={{fontWeight:700,color:'#6c47ff',marginBottom:4}}>{selSvc?.name}</div>
                    <div style={{color:'#6b7385'}}>{selStaff?`${selStaff.first_name} ${selStaff.last_name}`:'Çdo disponueshëm'} · {selDate?new Date(selDate+'T12:00').toLocaleDateString('sq-AL',{weekday:'short',day:'numeric',month:'short'}):''} ora {selTime} · {selSvc?.price?.toLocaleString('sq-AL')} L</div>
                  </div>

                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Emri i Plotë *</label>
                      <input style={INP} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Emri Mbiemri" onFocus={onF} onBlur={onB}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Numri i Telefonit *</label>
                      <input style={INP} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..." onFocus={onF} onBlur={onB}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Email <span style={{color:'#9aa0b0',fontWeight:400}}>(opsional)</span></label>
                      <input type="email" style={INP} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@..." onFocus={onF} onBlur={onB}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3d4350',marginBottom:5}}>Shënime <span style={{color:'#9aa0b0',fontWeight:400}}>(opsional)</span></label>
                      <textarea style={{...INP,resize:'none',height:72}} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Ndonjë preferim special..." onFocus={onF} onBlur={onB}/>
                    </div>
                  </div>

                  <div style={{display:'flex',gap:10,marginTop:16}}>
                    <button onClick={()=>setStep(3)} style={{background:'#f4f6fa',border:'1px solid #e8eaef',color:'#6b7385',padding:'11px 20px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Prapa</button>
                    <button onClick={submit} disabled={submitting||!form.name.trim()||!form.phone.trim()}
                      style={{flex:1,background:'#6c47ff',color:'#fff',border:'none',padding:'13px',borderRadius:9,fontSize:14,fontWeight:700,cursor:submitting?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 4px 12px rgba(108,71,255,.3)',opacity:(submitting||!form.name.trim()||!form.phone.trim())?.6:1}}>
                      {submitting&&<div style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                      {submitting?'Duke rezervuar...':'✅ Konfirmo Rezervimin'}
                    </button>
                  </div>
                  <p style={{textAlign:'center',fontSize:11,color:'#9aa0b0',marginTop:10}}>Pa pagesë online · Cash në ditën e takimit</p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
