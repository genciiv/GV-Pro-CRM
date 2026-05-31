import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { useAsync } from '../../hooks/useAsync'
import { supabase } from '../../lib/supabase'
import { fmtNum, fmtDate, AVC } from '../../lib/db'
import { StatCard, Modal, Loading, Empty, Avatar } from '../../components/UI'
import toast from 'react-hot-toast'
import { emailAppointmentConfirm } from '../../lib/email'

const DAYS_AL = { Mon:'E Hënë', Tue:'E Martë', Wed:'E Mërkurë', Thu:'E Enjte', Fri:'E Premte', Sat:'E Shtunë', Sun:'E Diel' }
const DAYS    = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const STATUS_BADGE = {
  pending:   <span className="bdg bdg-am">⏳ Pritje</span>,
  confirmed: <span className="bdg bdg-bl">✅ Konfirmuar</span>,
  completed: <span className="bdg bdg-gr">🎉 Kryer</span>,
  cancelled: <span className="bdg bdg-rd">❌ Anuluar</span>,
  no_show:   <span className="bdg bdg-gy">👻 Nuk Erdhi</span>,
}
const HOURS = Array.from({length:24}, (_,i) => `${String(i).padStart(2,'0')}:00`)

// ── DATA FUNCTIONS ─────────────────────────────────────────
const getStats      = async (gymId) => { const {data} = await supabase.from('appointment_stats').select('*').eq('gym_id',gymId).maybeSingle(); return data||{} }
const getStaff      = async (gymId) => { const {data} = await supabase.from('staff').select('*').eq('gym_id',gymId).eq('is_active',true).order('name'); return data||[] }
const getServices   = async (gymId) => { const {data} = await supabase.from('services').select('*').eq('gym_id',gymId).eq('is_active',true).order('sort_order'); return data||[] }
const getAppts      = async (gymId, date) => {
  const {data} = await supabase.from('appointments')
    .select('*, staff(*), service:services(*)')
    .eq('gym_id', gymId).eq('appointment_date', date)
    .order('start_time')
  return data||[]
}
const getAllAppts = async (gymId) => {
  const {data} = await supabase.from('appointments')
    .select('*, staff(*), service:services(*)')
    .eq('gym_id', gymId).order('appointment_date', {ascending:false}).order('start_time').limit(100)
  return data||[]
}
const getSlots = async (staffId, date, duration) => {
  const {data} = await supabase.rpc('get_available_slots', {p_staff_id:staffId, p_date:date, p_duration_min:duration})
  return data||[]
}

// ── DASHBOARD ─────────────────────────────────────────────
function Dashboard({ gymId, setPage }) {
  const today = new Date().toISOString().split('T')[0]
  const { data: stats, reload: rs } = useAsync(() => getStats(gymId), [gymId])
  const { data: appts, loading, reload: ra } = useAsync(() => getAppts(gymId, today), [gymId])
  const s = stats||{}

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Dashboard</div><div className="ps">{new Date().toLocaleDateString('sq-AL',{weekday:'long',day:'numeric',month:'long'})}</div></div>
        <div className="pa">
          <button className="btn btn-s btn-sm" onClick={()=>{rs();ra()}}>↻</button>
          <button className="btn btn-p" onClick={()=>setPage('new-appointment')}>+ Rezervim i Ri</button>
        </div>
      </div>

      <div className="sg">
        <StatCard icon="📅" label="Rezervime Sot"    value={s.today_total??0}               change="sot" up/>
        <StatCard icon="✅" label="Konfirmuara"       value={s.today_confirmed??0}           change="konfirmuar" up/>
        <StatCard icon="🎉" label="Kryera Sot"        value={s.today_completed??0}           change="kryer" up/>
        <StatCard icon="💰" label="Të Ardhura Sot"    value={fmtNum(s.today_revenue??0)+' L'} change="sot" up/>
        <StatCard icon="📆" label="Rezervime Muaj"    value={s.month_total??0}               change="muaj" up/>
        <StatCard icon="💳" label="Të Ardhura Muaj"   value={fmtNum(s.month_revenue??0)+' L'} change="muaj" up/>
      </div>

      {(s.pending_total??0) > 0 && (
        <div className="alert al-am" style={{cursor:'pointer'}} onClick={()=>setPage('appointments')}>
          ⚠️ Ke <strong>{s.pending_total} rezervime</strong> në pritje konfirmimi!
        </div>
      )}

      <div className="card">
        <div className="card-hd">
          <div className="card-t">📅 Rezervimet e Sotme</div>
          <span className="bdg bdg-bl">{(appts||[]).length}</span>
        </div>
        {loading?<Loading/>:(appts||[]).length===0?(
          <Empty icon="📅" title="Asnjë rezervim sot" sub="Shto rezervimin e parë"/>
        ):(
          <div className="tw"><table>
            <thead><tr><th>Ora</th><th>Klienti</th><th>Berberi</th><th>Shërbimi</th><th>Çmimi</th><th>Statusi</th><th>Veprime</th></tr></thead>
            <tbody>
              {(appts||[]).map(a=>(
                <tr key={a.id}>
                  <td style={{fontWeight:700,color:'var(--ac)',fontSize:14}}>{a.start_time?.slice(0,5)} – {a.end_time?.slice(0,5)}</td>
                  <td><div><div style={{fontWeight:500}}>{a.client_name}</div><div style={{fontSize:11,color:'var(--g400)'}}>{a.client_phone}</div></div></td>
                  <td><div className="mc"><Avatar color={a.staff?.avatar_color||0} name={a.staff?.name||'?'} size="sm"/><div className="mn">{a.staff?.name}</div></div></td>
                  <td><span className="bdg bdg-gy">{a.service?.emoji} {a.service?.name}</span></td>
                  <td style={{fontWeight:600}}>{fmtNum(a.price)} L</td>
                  <td>{STATUS_BADGE[a.status]}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      {a.status==='pending'&&<button className="btn btn-success btn-xs" onClick={async()=>{await supabase.from('appointments').update({status:'confirmed'}).eq('id',a.id);toast.success('✅ Konfirmuar!');ra()}}>✅</button>}
                      {a.status==='confirmed'&&<button className="btn btn-p btn-xs" onClick={async()=>{await supabase.from('appointments').update({status:'completed',payment_status:'paid',updated_at:new Date().toISOString()}).eq('id',a.id);toast.success('🎉 Kryer!');ra();rs()}}>🎉</button>}
                      {(a.status==='pending'||a.status==='confirmed')&&<button className="btn btn-danger btn-xs" onClick={async()=>{await supabase.from('appointments').update({status:'cancelled'}).eq('id',a.id);toast.success('Anuluar');ra()}}>❌</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}

// ── NEW APPOINTMENT ────────────────────────────────────────
function NewAppointment({ gymId, onDone }) {
  const { data: staff }    = useAsync(() => getStaff(gymId),    [gymId])
  const { data: services } = useAsync(() => getServices(gymId), [gymId])
  const [step,    setStep]    = useState(1)
  const [selStaff, setSelStaff] = useState(null)
  const [selSvc,   setSelSvc]   = useState(null)
  const [selDate,  setSelDate]  = useState(new Date().toISOString().split('T')[0])
  const [selSlot,  setSelSlot]  = useState(null)
  const [slots,    setSlots]    = useState([])
  const [loadSlots,setLoadSlots]= useState(false)
  const [form, setForm] = useState({ name:'', phone:'', email:'', notes:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const loadSlots_ = async () => {
    if (!selStaff||!selSvc||!selDate) return
    setLoadSlots(true)
    const data = await getSlots(selStaff.id, selDate, selSvc.duration_min)
    setSlots(data); setLoadSlots(false)
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Vendos emrin e klientit'); return }
    if (!selSlot) { toast.error('Zgjidh orën'); return }
    setSaving(true)
    try {
      const endMin = parseInt(selSlot.slot_time.split(':')[0])*60 + parseInt(selSlot.slot_time.split(':')[1]) + selSvc.duration_min
      const endTime = `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}:00`
      const { error } = await supabase.from('appointments').insert({
        gym_id: gymId,
        staff_id: selStaff.id,
        service_id: selSvc.id,
        client_name: form.name,
        client_phone: form.phone||null,
        client_email: form.email||null,
        appointment_date: selDate,
        start_time: selSlot.slot_time,
        end_time: endTime,
        status: 'confirmed',
        price: selSvc.price,
        payment_status: 'unpaid',
        notes: form.notes||null,
      })
      if (error) throw new Error(error.message)
      toast.success('✅ Rezervimi u shtua!')
      // Dërgo email konfirmimi
      if (form.email) {
        const gymData = await supabase.from('gyms').select('name,phone,address,city').eq('id',gymId).single()
        await emailAppointmentConfirm({
          appointment: {
            client_email: form.email, client_name: form.name,
            service: { name: selSvc?.name }, staff: selStaff,
            appointment_date: selDate, start_time: selSlot+':00',
            price: selSvc?.price
          },
          gym: gymData.data
        })
      }
      onDone()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Rezervim i Ri</div><div className="ps">Hap pas hapi</div></div>
        <button className="btn btn-g btn-sm" onClick={onDone}>← Kthehu</button>
      </div>

      {/* Steps indicator */}
      <div style={{display:'flex',gap:0,marginBottom:24,background:'var(--g100)',borderRadius:12,padding:4}}>
        {[['1','Berberi & Shërbimi'],['2','Data & Ora'],['3','Klienti']].map(([n,l],i)=>(
          <div key={n} style={{flex:1,textAlign:'center',padding:'10px 8px',borderRadius:9,background:step===i+1?'#fff':'transparent',fontWeight:step===i+1?700:400,fontSize:13,color:step===i+1?'var(--g900)':'var(--g400)',transition:'all .2s',boxShadow:step===i+1?'0 1px 4px rgba(0,0,0,.08)':'none',cursor:step>i+1?'pointer':'default'}}
            onClick={()=>step>i+1&&setStep(i+1)}>
            <span style={{display:'block',fontSize:10,fontWeight:700,marginBottom:2,color:step>=i+1?'var(--ac)':'var(--g400)'}}>HAPI {n}</span>
            {l}
          </div>
        ))}
      </div>

      {/* Step 1 — Staff & Service */}
      {step===1&&(
        <div className="g2">
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>👤 Zgjidh Berberin</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {(staff||[]).length===0?<Empty icon="👤" title="Asnjë berber" sub="Shto berber nga Konfigurimet"/>:
              (staff||[]).map(s=>(
                <div key={s.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`2px solid ${selStaff?.id===s.id?'var(--g900)':'var(--g200)'}`,background:selStaff?.id===s.id?'var(--g50)':'#fff',cursor:'pointer',transition:'all .15s'}}
                  onClick={()=>setSelStaff(s)}>
                  <Avatar color={s.avatar_color||0} name={s.name}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14}}>{s.name}</div>
                    <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{s.speciality||'Berber'}</div>
                    <div style={{fontSize:11,color:'var(--g400)',marginTop:2}}>
                      {(s.working_days||[]).map(d=>DAYS_AL[d]?.slice(0,3)||d).join(', ')}
                    </div>
                  </div>
                  {selStaff?.id===s.id&&<span style={{color:'var(--gr)',fontSize:20}}>✓</span>}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>✂️ Zgjidh Shërbimin</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {(services||[]).length===0?<Empty icon="✂️" title="Asnjë shërbim" sub="Shto shërbime nga Konfigurimet"/>:
              (services||[]).map(s=>(
                <div key={s.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,border:`2px solid ${selSvc?.id===s.id?'var(--g900)':'var(--g200)'}`,background:selSvc?.id===s.id?'var(--g50)':'#fff',cursor:'pointer',transition:'all .15s'}}
                  onClick={()=>setSelSvc(s)}>
                  <div style={{width:44,height:44,borderRadius:10,background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>{s.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14}}>{s.name}</div>
                    <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>⏱ {s.duration_min} min</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:700,fontSize:16}}>{fmtNum(s.price)} L</div>
                    {selSvc?.id===s.id&&<span style={{color:'var(--gr)',fontSize:16}}>✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {step===1&&(
        <div style={{marginTop:16,display:'flex',justifyContent:'flex-end'}}>
          <button className="btn btn-p" onClick={()=>{
            if(!selStaff){toast.error('Zgjidh berberin');return}
            if(!selSvc){toast.error('Zgjidh shërbimin');return}
            setStep(2);setSlots([])
          }}>Vazhdo →</button>
        </div>
      )}

      {/* Step 2 — Date & Time */}
      {step===2&&(
        <div className="g2">
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📅 Zgjidh Datën</div>
            <div className="fgp" style={{marginBottom:20}}>
              <label>Data e Rezervimit</label>
              <input type="date" value={selDate} min={minDate} onChange={e=>{setSelDate(e.target.value);setSlots([]);setSelSlot(null)}}/>
            </div>
            <button className="btn btn-s" style={{width:'100%',justifyContent:'center'}} onClick={loadSlots_} disabled={loadSlots}>
              {loadSlots?'Duke ngarkuar...':'🔍 Shiko Oraret e Lira'}
            </button>
            {selStaff&&selSvc&&(
              <div className="alert al-bl" style={{marginTop:12,fontSize:12}}>
                {selStaff.name} · {selSvc.name} · {selSvc.duration_min} min · {fmtNum(selSvc.price)} L
              </div>
            )}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>🕐 Zgjidh Orën</div>
            {slots.length===0?(
              <div style={{textAlign:'center',padding:'32px 16px',color:'var(--g400)',fontSize:13}}>
                {loadSlots?<Loading/>:'Kliko "Shiko Oraret e Lira" për të parë oraret'}
              </div>
            ):(
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxHeight:320,overflowY:'auto'}}>
                {slots.map((slot,i)=>(
                  <button key={i} disabled={!slot.is_available}
                    onClick={()=>setSelSlot(slot)}
                    style={{padding:'10px 6px',borderRadius:9,border:`2px solid ${selSlot?.slot_time===slot.slot_time?'var(--g900)':slot.is_available?'var(--g200)':'var(--g100)'}`,background:selSlot?.slot_time===slot.slot_time?'var(--g900)':slot.is_available?'#fff':'var(--g50)',color:selSlot?.slot_time===slot.slot_time?'#fff':slot.is_available?'var(--g900)':'var(--g300)',cursor:slot.is_available?'pointer':'not-allowed',fontSize:13,fontWeight:600,transition:'all .15s'}}>
                    {slot.slot_time?.slice(0,5)}
                    {!slot.is_available&&<div style={{fontSize:9,fontWeight:400,marginTop:2}}>i zënë</div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {step===2&&(
        <div style={{marginTop:16,display:'flex',justifyContent:'space-between'}}>
          <button className="btn btn-s" onClick={()=>setStep(1)}>← Kthehu</button>
          <button className="btn btn-p" onClick={()=>{
            if(!selSlot){toast.error('Zgjidh orën');return}
            setStep(3)
          }}>Vazhdo →</button>
        </div>
      )}

      {/* Step 3 — Client Info */}
      {step===3&&(
        <>
          <div className="card" style={{marginBottom:16,padding:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📋 Përmbledhja</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                ['👤 Berberi', selStaff?.name],
                ['✂️ Shërbimi', `${selSvc?.emoji} ${selSvc?.name}`],
                ['📅 Data', fmtDate(selDate)],
                ['🕐 Ora', selSlot?.slot_time?.slice(0,5)],
                ['⏱ Kohëzgjatja', `${selSvc?.duration_min} min`],
                ['💰 Çmimi', `${fmtNum(selSvc?.price)} L`],
              ].map(([l,v])=>(
                <div key={l} style={{background:'var(--g50)',borderRadius:8,padding:'10px 12px'}}>
                  <div style={{fontSize:11,color:'var(--g400)',marginBottom:3}}>{l}</div>
                  <div style={{fontWeight:600,fontSize:13}}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{padding:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>👤 Informacioni i Klientit</div>
            <div className="fg"><div className="fgp"><label>Emri i Plotë *</label><input autoFocus value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Emri Mbiemri"/></div></div>
            <div className="fg c2">
              <div className="fgp"><label>Telefon</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..."/></div>
              <div className="fgp"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@..."/></div>
            </div>
            <div className="fg" style={{marginBottom:0}}><div className="fgp"><label>Shënime</label><textarea value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Opsionale..."/></div></div>
          </div>

          <div style={{marginTop:16,display:'flex',justifyContent:'space-between'}}>
            <button className="btn btn-s" onClick={()=>setStep(2)}>← Kthehu</button>
            <button className="btn btn-p" onClick={save} disabled={saving} style={{minWidth:160,justifyContent:'center'}}>
              {saving?'Duke ruajtur...':'✅ Konfirmo Rezervimin'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ── ALL APPOINTMENTS ───────────────────────────────────────
function Appointments({ gymId }) {
  const [filter, setFilter] = useState('today')
  const today = new Date().toISOString().split('T')[0]
  const { data: appts, loading, reload } = useAsync(() => getAllAppts(gymId), [gymId])

  const filtered = (appts||[]).filter(a => {
    if (filter==='today')   return a.appointment_date === today
    if (filter==='upcoming') return a.appointment_date > today && !['cancelled'].includes(a.status)
    if (filter==='pending')  return a.status === 'pending'
    if (filter==='all')      return true
    return a.status === filter
  })

  const updateStatus = async (id, status) => {
    const upd = {status, updated_at: new Date().toISOString()}
    if (status==='completed') upd.payment_status = 'paid'
    await supabase.from('appointments').update(upd).eq('id', id)
    toast.success('U përditësua!'); reload()
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Rezervimet</div><div className="ps">{filtered.length} të shfaqura</div></div>
        <button className="btn btn-s btn-sm" onClick={reload}>↻</button>
      </div>
      <div className="chips">
        {[['today','📅 Sot'],['upcoming','⏭ Ardhshme'],['pending','⏳ Pritje'],['confirmed','✅ Konfirmuara'],['completed','🎉 Kryera'],['cancelled','❌ Anuluara'],['all','Të Gjitha']].map(([k,l])=>(
          <button key={k} className={`chip ${filter===k?'active':''}`} onClick={()=>setFilter(k)}>{l}</button>
        ))}
      </div>
      {loading?<Loading/>:(
        <div className="card">
          <div className="tw"><table>
            <thead><tr><th>Data & Ora</th><th>Klienti</th><th>Berberi</th><th>Shërbimi</th><th>Çmimi</th><th>Pagesa</th><th>Statusi</th><th>Veprime</th></tr></thead>
            <tbody>
              {filtered.length===0?<tr><td colSpan={8}><Empty icon="📅" title="Asnjë rezervim"/></td></tr>:
              filtered.map(a=>(
                <tr key={a.id}>
                  <td>
                    <div style={{fontWeight:700,color:'var(--ac)'}}>{a.start_time?.slice(0,5)}</div>
                    <div style={{fontSize:11,color:'var(--g400)'}}>{fmtDate(a.appointment_date)}</div>
                  </td>
                  <td><div><div style={{fontWeight:500}}>{a.client_name}</div><div style={{fontSize:11,color:'var(--g400)'}}>{a.client_phone}</div></div></td>
                  <td><div className="mc"><Avatar color={a.staff?.avatar_color||0} name={a.staff?.name||'?'} size="sm"/><div className="mn">{a.staff?.name}</div></div></td>
                  <td><span className="bdg bdg-gy">{a.service?.emoji} {a.service?.name}</span></td>
                  <td style={{fontWeight:600}}>{fmtNum(a.price)} L</td>
                  <td>{a.payment_status==='paid'?<span className="bdg bdg-gr">✅ Paguar</span>:
                    <button className="btn btn-success btn-xs" onClick={async()=>{await supabase.from('appointments').update({payment_status:'paid'}).eq('id',a.id);toast.success('💰 Paguar!');reload()}}>💰 Paguaj</button>}
                  </td>
                  <td>{STATUS_BADGE[a.status]}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      {a.status==='pending'&&<button className="btn btn-success btn-xs" onClick={()=>updateStatus(a.id,'confirmed')}>✅</button>}
                      {a.status==='confirmed'&&<button className="btn btn-p btn-xs" onClick={()=>updateStatus(a.id,'completed')}>🎉</button>}
                      {['pending','confirmed'].includes(a.status)&&<button className="btn btn-danger btn-xs" onClick={()=>updateStatus(a.id,'cancelled')}>❌</button>}
                      {a.status==='confirmed'&&<button className="btn btn-g btn-xs" onClick={()=>updateStatus(a.id,'no_show')}>👻</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}

// ── STAFF MANAGEMENT ──────────────────────────────────────
function StaffPage({ gymId }) {
  const { data: staff, loading, reload } = useAsync(() => getStaff(gymId), [gymId])
  const { data: services } = useAsync(() => getServices(gymId), [gymId])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', phone:'', email:'', speciality:'', start_time:'09:00', end_time:'19:00', slot_minutes:30, working_days:['Mon','Tue','Wed','Thu','Fri','Sat'] })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const toggleDay = (day) => {
    const days = form.working_days.includes(day)
      ? form.working_days.filter(d=>d!==day)
      : [...form.working_days, day]
    set('working_days', days)
  }

  const save = async () => {
    if (!form.name) { toast.error('Vendos emrin'); return }
    setSaving(true)
    try {
      const data = { gym_id:gymId, name:form.name, phone:form.phone||null, email:form.email||null, speciality:form.speciality||null, start_time:form.start_time+':00', end_time:form.end_time+':00', slot_minutes:Number(form.slot_minutes)||30, working_days:form.working_days, avatar_color:Math.floor(Math.random()*8) }
      if (editing) {
        await supabase.from('staff').update(data).eq('id', editing.id)
        toast.success('✅ U përditësua!')
      } else {
        await supabase.from('staff').insert(data)
        toast.success('✅ Berberi u shtua!')
      }
      setShowAdd(false); setEditing(null); reload()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const startEdit = (s) => {
    setForm({ name:s.name, phone:s.phone||'', email:s.email||'', speciality:s.speciality||'', start_time:s.start_time?.slice(0,5)||'09:00', end_time:s.end_time?.slice(0,5)||'19:00', slot_minutes:s.slot_minutes||30, working_days:s.working_days||['Mon','Tue','Wed','Thu','Fri','Sat'] })
    setEditing(s); setShowAdd(true)
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Stafi / Berberët</div><div className="ps">{(staff||[]).length} berberë</div></div>
        <button className="btn btn-p" onClick={()=>{setEditing(null);setForm({name:'',phone:'',email:'',speciality:'',start_time:'09:00',end_time:'19:00',slot_minutes:30,working_days:['Mon','Tue','Wed','Thu','Fri','Sat']});setShowAdd(true)}}>+ Shto Berber</button>
      </div>
      {loading?<Loading/>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
          {(staff||[]).length===0?<Empty icon="👤" title="Asnjë berber" sub="Shto berberin e parë"/>:
          (staff||[]).map(s=>(
            <div key={s.id} className="card" style={{padding:20}}>
              <div style={{display:'flex',gap:14,alignItems:'flex-start',marginBottom:16}}>
                <Avatar color={s.avatar_color||0} name={s.name} size="lg"/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{s.name}</div>
                  <div style={{fontSize:12,color:'var(--g500)',marginBottom:6}}>{s.speciality||'Berber'}</div>
                  {s.phone&&<div style={{fontSize:12,color:'var(--g400)'}}>📞 {s.phone}</div>}
                </div>
                <button className="btn btn-g btn-xs" onClick={()=>startEdit(s)}>✏️</button>
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
                {DAYS.map(d=>(
                  <span key={d} style={{fontSize:10,padding:'2px 7px',borderRadius:8,background:(s.working_days||[]).includes(d)?'var(--g900)':'var(--g100)',color:(s.working_days||[]).includes(d)?'#fff':'var(--g400)',fontWeight:600}}>{DAYS_AL[d]?.slice(0,3)}</span>
                ))}
              </div>
              <div style={{fontSize:12,color:'var(--g500)',display:'flex',gap:12}}>
                <span>🕐 {s.start_time?.slice(0,5)} – {s.end_time?.slice(0,5)}</span>
                <span>⏱ Slot: {s.slot_minutes} min</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd&&(
        <Modal title={editing?`✏️ Edito — ${editing.name}`:'👤 Berber i Ri'} onClose={()=>{setShowAdd(false);setEditing(null)}} footer={
          <><button className="btn btn-s" onClick={()=>{setShowAdd(false);setEditing(null)}}>Anulo</button>
          <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'✅ Ruaj'}</button></>
        }>
          <div className="fg"><div className="fgp"><label>Emri *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Artan Berber"/></div></div>
          <div className="fg c2">
            <div className="fgp"><label>Telefon</label><input value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
            <div className="fgp"><label>Specializimi</label><input value={form.speciality} onChange={e=>set('speciality',e.target.value)} placeholder="Berber, Stilist..."/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Fillon</label><input type="time" value={form.start_time} onChange={e=>set('start_time',e.target.value)}/></div>
            <div className="fgp"><label>Mbaron</label><input type="time" value={form.end_time} onChange={e=>set('end_time',e.target.value)}/></div>
          </div>
          <div className="fg" style={{marginBottom:0}}>
            <div className="fgp">
              <label>Slot (minuta mes rezervimeve)</label>
              <select value={form.slot_minutes} onChange={e=>set('slot_minutes',e.target.value)}>
                {[15,20,30,45,60].map(m=><option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
          </div>
          <div style={{marginTop:14}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--g600)',display:'block',marginBottom:8}}>Ditët e Punës</label>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {DAYS.map(d=>(
                <button key={d} type="button" onClick={()=>toggleDay(d)} style={{padding:'6px 10px',borderRadius:8,border:`1.5px solid ${form.working_days.includes(d)?'var(--g900)':'var(--g200)'}`,background:form.working_days.includes(d)?'var(--g900)':'#fff',color:form.working_days.includes(d)?'#fff':'var(--g600)',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
                  {DAYS_AL[d]?.slice(0,3)}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── SERVICES MANAGEMENT ────────────────────────────────────
function ServicesPage({ gymId }) {
  const { data: services, loading, reload } = useAsync(() => getServices(gymId), [gymId])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name:'', description:'', duration_min:30, price:'', emoji:'✂️', category:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const EMOJIS = ['✂️','🪒','🎨','💆','💅','🧴','🧖','💇','🪄','⚡']
  const CATS   = ['haircut','beard','color','massage','facial','manicure','other']

  const save = async () => {
    if (!form.name||!form.price) { toast.error('Emri dhe çmimi janë të detyrueshme'); return }
    setSaving(true)
    try {
      const data = { gym_id:gymId, name:form.name, description:form.description||null, duration_min:Number(form.duration_min)||30, price:Number(form.price)||0, emoji:form.emoji, category:form.category||null, is_active:true }
      if (editing) { await supabase.from('services').update(data).eq('id',editing.id); toast.success('✅ U përditësua!') }
      else { await supabase.from('services').insert(data); toast.success('✅ Shërbimi u shtua!') }
      setShowAdd(false); setEditing(null); reload()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const startEdit = (s) => {
    setForm({ name:s.name, description:s.description||'', duration_min:s.duration_min, price:s.price, emoji:s.emoji||'✂️', category:s.category||'' })
    setEditing(s); setShowAdd(true)
  }

  const addDefaults = async () => {
    const defaults = [
      { gym_id:gymId, name:'Prerje Flokësh', emoji:'✂️', duration_min:30, price:800, category:'haircut', sort_order:1 },
      { gym_id:gymId, name:'Prerje + Mjekër', emoji:'🪒', duration_min:45, price:1200, category:'haircut', sort_order:2 },
      { gym_id:gymId, name:'Rregullim Mjekre', emoji:'🪒', duration_min:20, price:500, category:'beard', sort_order:3 },
      { gym_id:gymId, name:'Ngjyrosje', emoji:'🎨', duration_min:60, price:2000, category:'color', sort_order:4 },
      { gym_id:gymId, name:'Prerje Fëmijësh', emoji:'👶', duration_min:20, price:600, category:'haircut', sort_order:5 },
    ]
    await supabase.from('services').insert(defaults)
    toast.success('✅ Shërbimet default u shtuan!'); reload()
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Shërbimet</div><div className="ps">{(services||[]).length} shërbime</div></div>
        <div className="pa">
          {(services||[]).length===0&&<button className="btn btn-s" onClick={addDefaults}>+ Shërbime Default</button>}
          <button className="btn btn-p" onClick={()=>{setEditing(null);setForm({name:'',description:'',duration_min:30,price:'',emoji:'✂️',category:''});setShowAdd(true)}}>+ Shërbim i Ri</button>
        </div>
      </div>
      {loading?<Loading/>:(
        <div className="card">
          <div className="tw"><table>
            <thead><tr><th>Shërbimi</th><th>Kohëzgjatja</th><th>Çmimi</th><th>Kategoria</th><th>Statusi</th><th>Veprime</th></tr></thead>
            <tbody>
              {(services||[]).length===0?<tr><td colSpan={6}><Empty icon="✂️" title="Asnjë shërbim" sub="Shto shërbimin e parë ose kliko 'Shërbime Default'"/></td></tr>:
              (services||[]).map(s=>(
                <tr key={s.id}>
                  <td><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:20}}>{s.emoji}</span><div><div style={{fontWeight:500}}>{s.name}</div>{s.description&&<div style={{fontSize:11,color:'var(--g400)'}}>{s.description}</div>}</div></div></td>
                  <td><span className="bdg bdg-gy">⏱ {s.duration_min} min</span></td>
                  <td style={{fontWeight:700}}>{fmtNum(s.price)} L</td>
                  <td style={{color:'var(--g500)',fontSize:12}}>{s.category||'—'}</td>
                  <td>{s.is_active?<span className="bdg bdg-gr">Aktiv</span>:<span className="bdg bdg-rd">Joaktiv</span>}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-g btn-xs" onClick={()=>startEdit(s)}>✏️</button>
                      <button className={`btn btn-xs ${s.is_active?'btn-danger':'btn-success'}`} onClick={async()=>{await supabase.from('services').update({is_active:!s.is_active}).eq('id',s.id);reload()}}>{s.is_active?'⏸':'▶'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {showAdd&&(
        <Modal title={editing?'✏️ Edito Shërbimin':'✂️ Shërbim i Ri'} onClose={()=>{setShowAdd(false);setEditing(null)}} footer={
          <><button className="btn btn-s" onClick={()=>{setShowAdd(false);setEditing(null)}}>Anulo</button>
          <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'✅ Ruaj'}</button></>
        }>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:'var(--g600)',display:'block',marginBottom:8}}>Emoji</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {EMOJIS.map(e=>(
                <button key={e} type="button" onClick={()=>set('emoji',e)} style={{width:36,height:36,borderRadius:8,border:`2px solid ${form.emoji===e?'var(--g900)':'var(--g200)'}`,background:form.emoji===e?'var(--g900)':'#fff',fontSize:18,cursor:'pointer'}}>{e}</button>
              ))}
            </div>
          </div>
          <div className="fg"><div className="fgp"><label>Emri *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Prerje Flokësh"/></div></div>
          <div className="fg c2">
            <div className="fgp"><label>Kohëzgjatja (min) *</label><input type="number" value={form.duration_min} onChange={e=>set('duration_min',e.target.value)} min="5" max="240"/></div>
            <div className="fgp"><label>Çmimi (ALL) *</label><input type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="800"/></div>
          </div>
          <div className="fg"><div className="fgp"><label>Kategoria</label><select value={form.category} onChange={e=>set('category',e.target.value)}>
            <option value="">— Zgjidh —</option>
            {CATS.map(c=><option key={c} value={c}>{c}</option>)}
          </select></div></div>
          <div className="fg" style={{marginBottom:0}}><div className="fgp"><label>Përshkrimi</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Opsionale..."/></div></div>
        </Modal>
      )}
    </div>
  )
}

// ── LAYOUT ────────────────────────────────────────────────
const NAV = [
  {s:'Kryesore', items:[{id:'dashboard',l:'Dashboard',i:'📊'},{id:'new-appointment',l:'Rezervim i Ri',i:'➕'},{id:'appointments',l:'Të gjitha Rezervimet',i:'📅'}]},
  {s:'Menaxhim', items:[{id:'staff',l:'Stafi / Berberët',i:'👤'},{id:'services',l:'Shërbimet',i:'✂️'}]},
]
const TITLES = { dashboard:'Dashboard', 'new-appointment':'Rezervim i Ri', appointments:'Rezervimet', staff:'Stafi / Berberët', services:'Shërbimet' }

export default function BarbershopDashboard() {
  const { profile, gymId, logout } = useAuth()
  const [page,   setPage]   = useState('dashboard')
  const [sbOpen, setSbOpen] = useState(false)
  const nav = id => { setPage(id); setSbOpen(false) }
  const gymName  = profile?.gym?.name || 'Barbershop'
  const userName = profile?.data?.name || 'Admin'

  const PAGE = {
    dashboard:        <Dashboard gymId={gymId} setPage={nav}/>,
    'new-appointment':<NewAppointment gymId={gymId} onDone={()=>nav('appointments')}/>,
    appointments:     <Appointments gymId={gymId}/>,
    staff:            <StaffPage gymId={gymId}/>,
    services:         <ServicesPage gymId={gymId}/>,
  }

  return (
    <div className="app">
      <div className={`sbo ${sbOpen?'open':''}`} onClick={()=>setSbOpen(false)}/>
      <aside className={`sidebar ${sbOpen?'open':''}`}>
        <div className="sb-logo">
          <div className="sb-icon">💈</div>
          <div><div className="sb-name">{gymName}</div><div className="sb-sub">Vaqo Barbershop</div></div>
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
            <span className="bdg bdg-gy">💈 {gymName}</span>
            <button className="btn btn-p btn-sm" onClick={()=>nav('new-appointment')}>+ Rezervim</button>
          </div>
        </div>
        <div className="content">{PAGE[page]||<Dashboard gymId={gymId} setPage={nav}/>}</div>
      </main>
    </div>
  )
}
