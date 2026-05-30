import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { fmtNum } from '../lib/db'

const DAYS_AL = ['Die','Hën','Mar','Mër','Enj','Pre','Sht']
const MONTHS_AL = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Set','Tet','Nën','Dhj']

async function getSlots(staffId, date, duration) {
  const { data } = await supabase.rpc('get_available_slots', {
    p_staff_id: staffId, p_date: date, p_duration_min: duration
  })
  return (data||[]).filter(s=>s.is_available)
}

async function getUpcomingClasses(gymId) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('yoga_classes')
    .select('*, instructor:staff(name), bookings:yoga_bookings(id,status)')
    .eq('gym_id', gymId).gte('date', today).eq('is_cancelled', false)
    .order('date').order('start_time').limit(20)
  return data??[]
}

async function bookAppointment(gymId, staffId, serviceId, service, date, slot, client) {
  const endMin = parseInt(slot.slice(0,2))*60 + parseInt(slot.slice(3,5)) + service.duration_min
  const endTime = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00`
  const { error } = await supabase.from('appointments').insert({
    gym_id: gymId, staff_id: staffId, service_id: serviceId,
    client_name: client.name, client_phone: client.phone||null, client_email: client.email||null,
    appointment_date: date, start_time: slot+':00', end_time: endTime,
    status: 'pending', price: service.price, payment_status: 'unpaid', payment_method:'cash',
    notes: client.notes||null,
  })
  if (error) throw new Error(error.message)
}

async function bookClass(gymId, classId, cls, client) {
  const { error } = await supabase.from('yoga_bookings').insert({
    gym_id: gymId, class_id: classId,
    client_name: client.name, client_phone: client.phone||null, client_email: client.email||null,
    status: 'confirmed', price_paid: cls.price, payment_status: 'unpaid',
  })
  if (error) {
    if (error.message.includes('unique')) throw new Error('Ke një rezervim aktiv për këtë klasë')
    throw new Error(error.message)
  }
}

// ── CALENDAR ──────────────────────────────────────────────
function MiniCalendar({ selected, onSelect }) {
  const [month, setMonth] = useState(new Date())
  const today = new Date(); today.setHours(0,0,0,0)

  const y = month.getFullYear(), m = month.getMonth()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m+1, 0).getDate()
  const cells = []
  for (let i=0; i<first; i++) cells.push(null)
  for (let d=1; d<=days; d++) cells.push(new Date(y,m,d))

  const fmt = d => d.toISOString().split('T')[0]

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
        <button onClick={()=>setMonth(new Date(y,m-1,1))} style={{background:'none',border:'1px solid #e4e4e7',borderRadius:7,width:32,height:32,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
        <div style={{fontWeight:700,fontSize:14}}>{MONTHS_AL[m]} {y}</div>
        <button onClick={()=>setMonth(new Date(y,m+1,1))} style={{background:'none',border:'1px solid #e4e4e7',borderRadius:7,width:32,height:32,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:6}}>
        {['Di','Hë','Ma','Më','En','Pr','Sh'].map(d=><div key={d} style={{textAlign:'center',fontSize:10,fontWeight:700,color:'#a1a1aa',padding:'4px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {cells.map((d,i)=>{
          if (!d) return <div key={i}/>
          const past = d < today
          const isSel = selected && fmt(d)===selected
          return (
            <button key={i} disabled={past} onClick={()=>onSelect(fmt(d))}
              style={{padding:'7px 2px',borderRadius:8,border:'none',cursor:past?'not-allowed':'pointer',fontSize:13,fontWeight:isSel?700:400,background:isSel?'#18181b':past?'transparent':'#fff',color:isSel?'#fff':past?'#d4d4d8':'#18181b',fontFamily:'inherit',transition:'all .12s'}}
              onMouseEnter={e=>{if(!past&&!isSel)e.currentTarget.style.background='#f4f4f5'}}
              onMouseLeave={e=>{if(!past&&!isSel)e.currentTarget.style.background='#fff'}}>
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── BOOKING MODAL ─────────────────────────────────────────
export function BookingModal({ biz, services, staff, onClose }) {
  const [mode,      setMode]      = useState(null) // 'appointment' | 'class'
  const [step,      setStep]      = useState(1)
  const [selSvc,    setSelSvc]    = useState(null)
  const [selStaff,  setSelStaff]  = useState(null)
  const [selDate,   setSelDate]   = useState('')
  const [selSlot,   setSelSlot]   = useState(null)
  const [slots,     setSlots]     = useState([])
  const [loadSlots, setLoadSlots] = useState(false)
  const [classes,   setClasses]   = useState([])
  const [selClass,  setSelClass]  = useState(null)
  const [form, setForm] = useState({ name:'', phone:'', email:'', notes:'' })
  const [saving, setSaving]  = useState(false)
  const [done,   setDone]    = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const isAppt  = ['barbershop','salon','spa'].includes(biz?.business_type)
  const isClass = ['yoga','pilates','martial_arts'].includes(biz?.business_type)
  const isGym   = biz?.business_type === 'gym'

  useEffect(() => {
    if (isAppt)  { setMode('appointment') }
    if (isClass) { setMode('class'); loadClasses() }
    if (isGym)   { setMode('appointment') }
  }, [biz])

  const loadClasses = async () => {
    const data = await getUpcomingClasses(biz.id)
    setClasses(data)
  }

  const loadSlots_ = async () => {
    if (!selStaff||!selSvc||!selDate) return
    setLoadSlots(true)
    const data = await getSlots(selStaff.id, selDate, selSvc.duration_min)
    setSlots(data)
    setLoadSlots(false)
  }

  useEffect(() => {
    if (selStaff&&selSvc&&selDate) loadSlots_()
  }, [selDate, selStaff, selSvc])

  const submit = async () => {
    if (!form.name.trim()) { alert('Vendos emrin'); return }
    setSaving(true)
    try {
      if (mode==='appointment') {
        await bookAppointment(biz.id, selStaff.id, selSvc.id, selSvc, selDate, selSlot, form)
      } else {
        await bookClass(biz.id, selClass.id, selClass, form)
      }
      setDone(true)
    } catch(e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const AVC = ['#18181b','#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#be185d']

  // Done screen
  if (done) return (
    <ModalWrap onClose={onClose}>
      <div style={{textAlign:'center',padding:'32px 20px'}}>
        <div style={{width:72,height:72,borderRadius:'50%',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 20px'}}>✅</div>
        <div style={{fontWeight:800,fontSize:22,marginBottom:8}}>Rezervimi u bë!</div>
        <div style={{fontSize:14,color:'#52525b',lineHeight:1.7,marginBottom:6}}>
          {mode==='appointment'
            ? `${selSvc?.emoji} ${selSvc?.name} · ${selDate} · ${selSlot}`
            : `🧘 ${selClass?.class_type} · ${selClass?.date} · ${selClass?.start_time?.slice(0,5)}`}
        </div>
        <div style={{fontSize:13,color:'#71717a',marginBottom:24}}>Te {biz.name}</div>
        {form.phone&&<div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:10,padding:12,fontSize:13,marginBottom:20}}>
          💵 Pagesa bëhet <strong>cash</strong> kur të vish.
        </div>}
        <div style={{fontSize:12,color:'#a1a1aa',marginBottom:20}}>
          Do të merrni konfirmim nëse keni vendosur email.
        </div>
        <button onClick={onClose} style={{background:'#18181b',color:'#fff',border:'none',padding:'12px 32px',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',width:'100%'}}>
          Mbyll
        </button>
      </div>
    </ModalWrap>
  )

  return (
    <ModalWrap onClose={onClose} title={`📅 Rezervo — ${biz?.name}`}>

      {/* Steps indicator */}
      {mode==='appointment'&&(
        <div style={{display:'flex',gap:0,margin:'0 0 20px',background:'#f4f4f5',borderRadius:10,padding:3}}>
          {[['1','Shërbimi'],['2','Data & Ora'],['3','Kontakti']].map(([n,l],i)=>(
            <div key={n} style={{flex:1,textAlign:'center',padding:'8px 4px',borderRadius:8,background:step===i+1?'#fff':'transparent',fontSize:12,fontWeight:step===i+1?700:400,color:step===i+1?'#18181b':'#71717a',transition:'all .2s',cursor:step>i+1?'pointer':'default',boxShadow:step===i+1?'0 1px 4px rgba(0,0,0,.08)':'none'}}
              onClick={()=>step>i+1&&setStep(i+1)}>
              <span style={{display:'block',fontSize:10,color:step===i+1?'#7c3aed':'#a1a1aa',fontWeight:700,marginBottom:1}}>HAPI {n}</span>
              {l}
            </div>
          ))}
        </div>
      )}

      {/* APPOINTMENT FLOW */}
      {mode==='appointment'&&(
        <>
          {/* Step 1 - Service + Staff */}
          {step===1&&(
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'#52525b',textTransform:'uppercase',letterSpacing:'.06em'}}>Zgjidh Shërbimin</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {(services||[]).map(s=>(
                    <div key={s.id} onClick={()=>setSelSvc(s)} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',borderRadius:11,border:`2px solid ${selSvc?.id===s.id?'#18181b':'#e4e4e7'}`,background:selSvc?.id===s.id?'#fafafa':'#fff',cursor:'pointer',transition:'all .15s'}}>
                      <div style={{width:40,height:40,borderRadius:9,background:'#f4f4f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:14}}>{s.name}</div>
                        <div style={{fontSize:12,color:'#71717a'}}>⏱ {s.duration_min} min</div>
                      </div>
                      <div style={{fontWeight:700,fontSize:16}}>{fmtNum(s.price)} L</div>
                    </div>
                  ))}
                </div>
              </div>

              {staff?.length>0&&(
                <div>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'#52525b',textTransform:'uppercase',letterSpacing:'.06em'}}>Zgjidh Specialistin</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8}}>
                    {(staff||[]).map(s=>(
                      <div key={s.id} onClick={()=>setSelStaff(s)} style={{padding:'12px 8px',borderRadius:11,border:`2px solid ${selStaff?.id===s.id?'#18181b':'#e4e4e7'}`,background:selStaff?.id===s.id?'#fafafa':'#fff',cursor:'pointer',textAlign:'center',transition:'all .15s'}}>
                        <div style={{width:40,height:40,borderRadius:'50%',background:AVC[s.avatar_color||0],color:'#fff',fontSize:16,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 8px'}}>
                          {s.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <div style={{fontSize:12,fontWeight:600}}>{s.name.split(' ')[0]}</div>
                        <div style={{fontSize:10,color:'#71717a'}}>{s.speciality||'Specialist'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={()=>{
                if(!selSvc){alert('Zgjidh shërbimin');return}
                if(staff?.length>0&&!selStaff){alert('Zgjidh specialistin');return}
                if(!selStaff&&staff?.length===0) setSelStaff({id:null})
                setStep(2)
              }} style={{background:'#18181b',color:'#fff',border:'none',padding:'13px',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',width:'100%'}}>
                Vazhdo →
              </button>
            </div>
          )}

          {/* Step 2 - Date + Time */}
          {step===2&&(
            <div>
              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:13}}>
                ✅ {selSvc?.emoji} {selSvc?.name} · {fmtNum(selSvc?.price)} L · {selSvc?.duration_min} min
                {selStaff&&<span> · 👤 {selStaff.name}</span>}
              </div>

              <div style={{marginBottom:16}}>
                <MiniCalendar selected={selDate} onSelect={d=>{setSelDate(d);setSelSlot(null);setSlots([])}}/>
              </div>

              {selDate&&(
                <div>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:'#52525b',textTransform:'uppercase',letterSpacing:'.06em'}}>
                    Orët e Lira — {selDate}
                  </div>
                  {loadSlots?(
                    <div style={{textAlign:'center',padding:20,color:'#71717a',fontSize:13}}>Duke ngarkuar oraret...</div>
                  ):slots.length===0?(
                    <div style={{textAlign:'center',padding:20,color:'#71717a',fontSize:13}}>Asnjë orë e lirë për këtë datë. Provo datë tjetër.</div>
                  ):(
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,maxHeight:200,overflowY:'auto'}}>
                      {slots.map((slot,i)=>(
                        <button key={i} onClick={()=>setSelSlot(slot.slot_time?.slice(0,5))}
                          style={{padding:'9px 4px',borderRadius:8,border:`2px solid ${selSlot===slot.slot_time?.slice(0,5)?'#18181b':'#e4e4e7'}`,background:selSlot===slot.slot_time?.slice(0,5)?'#18181b':'#fff',color:selSlot===slot.slot_time?.slice(0,5)?'#fff':'#18181b',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',transition:'all .12s'}}>
                          {slot.slot_time?.slice(0,5)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{display:'flex',gap:10,marginTop:16}}>
                <button onClick={()=>setStep(1)} style={{flex:1,background:'#f4f4f5',color:'#18181b',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Kthehu</button>
                <button onClick={()=>{
                  if(!selDate){alert('Zgjidh datën');return}
                  if(!selSlot){alert('Zgjidh orën');return}
                  setStep(3)
                }} style={{flex:2,background:'#18181b',color:'#fff',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                  Vazhdo →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Contact */}
          {step===3&&(
            <div>
              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:13,lineHeight:1.8}}>
                <div>✅ {selSvc?.emoji} {selSvc?.name} · {fmtNum(selSvc?.price)} L</div>
                <div>📅 {selDate} · 🕐 {selSlot}</div>
                {selStaff&&<div>👤 {selStaff.name}</div>}
                <div>💵 Pagesa cash kur të vish</div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3f3f46',marginBottom:5}}>Emri i Plotë *</label>
                  <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Emri Mbiemri" autoFocus
                    style={{width:'100%',border:'1.5px solid #e4e4e7',borderRadius:9,padding:'11px 13px',fontSize:14,fontFamily:'inherit',outline:'none'}}
                    onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3f3f46',marginBottom:5}}>Telefon</label>
                    <input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..."
                      style={{width:'100%',border:'1.5px solid #e4e4e7',borderRadius:9,padding:'11px 13px',fontSize:14,fontFamily:'inherit',outline:'none'}}
                      onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3f3f46',marginBottom:5}}>Email</label>
                    <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@..."
                      style={{width:'100%',border:'1.5px solid #e4e4e7',borderRadius:9,padding:'11px 13px',fontSize:14,fontFamily:'inherit',outline:'none'}}
                      onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
                  </div>
                </div>
                <div>
                  <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3f3f46',marginBottom:5}}>Shënime (opsionale)</label>
                  <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Çdo kërkesë speciale..."
                    style={{width:'100%',border:'1.5px solid #e4e4e7',borderRadius:9,padding:'11px 13px',fontSize:14,fontFamily:'inherit',outline:'none',resize:'none',height:72}}
                    onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
                </div>
              </div>

              <div style={{display:'flex',gap:10,marginTop:16}}>
                <button onClick={()=>setStep(2)} style={{flex:1,background:'#f4f4f5',color:'#18181b',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Kthehu</button>
                <button onClick={submit} disabled={saving} style={{flex:2,background:'#18181b',color:'#fff',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,cursor:saving?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  {saving&&<div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                  {saving?'Duke rezervuar...':'✅ Konfirmo Rezervimin'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* CLASS FLOW */}
      {mode==='class'&&!selClass&&(
        <div>
          <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:'#52525b',textTransform:'uppercase',letterSpacing:'.06em'}}>Klasa të Ardhshme</div>
          <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:400,overflowY:'auto'}}>
            {classes.length===0?(
              <div style={{textAlign:'center',padding:32,color:'#71717a'}}>Asnjë klasë e planifikuar ende</div>
            ):classes.map(c=>{
              const confirmed = (c.bookings||[]).filter(b=>b.status==='confirmed').length
              const isFull = c.capacity && confirmed >= c.capacity
              return (
                <div key={c.id} onClick={()=>!isFull&&setSelClass(c)} style={{display:'flex',alignItems:'center',gap:0,borderRadius:12,border:'1.5px solid #e4e4e7',overflow:'hidden',cursor:isFull?'not-allowed':'pointer',opacity:isFull?.6:1,transition:'all .15s'}}
                  onMouseEnter={e=>{if(!isFull)e.currentTarget.style.borderColor='#18181b'}}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='#e4e4e7'}>
                  <div style={{width:60,background:'linear-gradient(180deg,#7c3aed,#2563eb)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'14px 4px',flexShrink:0}}>
                    <div style={{fontWeight:800,fontSize:14,color:'#fff',lineHeight:1}}>{c.start_time?.slice(0,5)}</div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,.6)',marginTop:3}}>{c.duration_min}min</div>
                  </div>
                  <div style={{flex:1,padding:'12px 14px'}}>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>{c.class_type}</div>
                    <div style={{fontSize:12,color:'#71717a'}}>
                      📅 {c.date} · 👥 {confirmed}{c.capacity?`/${c.capacity}`:''} · 💰 {fmtNum(c.price)} L
                    </div>
                  </div>
                  {isFull&&<div style={{padding:'0 14px',fontSize:12,fontWeight:600,color:'#dc2626'}}>🔒 Plot</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {mode==='class'&&selClass&&!done&&(
        <div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 14px',marginBottom:16,fontSize:13,lineHeight:1.9}}>
            <div>🧘 {selClass.class_type}</div>
            <div>📅 {selClass.date} · 🕐 {selClass.start_time?.slice(0,5)} · ⏱ {selClass.duration_min} min</div>
            {selClass.instructor&&<div>👤 {selClass.instructor.name}</div>}
            <div>💰 {fmtNum(selClass.price)} L — cash kur të vish</div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3f3f46',marginBottom:5}}>Emri i Plotë *</label>
              <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Emri Mbiemri" autoFocus
                style={{width:'100%',border:'1.5px solid #e4e4e7',borderRadius:9,padding:'11px 13px',fontSize:14,fontFamily:'inherit',outline:'none'}}
                onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <div>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3f3f46',marginBottom:5}}>Telefon</label>
                <input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..."
                  style={{width:'100%',border:'1.5px solid #e4e4e7',borderRadius:9,padding:'11px 13px',fontSize:14,fontFamily:'inherit',outline:'none'}}
                  onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#3f3f46',marginBottom:5}}>Email</label>
                <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@..."
                  style={{width:'100%',border:'1.5px solid #e4e4e7',borderRadius:9,padding:'11px 13px',fontSize:14,fontFamily:'inherit',outline:'none'}}
                  onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:10,marginTop:16}}>
            <button onClick={()=>setSelClass(null)} style={{flex:1,background:'#f4f4f5',color:'#18181b',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Kthehu</button>
            <button onClick={submit} disabled={saving} style={{flex:2,background:'#18181b',color:'#fff',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,cursor:saving?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {saving&&<div style={{width:14,height:14,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
              {saving?'Duke rezervuar...':'✅ Rezervo Klasën'}
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </ModalWrap>
  )
}

function ModalWrap({ children, title, onClose }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.55)',backdropFilter:'blur(8px)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center',padding:0,fontFamily:"'Geist',-apple-system,sans-serif"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#fff',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:540,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 -8px 40px rgba(0,0,0,.15)',paddingBottom:24}}>
        <div style={{position:'sticky',top:0,background:'#fff',borderBottom:'1px solid #f4f4f5',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:10}}>
          <div style={{fontWeight:700,fontSize:16}}>{title||'Rezervo'}</div>
          <button onClick={onClose} style={{background:'#f4f4f5',border:'none',width:32,height:32,borderRadius:'50%',cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
        <div style={{padding:20}}>{children}</div>
      </div>
    </div>
  )
}
