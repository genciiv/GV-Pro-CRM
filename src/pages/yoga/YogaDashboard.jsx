import React, { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { useAsync } from '../../hooks/useAsync'
import { supabase } from '../../lib/supabase'
import { fmtNum, fmtDate, AVC } from '../../lib/db'
import { StatCard, Modal, Loading, Empty, Avatar } from '../../components/UI'
import toast from 'react-hot-toast'
import AppointmentCalendar from '../appointments/AppointmentCalendar'
import AnalyticsDashboard from '../gym/AnalyticsDashboard'
import AffiliateDashboard from '../gym/AffiliateDashboard'
import OnboardingFlow from '../../components/OnboardingFlow'
import PushNotifButton from '../../components/PushNotifButton'
import { emailClassBookingConfirm } from '../../lib/email'

const DAYS_AL = { Mon:'E Hënë', Tue:'E Martë', Wed:'E Mërkurë', Thu:'E Enjte', Fri:'E Premte', Sat:'E Shtunë', Sun:'E Diel' }
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const LEVELS = { beginner:'🟢 Fillestar', intermediate:'🟡 Mesatar', advanced:'🔴 Avancuar', all:'⚪ Të Gjithë' }
const CLASS_TYPES = ['Yoga','Pilates','Meditim','Zumba','Spinning','Aerobik','Stretching','Kickboxing','Dance','Tjetër']

// ── DATA ──────────────────────────────────────────────────
const getStats = async (gymId) => {
  const today = new Date().toISOString().split('T')[0]
  const month = today.slice(0,7)+'-01'
  const [todayC, monthC, members, revenue] = await Promise.all([
    supabase.from('yoga_classes').select('id',{count:'exact',head:true}).eq('gym_id',gymId).eq('date',today),
    supabase.from('yoga_classes').select('id',{count:'exact',head:true}).eq('gym_id',gymId).gte('date',month),
    supabase.from('yoga_bookings').select('id',{count:'exact',head:true}).eq('gym_id',gymId).eq('status','confirmed').gte('created_at',month),
    supabase.from('yoga_bookings').select('price_paid').eq('gym_id',gymId).eq('payment_status','paid').gte('created_at',month),
  ])
  return {
    today_classes: todayC.count??0,
    month_classes: monthC.count??0,
    month_bookings: members.count??0,
    month_revenue: revenue.data?.reduce((a,b)=>a+(b.price_paid||0),0)??0,
  }
}

const getInstructors = async (gymId) => {
  const {data} = await supabase.from('staff').select('*').eq('gym_id',gymId).eq('is_active',true).order('name')
  return data??[]
}

const getClasses = async (gymId, date) => {
  const {data} = await supabase.from('yoga_classes')
    .select('*, instructor:staff(name,avatar_color), bookings:yoga_bookings(id,status)')
    .eq('gym_id',gymId).eq('date',date).order('start_time')
  return data??[]
}

const getAllClasses = async (gymId) => {
  const today = new Date().toISOString().split('T')[0]
  const {data} = await supabase.from('yoga_classes')
    .select('*, instructor:staff(name,avatar_color), bookings:yoga_bookings(id,status,client_name)')
    .eq('gym_id',gymId).gte('date',today).order('date').order('start_time').limit(100)
  return data??[]
}

const getSchedule = async (gymId) => {
  const {data} = await supabase.from('yoga_schedule')
    .select('*, instructor:staff(name,avatar_color)')
    .eq('gym_id',gymId).eq('is_active',true).order('day_order').order('start_time')
  return data??[]
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ gymId, setPage }) {
  const today = new Date().toISOString().split('T')[0]
  const { data: stats, reload: rs } = useAsync(() => getStats(gymId), [gymId])
  const { data: classes, loading, reload: rc } = useAsync(() => getClasses(gymId, today), [gymId])
  const s = stats||{}

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Dashboard</div><div className="ps">{new Date().toLocaleDateString('sq-AL',{weekday:'long',day:'numeric',month:'long'})}</div></div>
        <div className="pa">
          <button className="btn btn-s btn-sm" onClick={()=>{rs();rc()}}>↻</button>
          <button className="btn btn-p" onClick={()=>setPage('new-class')}>+ Klasë e Re</button>
        </div>
      </div>

      <div className="sg">
        <StatCard icon="🧘" label="Klasa Sot"        value={s.today_classes??0}                 change="sot" up/>
        <StatCard icon="📅" label="Klasa Muaj"        value={s.month_classes??0}                 change="muaj" up/>
        <StatCard icon="👥" label="Rezervime Muaj"    value={s.month_bookings??0}                change="muaj" up/>
        <StatCard icon="💰" label="Të Ardhura Muaj"   value={fmtNum(s.month_revenue??0)+' L'}   change="muaj" up/>
      </div>

      <div className="card">
        <div className="card-hd">
          <div className="card-t">🧘 Klasat e Sotme</div>
          <span className="bdg bdg-bl">{(classes||[]).length}</span>
        </div>
        {loading?<Loading/>:(classes||[]).length===0?(
          <Empty icon="🧘" title="Asnjë klasë sot" sub="Shto klasë ose konfiguro orarin javor"/>
        ):(
          <div>
            {(classes||[]).map((c,i)=>{
              const confirmed = (c.bookings||[]).filter(b=>b.status==='confirmed').length
              const pct = c.capacity ? Math.round(confirmed/c.capacity*100) : 0
              return (
                <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 18px',borderBottom:i<classes.length-1?'1px solid var(--border)':'none',flexWrap:'wrap'}}>
                  <div style={{width:52,height:52,borderRadius:12,background:'linear-gradient(135deg,#7c3aed,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <div style={{textAlign:'center'}}>
                      <div style={{fontWeight:800,fontSize:13,color:'#fff',lineHeight:1}}>{c.start_time?.slice(0,5)}</div>
                      <div style={{fontSize:9,color:'rgba(255,255,255,.6)',marginTop:1}}>{c.duration_min}min</div>
                    </div>
                  </div>
                  <div style={{flex:1,minWidth:150}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:3}}>{c.class_type} <span className="bdg bdg-pu" style={{fontSize:10}}>{LEVELS[c.level]||c.level}</span></div>
                    <div style={{fontSize:12,color:'var(--tx3)'}}>👤 {c.instructor?.name||'—'} · 💰 {fmtNum(c.price)} L</div>
                  </div>
                  <div style={{textAlign:'right',minWidth:100}}>
                    <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{confirmed} / {c.capacity||'∞'}</div>
                    {c.capacity&&(
                      <div className="prog" style={{width:100}}>
                        <div className="pf" style={{width:`${pct}%`,background:pct>=90?'var(--rd)':pct>=70?'var(--am)':'var(--pu)'}}/>
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-p btn-xs" onClick={()=>setPage('classes')}>Shiko</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── NEW CLASS ─────────────────────────────────────────────
function NewClass({ gymId, onDone }) {
  const { data: instructors } = useAsync(() => getInstructors(gymId), [gymId])
  const [form, setForm] = useState({
    class_type:'Yoga', level:'all', date: new Date().toISOString().split('T')[0],
    start_time:'09:00', duration_min:60, capacity:15, price:500,
    instructor_id:'', description:'', is_recurring:false, recurring_days:[],
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const toggleDay = (day) => {
    const days = form.recurring_days.includes(day)
      ? form.recurring_days.filter(d=>d!==day)
      : [...form.recurring_days, day]
    set('recurring_days', days)
  }

  const save = async () => {
    if (!form.class_type) { toast.error('Zgjidh llojin e klasës'); return }
    setSaving(true)
    try {
      const endMin = parseInt(form.start_time.split(':')[0])*60 + parseInt(form.start_time.split(':')[1]) + Number(form.duration_min)
      const end_time = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`

      if (form.is_recurring && form.recurring_days.length > 0) {
        // Shto klasë për 4 javët e ardhshme
        const inserts = []
        for (let w=0; w<4; w++) {
          for (const day of form.recurring_days) {
            const dayIdx = DAYS.indexOf(day)
            const d = new Date(form.date)
            const diff = (dayIdx - d.getDay() + 7) % 7 + w*7
            const classDate = new Date(d)
            classDate.setDate(d.getDate() + diff)
            inserts.push({
              gym_id:gymId,
              class_type:form.class_type, level:form.level,
              date:classDate.toISOString().split('T')[0],
              start_time:form.start_time+':00', end_time:end_time+':00',
              duration_min:Number(form.duration_min),
              capacity:Number(form.capacity)||null,
              price:Number(form.price)||0,
              instructor_id:form.instructor_id||null,
              description:form.description||null,
            })
          }
        }
        await supabase.from('yoga_classes').insert(inserts)
        toast.success(`✅ ${inserts.length} klasa u shtuan (4 javë)!`)
      } else {
        await supabase.from('yoga_classes').insert({
          gym_id:gymId, class_type:form.class_type, level:form.level,
          date:form.date, start_time:form.start_time+':00', end_time:end_time+':00',
          duration_min:Number(form.duration_min), capacity:Number(form.capacity)||null,
          price:Number(form.price)||0, instructor_id:form.instructor_id||null,
          description:form.description||null,
        })
        toast.success('✅ Klasa u shtua!')
      }
      onDone()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Klasë e Re</div></div>
        <button className="btn btn-g btn-sm" onClick={onDone}>← Kthehu</button>
      </div>

      <div className="g2">
        <div className="card" style={{padding:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📋 Informacioni i Klasës</div>
          <div className="fg">
            <div className="fgp"><label>Lloji i Klasës *</label>
              <select value={form.class_type} onChange={e=>set('class_type',e.target.value)}>
                {CLASS_TYPES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Niveli</label>
              <select value={form.level} onChange={e=>set('level',e.target.value)}>
                {Object.entries(LEVELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="fgp"><label>Instruktori</label>
              <select value={form.instructor_id} onChange={e=>set('instructor_id',e.target.value)}>
                <option value="">— Zgjidh —</option>
                {(instructors||[]).map(i=><option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Kapaciteti (vende)</label><input type="number" value={form.capacity} onChange={e=>set('capacity',e.target.value)} min="1" max="100"/></div>
            <div className="fgp"><label>Çmimi (ALL)</label><input type="number" value={form.price} onChange={e=>set('price',e.target.value)} min="0"/></div>
          </div>
          <div className="fg" style={{marginBottom:0}}>
            <div className="fgp"><label>Përshkrim (opsionale)</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Përshkrim i shkurtër..."/></div>
          </div>
        </div>

        <div>
          <div className="card" style={{padding:20,marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📅 Data & Ora</div>
            <div className="fg">
              <div className="fgp"><label>Data</label><input type="date" value={form.date} min={new Date().toISOString().split('T')[0]} onChange={e=>set('date',e.target.value)}/></div>
            </div>
            <div className="fg c2">
              <div className="fgp"><label>Ora e Fillimit</label><input type="time" value={form.start_time} onChange={e=>set('start_time',e.target.value)}/></div>
              <div className="fgp"><label>Kohëzgjatja (min)</label>
                <select value={form.duration_min} onChange={e=>set('duration_min',e.target.value)}>
                  {[30,45,60,75,90,120].map(m=><option key={m} value={m}>{m} min</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div className="card" style={{padding:20}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:form.is_recurring?16:0}}>
              <input type="checkbox" id="rec" checked={form.is_recurring} onChange={e=>set('is_recurring',e.target.checked)} style={{width:16,height:16,cursor:'pointer'}}/>
              <label htmlFor="rec" style={{fontSize:13,fontWeight:600,cursor:'pointer'}}>🔄 Klasë e Përsëritur (çdo javë)</label>
            </div>
            {form.is_recurring&&(
              <>
                <div style={{fontSize:12,color:'var(--tx3)',marginBottom:12}}>Zgjidh ditët — do të shtohet për 4 javët e ardhshme</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {DAYS.map(d=>(
                    <button key={d} type="button" onClick={()=>toggleDay(d)} style={{padding:'7px 11px',borderRadius:8,border:`1.5px solid ${form.recurring_days.includes(d)?'var(--pu)':'var(--border)'}`,background:form.recurring_days.includes(d)?'var(--pul)':'#fff',color:form.recurring_days.includes(d)?'var(--pu)':'var(--tx2)',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
                      {DAYS_AL[d]?.slice(0,3)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{marginTop:16,display:'flex',justifyContent:'flex-end',gap:10}}>
        <button className="btn btn-s" onClick={onDone}>Anulo</button>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'✅ Shto Klasën'}</button>
      </div>
    </div>
  )
}

// ── CLASSES LIST ──────────────────────────────────────────
function ClassesList({ gymId }) {
  const { data: classes, loading, reload } = useAsync(() => getAllClasses(gymId), [gymId])
  const [selected, setSelected] = useState(null)
  const [showBook, setShowBook] = useState(null)
  const [bookForm, setBookForm] = useState({ name:'', phone:'', email:'' })
  const [booking, setBooking] = useState(false)

  const cancelClass = async (id) => {
    if (!confirm('Anulo këtë klasë?')) return
    await supabase.from('yoga_classes').update({is_cancelled:true}).eq('id',id)
    toast.success('Klasa u anulua'); reload()
  }

  const doBook = async () => {
    if (!bookForm.name) { toast.error('Vendos emrin'); return }
    setBooking(true)
    try {
      const cls = showBook
      const confirmed = (cls.bookings||[]).filter(b=>b.status==='confirmed').length
      if (cls.capacity && confirmed >= cls.capacity) { toast.error('Klasa është e plotë'); return }
      await supabase.from('yoga_bookings').insert({
        gym_id: gymId, class_id: cls.id,
        client_name: bookForm.name, client_phone: bookForm.phone||null,
        client_email: bookForm.email||null,
        status: 'confirmed', price_paid: cls.price, payment_status:'unpaid',
      })
      toast.success('✅ Rezervimi u bë!')
      // Email konfirmimi
      if (bookForm.email) {
        const gymData = await supabase.from('gyms').select('name,phone').eq('id',gymId).single()
        await emailClassBookingConfirm({
          booking: { client_email: bookForm.email, client_name: bookForm.name },
          yogaClass: showBook,
          gym: gymData.data
        })
      }
      setShowBook(null); reload()
    } catch(e) { toast.error(e.message) }
    finally { setBooking(false) }
  }

  const grouped = {}
  ;(classes||[]).forEach(c => {
    const d = c.date; if (!grouped[d]) grouped[d] = []; grouped[d].push(c)
  })

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Klasat</div><div className="ps">Ardhshme dhe aktive</div></div>
        <button className="btn btn-s btn-sm" onClick={reload}>↻</button>
      </div>

      {loading?<Loading/>:Object.keys(grouped).length===0?<Empty icon="🧘" title="Asnjë klasë" sub="Shto klasë nga butoni '+ Klasë e Re'"/>:(
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {Object.entries(grouped).map(([date, dayClasses])=>(
            <div key={date}>
              <div style={{fontWeight:700,fontSize:13,color:'var(--tx3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10,paddingBottom:6,borderBottom:'1px solid var(--border)'}}>
                📅 {fmtDate(date)} — {new Date(date+'T00:00:00').toLocaleDateString('sq-AL',{weekday:'long'})}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {dayClasses.map(c=>{
                  const confirmed = (c.bookings||[]).filter(b=>b.status==='confirmed').length
                  const pct = c.capacity ? Math.round(confirmed/c.capacity*100) : 0
                  const isFull = c.capacity && confirmed >= c.capacity
                  return (
                    <div key={c.id} className="card" style={{padding:0,overflow:'hidden',opacity:c.is_cancelled?.5:1}}>
                      <div style={{display:'flex',alignItems:'center',gap:0}}>
                        {/* Time strip */}
                        <div style={{width:72,background:'linear-gradient(180deg,#7c3aed,#2563eb)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'18px 8px',flexShrink:0}}>
                          <div style={{fontWeight:800,fontSize:16,color:'#fff',lineHeight:1}}>{c.start_time?.slice(0,5)}</div>
                          <div style={{fontSize:10,color:'rgba(255,255,255,.6)',marginTop:4}}>{c.duration_min}min</div>
                        </div>
                        {/* Content */}
                        <div style={{flex:1,padding:'14px 18px'}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,flexWrap:'wrap',gap:8}}>
                            <div>
                              <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>
                                {c.class_type}
                                {c.is_cancelled&&<span className="bdg bdg-rd" style={{marginLeft:8}}>Anuluar</span>}
                              </div>
                              <div style={{fontSize:12,color:'var(--tx3)',display:'flex',gap:12,flexWrap:'wrap'}}>
                                {c.instructor&&<span>👤 {c.instructor.name}</span>}
                                <span>{LEVELS[c.level]||c.level}</span>
                                <span>💰 {fmtNum(c.price)} L</span>
                              </div>
                            </div>
                            <div style={{textAlign:'right'}}>
                              <div style={{fontWeight:700,fontSize:16,marginBottom:4,color:isFull?'var(--rd)':'var(--tx)'}}>{confirmed}{c.capacity?` / ${c.capacity}`:''} 👥</div>
                              {c.capacity&&<div className="prog" style={{width:80,marginLeft:'auto'}}><div className="pf" style={{width:`${pct}%`,background:pct>=90?'var(--rd)':pct>=70?'var(--am)':'var(--pu)'}}/></div>}
                            </div>
                          </div>
                          {/* Booked clients */}
                          {selected===c.id&&(c.bookings||[]).length>0&&(
                            <div style={{marginTop:10,padding:12,background:'var(--surface2)',borderRadius:8}}>
                              <div style={{fontSize:11,fontWeight:700,color:'var(--tx3)',marginBottom:8,textTransform:'uppercase'}}>Klientët ({confirmed})</div>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                {(c.bookings||[]).filter(b=>b.status==='confirmed').map(b=>(
                                  <div key={b.id} style={{fontSize:12,color:'var(--tx2)',display:'flex',justifyContent:'space-between'}}>
                                    <span>👤 {b.client_name}</span>
                                    <button className="btn btn-danger btn-xs" onClick={async()=>{await supabase.from('yoga_bookings').update({status:'cancelled'}).eq('id',b.id);reload()}}>✕</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                            <button className="btn btn-s btn-xs" onClick={()=>setSelected(selected===c.id?null:c.id)}>
                              {selected===c.id?'▲ Fshih':'👥 Klientët'}
                            </button>
                            {!c.is_cancelled&&!isFull&&<button className="btn btn-p btn-xs" onClick={()=>{setShowBook(c);setBookForm({name:'',phone:'',email:''})}}>+ Rezervo</button>}
                            {isFull&&<span className="bdg bdg-rd">🔒 E Plotë</span>}
                            {!c.is_cancelled&&<button className="btn btn-danger btn-xs" onClick={()=>cancelClass(c.id)}>❌ Anulo</button>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showBook&&(
        <Modal title={`+ Rezervo — ${showBook.class_type} ${showBook.start_time?.slice(0,5)}`} onClose={()=>setShowBook(null)} footer={
          <><button className="btn btn-s" onClick={()=>setShowBook(null)}>Anulo</button>
          <button className="btn btn-p" onClick={doBook} disabled={booking}>{booking?'Duke rezervuar...':'✅ Rezervo'}</button></>
        }>
          <div className="alert al-bl" style={{marginBottom:14}}>
            📅 {fmtDate(showBook.date)} · ⏰ {showBook.start_time?.slice(0,5)} · 👥 {(showBook.bookings||[]).filter(b=>b.status==='confirmed').length}/{showBook.capacity||'∞'} vende
          </div>
          <div className="fg"><div className="fgp"><label>Emri *</label><input autoFocus value={bookForm.name} onChange={e=>setBookForm(f=>({...f,name:e.target.value}))} placeholder="Emri Mbiemri"/></div></div>
          <div className="fg c2">
            <div className="fgp"><label>Telefon</label><input value={bookForm.phone} onChange={e=>setBookForm(f=>({...f,phone:e.target.value}))} placeholder="+355 69..."/></div>
            <div className="fgp"><label>Email</label><input value={bookForm.email} onChange={e=>setBookForm(f=>({...f,email:e.target.value}))}/></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── INSTRUCTORS ───────────────────────────────────────────
function Instructors({ gymId }) {
  const { data: staff, loading, reload } = useAsync(() => getInstructors(gymId), [gymId])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', phone:'', email:'', speciality:'', bio:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    if (!form.name) { toast.error('Vendos emrin'); return }
    setSaving(true)
    try {
      const data = { gym_id:gymId, name:form.name, phone:form.phone||null, email:form.email||null, speciality:form.speciality||null, bio:form.bio||null, avatar_color:Math.floor(Math.random()*8) }
      if (editing) { await supabase.from('staff').update(data).eq('id',editing.id); toast.success('✅ U përditësua!') }
      else { await supabase.from('staff').insert(data); toast.success('✅ Instruktori u shtua!') }
      setShowAdd(false); setEditing(null); reload()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const startEdit = (s) => {
    setForm({ name:s.name, phone:s.phone||'', email:s.email||'', speciality:s.speciality||'', bio:s.bio||'' })
    setEditing(s); setShowAdd(true)
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Instruktorët</div><div className="ps">{(staff||[]).length} instruktorë</div></div>
        <button className="btn btn-p" onClick={()=>{setEditing(null);setForm({name:'',phone:'',email:'',speciality:'',bio:''});setShowAdd(true)}}>+ Shto Instruktor</button>
      </div>
      {loading?<Loading/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
          {(staff||[]).length===0?<Empty icon="👤" title="Asnjë instruktor" sub="Shto instruktorin e parë"/>:
          (staff||[]).map(s=>(
            <div key={s.id} className="card" style={{padding:24}}>
              <div style={{display:'flex',gap:14,alignItems:'center',marginBottom:14}}>
                <Avatar color={s.avatar_color||0} name={s.name} size="lg"/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:16}}>{s.name}</div>
                  <div style={{fontSize:12,color:'var(--tx3)',marginTop:3}}>{s.speciality||'Instruktor'}</div>
                  {s.phone&&<div style={{fontSize:12,color:'var(--tx4)',marginTop:2}}>📞 {s.phone}</div>}
                </div>
                <button className="btn btn-g btn-xs" onClick={()=>startEdit(s)}>✏️</button>
              </div>
              {s.bio&&<div style={{fontSize:13,color:'var(--tx2)',lineHeight:1.6,background:'var(--surface2)',borderRadius:8,padding:'8px 12px'}}>{s.bio}</div>}
            </div>
          ))}
        </div>
      )}
      {showAdd&&(
        <Modal title={editing?`✏️ Edito — ${editing.name}`:'👤 Instruktor i Ri'} onClose={()=>{setShowAdd(false);setEditing(null)}} footer={
          <><button className="btn btn-s" onClick={()=>{setShowAdd(false);setEditing(null)}}>Anulo</button>
          <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'✅ Ruaj'}</button></>
        }>
          <div className="fg"><div className="fgp"><label>Emri *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Emri Mbiemri"/></div></div>
          <div className="fg c2">
            <div className="fgp"><label>Specializimi</label><input value={form.speciality} onChange={e=>set('speciality',e.target.value)} placeholder="Yoga, Pilates, Meditim..."/></div>
            <div className="fgp"><label>Telefon</label><input value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
          </div>
          <div className="fg" style={{marginBottom:0}}><div className="fgp"><label>Bio</label><textarea value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Pak fjalë për instruktorin..."/></div></div>
        </Modal>
      )}
    </div>
  )
}

// ── LAYOUT ────────────────────────────────────────────────
// ── WAITLIST PAGE ─────────────────────────────────────────
function WaitlistPage({ gymId }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({name:'',phone:'',email:'',class_name:'',notes:''})
  const sf = (k,v) => setForm(p=>({...p,[k]:v}))

  useEffect(()=>{
    setLoading(true)
    supabase.from('waitlist').select('*').eq('gym_id',gymId).order('created_at',{ascending:false})
      .then(({data})=>{setEntries(data||[]);setLoading(false)})
  },[gymId])

  const save = async e => {
    e.preventDefault()
    if(!form.name||!form.phone) return
    const {error} = await supabase.from('waitlist').insert({...form,gym_id:gymId,status:'waiting'})
    if(!error){
      toast.success('✅ U shtua në listë!')
      setShowAdd(false)
      setForm({name:'',phone:'',email:'',class_name:'',notes:''})
      const {data} = await supabase.from('waitlist').select('*').eq('gym_id',gymId).order('created_at',{ascending:false})
      setEntries(data||[])
    } else toast.error(error.message)
  }

  const updateStatus = async (id,status) => {
    await supabase.from('waitlist').update({status}).eq('id',id)
    setEntries(p=>p.map(e=>e.id===id?{...e,status}:e))
  }

  if(loading) return <div className="ldg"><div className="spn"/>Duke ngarkuar...</div>
  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Listë Pritjeje</div><div className="ps">{entries.filter(e=>e.status==='waiting').length} në pritje</div></div>
        <button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Shto</button>
      </div>
      <div className="card">
        {entries.length===0 ? (
          <div className="empty" style={{padding:48}}><div className="ei">⏳</div><div className="et">Lista është bosh</div><div className="es">Shto klientët që presin vend</div></div>
        ) : (
          <div className="tw"><table><thead><tr><th>Klienti</th><th>Telefon</th><th>Klasa</th><th>Statusi</th><th>Data</th><th></th></tr></thead>
            <tbody>{entries.map(e=>(
              <tr key={e.id}>
                <td><div className="mn">{e.name}</div>{e.email&&<div className="ms">{e.email}</div>}</td>
                <td><a href={`tel:${e.phone}`} style={{color:'var(--pu)',fontWeight:600,textDecoration:'none'}}>{e.phone}</a></td>
                <td>{e.class_name||'—'}</td>
                <td><span className={`bdg ${e.status==='waiting'?'bdg-am':e.status==='contacted'?'bdg-bl':'bdg-gr'}`}>{e.status==='waiting'?'Pret':e.status==='contacted'?'Kontaktuar':'Konfirmuar'}</span></td>
                <td style={{fontSize:12,color:'var(--tx4)'}}>{new Date(e.created_at).toLocaleDateString('sq-AL')}</td>
                <td style={{display:'flex',gap:6}}>
                  {e.status==='waiting'&&<button className="btn btn-s btn-sm" onClick={()=>updateStatus(e.id,'contacted')}>✓ Kontakto</button>}
                  {e.status==='contacted'&&<button className="btn btn-success btn-sm" onClick={()=>updateStatus(e.id,'confirmed')}>✓ Konfirmo</button>}
                  <a href={`tel:${e.phone}`} className="btn btn-s btn-sm">📞</a>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
      {showAdd&&(
        <div className="overlay" onClick={()=>setShowAdd(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mhd"><div className="mt">Shto në Listë</div><button className="mcl" onClick={()=>setShowAdd(false)}>×</button></div>
            <form onSubmit={save} className="mb">
              <div className="fg c2">
                <div className="fgp"><label>Emri *</label><input value={form.name} onChange={e=>sf('name',e.target.value)} placeholder="Emri Mbiemri" required/></div>
                <div className="fgp"><label>Telefon *</label><input value={form.phone} onChange={e=>sf('phone',e.target.value)} placeholder="+355 69..." required/></div>
              </div>
              <div className="fg c2">
                <div className="fgp"><label>Email</label><input type="email" value={form.email} onChange={e=>sf('email',e.target.value)}/></div>
                <div className="fgp"><label>Klasa e dëshiruar</label><input value={form.class_name} onChange={e=>sf('class_name',e.target.value)} placeholder="p.sh. Yoga Hatha"/></div>
              </div>
              <div className="fgp"><label>Shënime</label><textarea value={form.notes} onChange={e=>sf('notes',e.target.value)} placeholder="Çdo informacion shtesë..."/></div>
              <div className="mft"><button type="button" className="btn btn-s" onClick={()=>setShowAdd(false)}>Anulo</button><button type="submit" className="btn btn-pu">Shto</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── REMINDERS PAGE ────────────────────────────────────────
function RemindersPage({ gymId }) {
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(null)

  useEffect(()=>{
    const today = new Date().toISOString().split('T')[0]
    const in3days = new Date(Date.now()+3*86400000).toISOString().split('T')[0]
    supabase.from('appointments').select('id,client_name,client_phone,appointment_date,start_time,services(name)').eq('gym_id',gymId).gte('appointment_date',today).lte('appointment_date',in3days).in('status',['confirmed','pending']).order('appointment_date')
      .then(({data})=>{setUpcoming(data||[]);setLoading(false)})
  },[gymId])

  const sendReminder = async (appt) => {
    setSending(appt.id)
    try {
      // SMS reminder via Supabase edge function
      const msg = `Pershendetje ${appt.client_name}! Ju kujtojme se keni rezervim me ne me ${new Date(appt.appointment_date).toLocaleDateString('sq-AL')} ora ${appt.start_time?.slice(0,5)}. Per anulim na kontaktoni. Faleminderit! - Vaqo`
      await supabase.functions.invoke('send-sms', { body: { to: appt.client_phone, message: msg } })
      toast.success(`✅ Kujtesa u dërgua te ${appt.client_name}`)
    } catch(e) { toast.error('❌ Dërgimi dështoi') }
    finally { setSending(null) }
  }

  const sendAll = async () => {
    for(const a of upcoming) { if(a.client_phone) await sendReminder(a) }
  }

  if(loading) return <div className="ldg"><div className="spn"/>Duke ngarkuar...</div>
  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Kujtesat Automatike</div><div className="ps">Rezervimet e 3 ditëve të ardhshme</div></div>
        {upcoming.length>0&&<button className="btn btn-pu" onClick={sendAll}>📲 Dërgo të gjitha</button>}
      </div>
      <div className="alert al-bl" style={{marginBottom:16}}>
        💡 Kujtesa dërgohet automatikisht 24h para rezervimit nëse SMS është aktiv. Mund ta dërgosh edhe manualisht.
      </div>
      <div className="card">
        {upcoming.length===0 ? (
          <div className="empty" style={{padding:48}}><div className="ei">🔔</div><div className="et">Nuk ka rezervime</div><div className="es">Rezervimet e 3 ditëve të ardhshme shfaqen këtu</div></div>
        ) : (
          <div className="tw"><table><thead><tr><th>Klienti</th><th>Telefon</th><th>Shërbimi</th><th>Data & Ora</th><th></th></tr></thead>
            <tbody>{upcoming.map(a=>(
              <tr key={a.id}>
                <td><div className="mn">{a.client_name}</div></td>
                <td>{a.client_phone||'—'}</td>
                <td>{a.services?.name||'—'}</td>
                <td style={{fontSize:13}}>{new Date(a.appointment_date).toLocaleDateString('sq-AL',{weekday:'short',day:'numeric',month:'short'})} · {a.start_time?.slice(0,5)}</td>
                <td><button className="btn btn-s btn-sm" onClick={()=>sendReminder(a)} disabled={!a.client_phone||sending===a.id}>{sending===a.id?'Duke dërguar...':'📲 Dërgo Kujtesë'}</button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}


const NAV = [
  {s:'Kryesore', items:[{id:'dashboard',l:'Dashboard',i:'📊'},{id:'new-class',l:'Klasë e Re',i:'➕'},{id:'classes',l:'Të gjitha Klasat',i:'📋'}]},
  {s:'Menaxhim', items:[{id:'instructors',l:'Instruktorët',i:'🧘'},{id:'waitlist',l:'Listë Pritjeje',i:'⏳'},{id:'reminders',l:'Kujtesat',i:'🔔'}]},
  {s:'Rritje', items:[{id:'analytics',l:'Analytics',i:'📈'},{id:'affiliate',l:'Affiliate',i:'🤝'}]},
]
const TITLES = { dashboard:'Dashboard', calendar:'📅 Kalendari', waitlist:'⏳ Listë Pritjeje', reminders:'🔔 Kujtesat', 'new-class':'Klasë e Re', classes:'Klasat', instructors:'Instruktorët', analytics:'📊 Analytics', affiliate:'🤝 Affiliate' }

export default function YogaDashboard() {
  const [showOnboarding, setShowOnboarding] = React.useState(false)
  React.useEffect(()=>{
    if(!gymId)return
    supabase.from('gyms').select('onboarding_done').eq('id',gymId).single().then(({data})=>{
      if(data&&!data.onboarding_done)setShowOnboarding(true)
    })
  },[gymId])
  const { profile, gymId, logout } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [sbOpen, setSbOpen] = useState(false)
  const nav = id => { setPage(id); setSbOpen(false) }
  const gymName  = profile?.gym?.name || 'Studio'
  const userName = profile?.data?.name || 'Admin'
  const bizType  = profile?.gym?.business_type || 'yoga'
  const bizIcon  = bizType==='pilates'?'🤸':bizType==='martial_arts'?'🥊':'🧘'
  const bizLabel = bizType==='pilates'?'Pilates':bizType==='martial_arts'?'Arte Marciale':'Yoga Studio'

  const PAGE = {
    dashboard:    <Dashboard   gymId={gymId} setPage={nav}/>,
    calendar:     <AppointmentCalendar gymId={gymId}/>,
    'new-class':  <NewClass    gymId={gymId} onDone={()=>nav('classes')}/>,
    classes:      <ClassesList gymId={gymId}/>,
    instructors:  <Instructors gymId={gymId}/>,
    analytics:    <AnalyticsDashboard gymId={gymId}/>,
    affiliate:    <AffiliateDashboard gymId={gymId}/>,
    waitlist:    <WaitlistPage gymId={gymId}/>,
    reminders:   <RemindersPage gymId={gymId}/>,
  }

  return (
    <div className="app">
      {showOnboarding&&(
        <div style={{position:'fixed',inset:0,zIndex:9999}}>
          <OnboardingFlow gymId={gymId} onComplete={()=>setShowOnboarding(false)}/>
        </div>
      )}
      <div className={`sbo ${sbOpen?'open':''}`} onClick={()=>setSbOpen(false)}/>
      <aside className={`sidebar ${sbOpen?'open':''}`}>
        <div className="sb-logo">
          <div className="sb-icon">{bizIcon}</div>
          <div><div className="sb-name">{gymName}</div><div className="sb-sub">Vaqo {bizLabel}</div></div>
        </div>
        <nav className="nav">
          {NAV.map(s=>(
            <div key={s.s} className="nav-sec">
              <div className="nav-lbl">{s.s}</div>
              {s.items.map(item=>(
                <div key={item.id} className={`nav-item ${page===item.id?'active':''}`} onClick={()=>nav(item.id)}>
                  <span className="nav-ico">{item.i}</span>{item.l}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-bot">
          <div className="user-card" onClick={logout}>
            <div className="user-av">{userName.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
            <div><div className="user-nm">{userName}</div><div className="user-rl">owner · Dil →</div></div>
          </div>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="tbl">
            <button className="hmbg" style={{display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSbOpen(s=>!s)}>☰</button>
            <div className="tb-title">{TITLES[page]||'Dashboard'}</div>
          </div>
          <div className="tbr">
            <span style={{fontSize:11,color:'var(--gr)',fontWeight:600}}>● Live</span>
            <a href={`/book/${gymId}`} target='_blank' style={{fontSize:11,color:'var(--pu)',fontWeight:600,textDecoration:'none',background:'var(--pul)',padding:'4px 10px',borderRadius:20,border:'1px solid var(--pum)'}}>🔗 Booking Link</a>
            <PushNotifButton gymId={gymId}/>
            <span className="bdg bdg-pu">{bizIcon} {gymName}</span>
            <button className="btn btn-p btn-sm" onClick={()=>nav('new-class')}>+ Klasë</button>
          </div>
        </div>
        <div className="content">{PAGE[page]||<Dashboard gymId={gymId} setPage={nav}/>}</div>
      </main>
    </div>
  )
}
