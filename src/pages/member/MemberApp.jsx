import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { useAsync } from '../../hooks/useAsync'
import { supabase } from '../../lib/supabase'
import { fmtDate, fmtNum } from '../../lib/db'
import { Loading, Empty, Modal } from '../../components/UI'
import toast from 'react-hot-toast'

const GOALS = { lose_weight:'🏃 Humbje Peshe', build_muscle:'💪 Rritje Muskulature', stay_fit:'✨ Ruaj Formën', other:'🎯 Tjetër' }
const AVC   = ['#18181b','#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#be185d']

// ── DATA FUNCTIONS ────────────────────────────────────────
async function getMemberProfile(memberId) {
  const { data } = await supabase.from('members_with_status').select('*').eq('id', memberId).single()
  return data
}

async function getWorkoutPlans(memberId) {
  const { data } = await supabase.from('workout_plans')
    .select('*, trainer:gym_users(name), sessions:workout_sessions(*, exercises(*))')
    .eq('member_id', memberId).eq('is_active', true)
    .order('created_at', { ascending:false })
  return data ?? []
}

async function getWorkoutLogs(memberId) {
  const { data } = await supabase.from('workout_logs')
    .select('*, session:workout_sessions(title)')
    .eq('member_id', memberId)
    .order('logged_at', { ascending:false }).limit(30)
  return data ?? []
}

async function getCheckins(memberId) {
  const { data } = await supabase.from('check_ins')
    .select('*').eq('member_id', memberId)
    .order('checked_in_at', { ascending:false }).limit(30)
  return data ?? []
}

async function getDietOrders(memberId) {
  const { data } = await supabase.from('diet_orders')
    .select('*, diet_plan:diet_plans(*, nutritionist:nutritionists(name))')
    .eq('member_id', memberId).eq('status','paid')
  return data ?? []
}

async function getAvailableDiets() {
  const { data } = await supabase.from('diet_plans')
    .select('*, nutritionist:nutritionists(name,speciality,rating)')
    .eq('is_active', true).order('purchases', { ascending:false })
  return data ?? []
}

async function logWorkout(memberId, sessionId, duration, notes, rating) {
  const { error } = await supabase.from('workout_logs').insert({
    member_id: memberId, workout_session_id: sessionId,
    duration_minutes: duration, notes, rating,
    logged_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

// ── HOME ──────────────────────────────────────────────────
function Home({ member, setTab }) {
  const { data: plans }   = useAsync(() => getWorkoutPlans(member.id),  [member.id])
  const { data: checkins} = useAsync(() => getCheckins(member.id),      [member.id])
  const { data: logs }    = useAsync(() => getWorkoutLogs(member.id),   [member.id])

  const thisMonthCheckins = (checkins||[]).filter(c => {
    const d = new Date(c.checked_in_at)
    const now = new Date()
    return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear()
  }).length

  const thisWeekLogs = (logs||[]).filter(c => {
    const d = new Date(c.logged_at)
    const now = new Date()
    const weekAgo = new Date(now - 7*24*60*60*1000)
    return d >= weekAgo
  }).length

  const status = member.membership_status
  const daysLeft = member.days_remaining

  return (
    <div className="page-in">
      {/* Profile Card */}
      <div style={{background:'linear-gradient(135deg,#18181b 0%,#27272a 100%)',borderRadius:16,padding:24,marginBottom:16,color:'#fff'}}>
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:AVC[member.avatar_color||0],display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,flexShrink:0}}>
            {(member.full_name||'?').split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)}
          </div>
          <div>
            <div style={{fontFamily:'serif',fontSize:22,fontWeight:900,lineHeight:1}}>{member.full_name}</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginTop:4}}>
              {member.gym_id ? '🏋️ Anëtar i palestrës' : ''}
            </div>
          </div>
        </div>

        {/* Membership status */}
        <div style={{background:'rgba(255,255,255,.08)',borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',marginBottom:4}}>Abonomi aktual</div>
              <div style={{fontWeight:600,fontSize:15}}>{member.plan_name||'Pa abonim'}</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)',marginBottom:4}}>Ditë të mbetura</div>
              <div style={{fontFamily:'serif',fontSize:28,fontWeight:900,color:daysLeft<=7?'#fbbf24':daysLeft>0?'#4ade80':'#f87171',lineHeight:1}}>
                {daysLeft!=null&&daysLeft>=0?daysLeft:'—'}
              </div>
            </div>
          </div>
          {daysLeft!=null&&daysLeft<=7&&daysLeft>=0&&(
            <div style={{marginTop:10,background:'rgba(251,191,36,.15)',border:'1px solid rgba(251,191,36,.3)',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#fbbf24'}}>
              ⚠️ Abonimi skadon {daysLeft===0?'sot':daysLeft===1?'nesër':daysLeft+' ditë'} — Kontakto recepsionin
            </div>
          )}
          {(!daysLeft||daysLeft<0)&&(
            <div style={{marginTop:10,background:'rgba(248,113,113,.15)',border:'1px solid rgba(248,113,113,.3)',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#f87171'}}>
              ❌ Abonimi ka skaduar — Shko te recepsioni
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
          {[
            [thisMonthCheckins,'Hyrje/Muaj','🚪'],
            [thisWeekLogs,'Stërvitje/Javë','💪'],
            [(plans||[]).length,'Plane Aktive','📋'],
          ].map(([v,l,i])=>(
            <div key={l} style={{background:'rgba(255,255,255,.06)',borderRadius:10,padding:12,textAlign:'center'}}>
              <div style={{fontSize:18,marginBottom:4}}>{i}</div>
              <div style={{fontFamily:'serif',fontSize:24,fontWeight:900,lineHeight:1}}>{v}</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.4)',marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
        {[
          {ico:'💪',label:'Planet e Stërvitjes',tab:'workout',color:'#2563eb',bg:'#eff6ff'},
          {ico:'🥗',label:'Planet e Dietës',tab:'diet',color:'#16a34a',bg:'#f0fdf4'},
          {ico:'📊',label:'Statistikat',tab:'stats',color:'#d97706',bg:'#fffbeb'},
          {ico:'👤',label:'Profili Im',tab:'profile',color:'#7c3aed',bg:'#f5f3ff'},
        ].map(a=>(
          <button key={a.tab} onClick={()=>setTab(a.tab)}
            style={{background:a.bg,border:`1.5px solid ${a.color}20`,borderRadius:14,padding:'18px 16px',display:'flex',flexDirection:'column',alignItems:'flex-start',gap:8,cursor:'pointer',textAlign:'left',transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.08)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
            <span style={{fontSize:26}}>{a.ico}</span>
            <span style={{fontSize:13,fontWeight:600,color:a.color,lineHeight:1.3}}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* Recent workouts */}
      {(logs||[]).length > 0 && (
        <div className="card" style={{marginBottom:16}}>
          <div className="card-hd"><div className="card-t">💪 Stërvitjet e Fundit</div></div>
          <div>
            {(logs||[]).slice(0,4).map((l,i)=>(
              <div key={l.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom:i<Math.min((logs||[]).length,4)-1?'1px solid var(--g100)':'none'}}>
                <div>
                  <div style={{fontWeight:500,fontSize:13}}>{l.session?.title||'Stërvitje'}</div>
                  <div style={{fontSize:11,color:'var(--g400)',marginTop:2}}>{fmtDate(l.logged_at)}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  {l.duration_minutes&&<span style={{fontSize:12,color:'var(--g500)'}}>⏱ {l.duration_minutes} min</span>}
                  {l.rating&&<span style={{fontSize:12}}>{'⭐'.repeat(l.rating)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today motivational */}
      <div style={{background:'linear-gradient(135deg,#16a34a,#15803d)',borderRadius:14,padding:20,color:'#fff',textAlign:'center'}}>
        <div style={{fontSize:32,marginBottom:8}}>🔥</div>
        <div style={{fontFamily:'serif',fontSize:18,marginBottom:6}}>Vazhdo kështu!</div>
        <div style={{fontSize:13,color:'rgba(255,255,255,.7)'}}>
          {thisWeekLogs===0?'Fillo stërvitjen e parë të javës':
           thisWeekLogs===1?'1 stërvitje këtë javë — shto edhe 1!':
           `${thisWeekLogs} stërvitje këtë javë — vazhdoni!`}
        </div>
      </div>
    </div>
  )
}

// ── WORKOUT PLANS ─────────────────────────────────────────
function WorkoutPlans({ member }) {
  const { data: plans, loading, reload } = useAsync(() => getWorkoutPlans(member.id), [member.id])
  const [selected, setSelected] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)
  const [logModal, setLogModal] = useState(null)
  const [logForm, setLogForm] = useState({ duration:45, notes:'', rating:5 })
  const [logging, setLogging] = useState(false)

  const doLog = async () => {
    setLogging(true)
    try {
      await logWorkout(member.id, logModal.id, logForm.duration, logForm.notes, logForm.rating)
      toast.success('✅ Stërvitja u regjistrua!')
      setLogModal(null)
      reload()
    } catch(e) { toast.error(e.message) }
    finally { setLogging(false) }
  }

  if (loading) return <Loading/>

  // Plan detail view
  if (selected) {
    const plan = selected
    return (
      <div className="page-in">
        <button className="btn btn-g btn-sm" onClick={()=>{setSelected(null);setSelectedSession(null)}} style={{marginBottom:16}}>← Kthehu</button>

        <div className="card" style={{marginBottom:16}}>
          <div style={{padding:20,background:'linear-gradient(135deg,#18181b,#27272a)',borderRadius:'14px 14px 0 0',color:'#fff'}}>
            <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:4}}>Plan Stërvitjeje</div>
            <div style={{fontFamily:'serif',fontSize:22,marginBottom:6}}>{plan.title}</div>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>📅 {plan.duration_weeks} javë</span>
              <span style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>💪 {plan.days_per_week} ditë/javë</span>
              {plan.goal&&<span style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>🎯 {plan.goal}</span>}
              {plan.trainer&&<span style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>👤 {plan.trainer.name}</span>}
            </div>
          </div>
          {plan.description&&<div style={{padding:'14px 20px',fontSize:13,color:'var(--g600)',lineHeight:1.6}}>{plan.description}</div>}
        </div>

        {/* Sessions */}
        <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Seancat e Stërvitjes</div>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {(plan.sessions||[]).sort((a,b)=>a.sort_order-b.sort_order).map(session=>(
            <div key={session.id} className="card">
              <div style={{padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}
                onClick={()=>setSelectedSession(selectedSession?.id===session.id?null:session)}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'#18181b',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,flexShrink:0}}>
                    D{session.day_number}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>{session.title}</div>
                    <div style={{fontSize:12,color:'var(--g400)',marginTop:2}}>{(session.exercises||[]).length} ushtrime</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <button className="btn btn-p btn-sm" onClick={e=>{e.stopPropagation();setLogModal(session)}}
                    style={{fontSize:11}}>✅ Regjistro</button>
                  <span style={{fontSize:14,color:'var(--g400)',transform:selectedSession?.id===session.id?'rotate(180deg)':'none',transition:'transform .2s'}}>▾</span>
                </div>
              </div>

              {selectedSession?.id===session.id&&(
                <div style={{borderTop:'1px solid var(--g100)'}}>
                  {session.notes&&<div style={{padding:'10px 18px',background:'var(--g50)',fontSize:12,color:'var(--g600)',lineHeight:1.6}}>📝 {session.notes}</div>}
                  <div>
                    {(session.exercises||[]).sort((a,b)=>a.sort_order-b.sort_order).map((ex,i)=>(
                      <div key={ex.id} style={{display:'flex',gap:16,padding:'14px 18px',borderBottom:i<session.exercises.length-1?'1px solid var(--g100)':'none',alignItems:'flex-start'}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0,color:'var(--g600)'}}>{i+1}</div>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{ex.name}</div>
                          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                            <span className="bdg bdg-gy">💪 {ex.sets} sete</span>
                            <span className="bdg bdg-gy">🔄 {ex.reps} repeticions</span>
                            {ex.weight&&<span className="bdg bdg-bl">⚖️ {ex.weight}</span>}
                            {ex.rest_seconds&&<span className="bdg bdg-am">⏱ {ex.rest_seconds}s pushim</span>}
                          </div>
                          {ex.notes&&<div style={{fontSize:12,color:'var(--g500)',marginTop:6,lineHeight:1.5}}>💬 {ex.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {(plan.sessions||[]).length===0&&<Empty icon="📋" title="Nuk ka seanca ende" sub="Trajneri do të shtojë seancat së shpejti"/>}
        </div>
      </div>
    )
  }

  // Plans list
  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Planet e Stërvitjes</div><div className="ps">Planet e tua personale</div></div></div>

      {loading?<Loading/>:(plans||[]).length===0?(
        <div className="card" style={{padding:48,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:16}}>💪</div>
          <div style={{fontFamily:'var(--fs)',fontSize:20,marginBottom:8}}>Asnjë plan ende</div>
          <div style={{fontSize:14,color:'var(--g500)',lineHeight:1.7}}>
            Trajneri yt do të krijojë planin e stërvitjes.<br/>Kontakto recepsionin për të filluar.
          </div>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {(plans||[]).map(plan=>(
            <div key={plan.id} className="card" style={{cursor:'pointer',transition:'all .15s'}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shm)';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow='var(--sh)';e.currentTarget.style.transform='translateY(0)'}}>
              <div style={{padding:20}} onClick={()=>setSelected(plan)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{plan.title}</div>
                    <div style={{fontSize:12,color:'var(--g500)'}}>
                      {plan.trainer&&`👤 ${plan.trainer.name} · `}
                      📅 {plan.duration_weeks} javë · 💪 {plan.days_per_week} ditë/javë
                    </div>
                  </div>
                  <span className="bdg bdg-gr">Aktiv</span>
                </div>
                {plan.description&&<div style={{fontSize:13,color:'var(--g600)',lineHeight:1.6,marginBottom:12}}>{plan.description}</div>}
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <span className="bdg bdg-gy">📋 {(plan.sessions||[]).length} seanca</span>
                  <span className="bdg bdg-gy">🏋️ {(plan.sessions||[]).reduce((a,s)=>a+(s.exercises||[]).length,0)} ushtrime</span>
                  {plan.goal&&<span className="bdg bdg-bl">🎯 {plan.goal}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {logModal&&(
        <Modal title={`✅ Regjistro — ${logModal.title}`} onClose={()=>setLogModal(null)} footer={
          <><button className="btn btn-s" onClick={()=>setLogModal(null)}>Anulo</button>
          <button className="btn btn-p" onClick={doLog} disabled={logging}>{logging?'Duke ruajtur...':'✅ Regjistro'}</button></>
        }>
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div className="fgp">
              <label>⏱ Kohëzgjatja (minuta)</label>
              <input type="number" value={logForm.duration} min={5} max={180}
                onChange={e=>setLogForm(f=>({...f,duration:Number(e.target.value)}))}/>
            </div>
            <div className="fgp">
              <label>⭐ Vlerëso stërvitjen</label>
              <div style={{display:'flex',gap:8,marginTop:4}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setLogForm(f=>({...f,rating:n}))}
                    style={{fontSize:28,background:'none',border:'none',cursor:'pointer',opacity:n<=logForm.rating?1:.3,transition:'opacity .15s'}}>⭐</button>
                ))}
              </div>
            </div>
            <div className="fgp">
              <label>💬 Shënime (opsionale)</label>
              <textarea value={logForm.notes} onChange={e=>setLogForm(f=>({...f,notes:e.target.value}))}
                placeholder="Si u ndijeve? Çfarë arrite..."/>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── DIET ──────────────────────────────────────────────────
function Diet({ member }) {
  const { data: myDiets,   loading: ml } = useAsync(() => getDietOrders(member.id), [member.id])
  const { data: available, loading: al } = useAsync(getAvailableDiets)
  const [tab, setTab] = useState('my')
  const [showOrder, setShowOrder] = useState(null)
  const [ordering, setOrdering] = useState(false)
  const [orderForm, setOrderForm] = useState({ name: member.full_name||'', email: member.email||'', phone: member.phone||'' })

  const placeOrder = async () => {
    if (!orderForm.name||!orderForm.email) { toast.error('Plotëso emrin dhe emailin'); return }
    setOrdering(true)
    try {
      await supabase.from('diet_orders').insert({
        diet_plan_id: showOrder.id,
        nutritionist_id: showOrder.nutritionist_id,
        member_id: member.id,
        buyer_name: orderForm.name,
        buyer_email: orderForm.email,
        buyer_phone: orderForm.phone,
        amount: showOrder.price,
        nutritionist_amount: 0,
        platform_amount: 0,
        status: 'pending',
        payment_method: 'cash',
        access_until: new Date(Date.now() + showOrder.duration_weeks*7*24*60*60*1000).toISOString().split('T')[0],
      })
      toast.success('✅ Porosia u dërgua! Paguaj cash te recepsioni.')
      setShowOrder(null)
    } catch(e) { toast.error(e.message) }
    finally { setOrdering(false) }
  }

  const GOAL_LABELS = { lose_weight:'🏃 Humbje Peshe', build_muscle:'💪 Muskulaturë', stay_fit:'✨ Formë', medical:'🏥 Mjekësor', vegan:'🌱 Vegan', other:'🍽️ Tjetër' }

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Planet e Dietës</div><div className="ps">Nga dietologë profesionistë</div></div></div>

      <div style={{display:'flex',background:'#f4f4f5',borderRadius:12,padding:4,marginBottom:20,gap:4}}>
        {[['my','🥗 Dietat Mia'],['shop','🛒 Blej Dietë']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,padding:'10px 16px',borderRadius:9,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',transition:'all .2s',background:tab===k?'#fff':'transparent',color:tab===k?'#18181b':'#71717a',boxShadow:tab===k?'0 1px 4px rgba(0,0,0,.08)':'none'}}>{l}</button>
        ))}
      </div>

      {tab==='my'&&(
        ml?<Loading/>:(myDiets||[]).length===0?(
          <div className="card" style={{padding:48,textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>🥗</div>
            <div style={{fontFamily:'var(--fs)',fontSize:20,marginBottom:8}}>Asnjë dietë ende</div>
            <div style={{fontSize:14,color:'var(--g500)',marginBottom:20}}>Bli planin e parë të dietës nga dietologët tanë</div>
            <button className="btn btn-p" onClick={()=>setTab('shop')}>Shiko Dietat →</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {(myDiets||[]).map(order=>(
              <div key={order.id} className="card" style={{padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{order.diet_plan?.title}</div>
                    <div style={{fontSize:12,color:'var(--g500)'}}>👨‍⚕️ {order.diet_plan?.nutritionist?.name}</div>
                  </div>
                  <span className="bdg bdg-gr">✅ Aktive</span>
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:12}}>
                  <span className="bdg bdg-gy">📅 {order.diet_plan?.duration_weeks} javë</span>
                  {order.diet_plan?.calories_per_day&&<span className="bdg bdg-gr">🔥 {order.diet_plan.calories_per_day} kcal/ditë</span>}
                  <span className="bdg bdg-gy">🍽️ {order.diet_plan?.meals_per_day} vakte</span>
                </div>
                {order.access_until&&(
                  <div style={{background:'var(--g50)',borderRadius:8,padding:'10px 12px',fontSize:12,color:'var(--g600)'}}>
                    📅 Akses deri: <strong>{fmtDate(order.access_until)}</strong>
                  </div>
                )}
                {(order.diet_plan?.includes||[]).length>0&&(
                  <div style={{marginTop:12}}>
                    {(order.diet_plan.includes||[]).map((inc,i)=>(
                      <div key={i} style={{fontSize:12,color:'var(--g600)',display:'flex',gap:6,marginBottom:4}}>
                        <span style={{color:'var(--gr)'}}>✓</span>{inc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {tab==='shop'&&(
        al?<Loading/>:(available||[]).length===0?<Empty icon="🥗" title="Asnjë dietë disponibël"/>:(
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {(available||[]).map(diet=>(
              <div key={diet.id} className="card" style={{padding:20,cursor:'pointer',transition:'all .15s'}}
                onClick={()=>setShowOrder(diet)}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='var(--shm)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='var(--sh)';e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{diet.title}</div>
                    <div style={{fontSize:12,color:'var(--g500)'}}>👨‍⚕️ {diet.nutritionist?.name} · 🎯 {GOAL_LABELS[diet.goal]||diet.goal}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0,marginLeft:12}}>
                    <div style={{fontFamily:'var(--fs)',fontSize:22,fontWeight:900}}>{fmtNum(diet.price)}</div>
                    <div style={{fontSize:11,color:'var(--g400)'}}>ALL</div>
                  </div>
                </div>
                {diet.description&&<div style={{fontSize:13,color:'var(--g600)',lineHeight:1.6,marginBottom:10}}>{diet.description}</div>}
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:10}}>
                  <span className="bdg bdg-gy">📅 {diet.duration_weeks} javë</span>
                  {diet.calories_per_day&&<span className="bdg bdg-gr">🔥 {diet.calories_per_day} kcal</span>}
                  <span className="bdg bdg-gy">🍽️ {diet.meals_per_day} vakte</span>
                  <span className="bdg bdg-am">🛒 {diet.purchases||0} blerje</span>
                </div>
                {(diet.includes||[]).length>0&&(
                  <div style={{display:'flex',flexDirection:'column',gap:3}}>
                    {(diet.includes||[]).slice(0,3).map((inc,i)=>(
                      <div key={i} style={{fontSize:12,color:'var(--g600)',display:'flex',gap:6}}>
                        <span style={{color:'var(--gr)'}}>✓</span>{inc}
                      </div>
                    ))}
                  </div>
                )}
                <div style={{marginTop:12,padding:'10px 14px',background:'var(--g50)',borderRadius:8,fontSize:12,color:'var(--g500)'}}>
                  💵 Pagesa cash te recepsioni pas porosisë
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showOrder&&(
        <Modal title={`🥗 Porosit — ${showOrder.title}`} onClose={()=>setShowOrder(null)} footer={
          <><button className="btn btn-s" onClick={()=>setShowOrder(null)}>Anulo</button>
          <button className="btn btn-p" onClick={placeOrder} disabled={ordering}>{ordering?'Duke dërguar...':'📩 Porosit'}</button></>
        }>
          <div style={{background:'var(--g50)',borderRadius:10,padding:14,marginBottom:16,fontSize:13,lineHeight:1.8}}>
            <div><strong>{showOrder.title}</strong></div>
            <div style={{color:'var(--g500)'}}>👨‍⚕️ {showOrder.nutritionist?.name}</div>
            <div style={{fontWeight:700,color:'var(--g900)',marginTop:6,fontSize:16}}>{fmtNum(showOrder.price)} ALL</div>
          </div>
          <div className="alert al-bl" style={{marginBottom:16}}>💵 Pas porosisë, paguaj cash te recepsioni i palestrës.</div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <div className="fgp"><label>Emri *</label><input value={orderForm.name} onChange={e=>setOrderForm(f=>({...f,name:e.target.value}))}/></div>
            <div className="fgp"><label>Email *</label><input type="email" value={orderForm.email} onChange={e=>setOrderForm(f=>({...f,email:e.target.value}))}/></div>
            <div className="fgp"><label>Telefon</label><input value={orderForm.phone} onChange={e=>setOrderForm(f=>({...f,phone:e.target.value}))}/></div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── STATS ─────────────────────────────────────────────────
function Stats({ member }) {
  const { data: checkins, loading: cl } = useAsync(() => getCheckins(member.id), [member.id])
  const { data: logs,     loading: ll } = useAsync(() => getWorkoutLogs(member.id), [member.id])

  const MONTHS = ['Jan','Feb','Mar','Pri','Maj','Qer','Kor','Gus','Set','Tet','Nën','Dhj']
  const now = new Date()

  // Checkins per month (last 6 months)
  const ciByMonth = Array(6).fill(0).map((_,i) => {
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1)
    return {
      label: MONTHS[d.getMonth()],
      count: (checkins||[]).filter(c => {
        const cd = new Date(c.checked_in_at)
        return cd.getMonth()===d.getMonth() && cd.getFullYear()===d.getFullYear()
      }).length
    }
  })

  const maxCi = Math.max(...ciByMonth.map(m=>m.count), 1)
  const totalLogs = (logs||[]).length
  const avgRating = logs?.length ? Math.round((logs||[]).reduce((a,l)=>a+(l.rating||0),0) / logs.length * 10)/10 : 0
  const totalMinutes = (logs||[]).reduce((a,l)=>a+(l.duration_minutes||0),0)

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Statistikat</div><div className="ps">Historiku i aktivitetit tënd</div></div></div>

      <div className="sg" style={{gridTemplateColumns:'1fr 1fr'}}>
        {[
          ['🚪','Hyrje Total',(checkins||[]).length],
          ['💪','Stërvitje Total',totalLogs],
          [`⏱️`,'Orë Stërvitjeje',Math.round(totalMinutes/60)],
          ['⭐','Vlerësimi Mesatar',avgRating||'—'],
        ].map(([ico,label,val])=>(
          <div key={label} className="sc" style={{textAlign:'center'}}>
            <div className="si">{ico}</div>
            <div className="sl">{label}</div>
            <div className="sv">{val}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-hd"><div className="card-t">🚪 Hyrjet — 6 Muajt e Fundit</div></div>
        <div className="card-b">
          {cl?<Loading/>:(
            <div style={{display:'flex',alignItems:'flex-end',gap:10,height:120}}>
              {ciByMonth.map((m,i)=>(
                <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:5,height:'100%',justifyContent:'flex-end'}}>
                  {m.count>0&&<div style={{fontSize:11,color:'var(--g500)',fontWeight:600}}>{m.count}</div>}
                  <div style={{width:'100%',height:m.count>0?`${Math.round(m.count/maxCi*100)}%`:'4px',background:m.count>0?'#18181b':'var(--g200)',borderRadius:'4px 4px 0 0',minHeight:4,transition:'height .5s ease'}}/>
                  <div style={{fontSize:11,color:'var(--g400)'}}>{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent logs */}
      <div className="card">
        <div className="card-hd"><div className="card-t">💪 Stërvitjet e Fundit</div></div>
        {ll?<Loading/>:(logs||[]).length===0?<Empty icon="💪" title="Asnjë stërvitje e regjistruar"/>:(
          <div className="tw"><table>
            <thead><tr><th>Seanca</th><th>Data</th><th>Kohëzgjatja</th><th>Vlerësimi</th><th>Shënime</th></tr></thead>
            <tbody>
              {(logs||[]).map(l=>(
                <tr key={l.id}>
                  <td style={{fontWeight:500}}>{l.session?.title||'Stërvitje'}</td>
                  <td style={{fontSize:12,color:'var(--g500)'}}>{fmtDate(l.logged_at)}</td>
                  <td style={{color:'var(--g600)'}}>{l.duration_minutes?`${l.duration_minutes} min`:'—'}</td>
                  <td>{l.rating?'⭐'.repeat(l.rating):'—'}</td>
                  <td style={{fontSize:12,color:'var(--g500)',maxWidth:150}}>{l.notes||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  )
}

// ── PROFILE ───────────────────────────────────────────────
function Profile({ member, onUpdate }) {
  const [form, setForm] = useState({
    weight: member.weight||'', height: member.height||'',
    goal: member.goal||'stay_fit', phone: member.phone||'', email: member.email||''
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const bmi = form.weight && form.height
    ? Math.round(form.weight / Math.pow(form.height/100, 2) * 10) / 10
    : null
  const bmiLabel = !bmi?'—':bmi<18.5?'Nënpeshë':bmi<25?'Normal':bmi<30?'Mbipeshë':'Obezitet'
  const bmiColor = !bmi?'var(--g400)':bmi<18.5?'var(--ac)':bmi<25?'var(--gr)':bmi<30?'var(--am)':'var(--rd)'

  const save = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('members').update({
        weight: form.weight||null, height: form.height||null,
        goal: form.goal, phone: form.phone||null, email: form.email||null,
      }).eq('id', member.id)
      if (error) throw new Error(error.message)
      toast.success('✅ Profili u ruajt!')
      onUpdate()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Profili Im</div><div className="ps">Informacioni personal</div></div>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'💾 Ruaj'}</button>
      </div>

      {/* Avatar card */}
      <div style={{background:'linear-gradient(135deg,#18181b,#27272a)',borderRadius:16,padding:24,marginBottom:16,color:'#fff',display:'flex',alignItems:'center',gap:20}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:AVC[member.avatar_color||0],display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:700,flexShrink:0}}>
          {(member.full_name||'?').split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)}
        </div>
        <div>
          <div style={{fontFamily:'serif',fontSize:22,fontWeight:900,marginBottom:4}}>{member.full_name}</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,.5)'}}>
            {member.gender==='M'?'♂ Mashkull':member.gender==='F'?'♀ Femër':''}
            {member.birthday&&` · 🎂 ${fmtDate(member.birthday)}`}
          </div>
          <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginTop:4}}>Anëtar që nga {fmtDate(member.registered_at)}</div>
        </div>
      </div>

      {/* BMI Card */}
      {bmi&&(
        <div style={{background:'#fff',border:'1px solid var(--g200)',borderRadius:14,padding:20,marginBottom:16,display:'flex',alignItems:'center',gap:20,boxShadow:'var(--sh)'}}>
          <div style={{textAlign:'center',flex:1}}>
            <div style={{fontSize:11,color:'var(--g400)',marginBottom:4}}>BMI</div>
            <div style={{fontFamily:'var(--fs)',fontSize:40,fontWeight:900,color:bmiColor,lineHeight:1}}>{bmi}</div>
          </div>
          <div style={{width:1,height:60,background:'var(--g100)'}}/>
          <div style={{flex:2}}>
            <div style={{fontWeight:600,fontSize:16,color:bmiColor,marginBottom:4}}>{bmiLabel}</div>
            <div style={{fontSize:12,color:'var(--g500)',lineHeight:1.6}}>
              {bmi<18.5?'Ke nevojë për të fituar peshë':bmi<25?'Peshë e shëndetshme — vazhdoni kështu!':bmi<30?'Rekomandohet aktivitet fizik':'Konsultohuni me mjekun'}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-hd"><div className="card-t">📏 Të Dhënat Fizike</div></div>
        <div className="card-b">
          <div className="fg c2">
            <div className="fgp"><label>Pesha (kg)</label><input type="number" step="0.1" value={form.weight} onChange={e=>set('weight',e.target.value)} placeholder="70"/></div>
            <div className="fgp"><label>Gjatësia (cm)</label><input type="number" value={form.height} onChange={e=>set('height',e.target.value)} placeholder="175"/></div>
          </div>
          <div className="fg" style={{marginBottom:0}}>
            <div className="fgp">
              <label>🎯 Qëllimi</label>
              <select value={form.goal} onChange={e=>set('goal',e.target.value)}>
                {Object.entries(GOALS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><div className="card-t">📞 Kontakti</div></div>
        <div className="card-b">
          <div className="fg c2">
            <div className="fgp"><label>Telefon</label><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..."/></div>
            <div className="fgp"><label>Email</label><input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@..."/></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── LAYOUT ────────────────────────────────────────────────
const NAV = [
  {id:'home',    label:'Kryefaqja', icon:'🏠'},
  {id:'workout', label:'Stërvitje', icon:'💪'},
  {id:'diet',    label:'Dieta',     icon:'🥗'},
  {id:'stats',   label:'Statistika',icon:'📊'},
  {id:'profile', label:'Profili',   icon:'👤'},
]

export default function MemberApp() {
  const { profile, logout } = useAuth()
  const [tab, setTab] = useState('home')

  const memberId = profile?.data?.id
  const { data: member, loading, reload } = useAsync(() => getMemberProfile(memberId), [memberId])

  if (loading || !member) return <Loading/>

  const PAGE = {
    home:    <Home    member={member} setTab={setTab}/>,
    workout: <WorkoutPlans member={member}/>,
    diet:    <Diet    member={member}/>,
    stats:   <Stats   member={member}/>,
    profile: <Profile member={member} onUpdate={reload}/>,
  }

  return (
    <div style={{minHeight:'100vh',background:'var(--g50)',paddingBottom:80}}>
      {/* Top bar */}
      <div style={{background:'#fff',borderBottom:'1px solid var(--g200)',padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:50}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,borderRadius:7,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>💪</div>
          <div>
            <div style={{fontWeight:700,fontSize:14,lineHeight:1}}>FitPro</div>
            <div style={{fontSize:10,color:'var(--g400)'}}>App Anëtarësh</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-g btn-sm" style={{fontSize:12}}>Dil →</button>
      </div>

      {/* Content */}
      <div style={{maxWidth:600,margin:'0 auto',padding:'16px 14px'}}>
        {PAGE[tab]}
      </div>

      {/* Bottom nav */}
      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#fff',borderTop:'1px solid var(--g200)',display:'flex',zIndex:50,boxShadow:'0 -4px 12px rgba(0,0,0,.06)'}}>
        {NAV.map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)}
            style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'10px 4px',background:'none',border:'none',cursor:'pointer',gap:3,transition:'all .12s',color:tab===item.id?'#18181b':'#a1a1aa'}}>
            <span style={{fontSize:tab===item.id?22:20,transition:'font-size .12s'}}>{item.icon}</span>
            <span style={{fontSize:10,fontWeight:tab===item.id?700:400,fontFamily:'inherit'}}>{item.label}</span>
            {tab===item.id&&<div style={{width:16,height:2,background:'#18181b',borderRadius:1,marginTop:1}}/>}
          </button>
        ))}
      </div>
    </div>
  )
}
