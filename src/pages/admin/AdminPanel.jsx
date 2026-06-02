import { useState, useEffect } from 'react'
import AdminAnalytics from './AdminAnalytics'
import PushNotifButton from '../../components/PushNotifButton'
import { useAsync } from '../../hooks/useAsync'
import { supabase } from '../../lib/supabase'
import { fmtDate, fmtNum } from '../../lib/db'
import { Modal, Loading, Empty, StatCard } from '../../components/UI'
import toast from 'react-hot-toast'

async function getApplications() {
  const { data } = await supabase.from('applications').select('*').order('created_at',{ascending:false})
  return data??[]
}
async function getGyms() {
  const { data } = await supabase.from('gyms').select('*').order('created_at',{ascending:false})
  return data??[]
}
async function getNutritionistApps() {
  const { data } = await supabase.from('nutritionist_applications').select('*').order('created_at',{ascending:false})
  return data??[]
}
async function getNutritionists() {
  const { data } = await supabase.from('nutritionist_stats').select('*').order('total_earned',{ascending:false})
  return data??[]
}
async function getPlatformOverview() {
  const { data } = await supabase.from('platform_overview').select('*').single()
  return data
}
async function getDietOrders() {
  const { data } = await supabase.from('diet_orders')
    .select('*, nutritionist:nutritionists(name), diet_plan:diet_plans(title)')
    .order('created_at',{ascending:false}).limit(50)
  return data??[]
}

function GymAppRow({ app, onDone }) {
  const [show,setShow]=useState(false)
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [bizType,setBizType]=useState(app.business_type||'gym')

  const doApprove = async () => {
    if(!password.trim()){toast.error('Vendos fjalëkalimin');return}
    setLoading(true)
    try {
      // 1. Krijo Gym
      const{data:gym,error:gymErr}=await supabase.from('gyms').insert({
        name:app.name, email:app.email, phone:app.phone,
        address:app.address||null, city:app.city||null,
        status:'approved', business_type:bizType,
        approved_at:new Date().toISOString()
      }).select().single()
      if(gymErr) throw new Error('Gym error: '+gymErr.message)

      // 2. Krijo planet default
      await supabase.rpc('create_default_plans',{p_gym_id:gym.id}).catch(()=>{})

      // 3. Krijo Auth User duke përdorur Admin API nëpërmjet Edge Function
      const {data:authResp, error:authErr} = await supabase.functions.invoke('create-gym-user', {
        body: {
          email: app.email,
          password: password.trim(),
          gym_id: gym.id,
          owner_name: app.owner_name || app.name,
          role: 'owner'
        }
      })

      // Nëse edge function nuk ekziston, shto gym_user pa auth_id (admin e shton vetë)
      if(authErr || !authResp?.success) {
        console.warn('Edge function unavailable, creating gym_user without auth_id')
        await supabase.from('gym_users').insert({
          gym_id:gym.id, name:app.owner_name||app.name,
          email:app.email, role:'owner'
        })
        await supabase.from('applications').update({status:'approved',gym_id:gym.id}).eq('id',app.id)
        toast.success(
          `✅ ${app.name} u aprovua!`,
          {duration: 8000}
        )
        toast('⚠️ Krijo userin manualisht:\nSupabase → Authentication → Add User\nEmail: '+app.email+'\nPassword: '+password, {duration:12000, icon:'👆'})
      } else {
        await supabase.from('applications').update({status:'approved',gym_id:gym.id}).eq('id',app.id)
        toast.success(`✅ ${app.name} u aprovua! Useri u krijua automatikisht.`, {duration:6000})
      }

      setShow(false); onDone()
    } catch(e){toast.error('❌ '+e.message)}
    finally{setLoading(false)}
  }

  const sBadge={new:<span className="bdg bdg-bl">🆕 E Re</span>,contacted:<span className="bdg bdg-am">📞 Kontaktuar</span>,approved:<span className="bdg bdg-gr">✅ Aprovuar</span>,rejected:<span className="bdg bdg-rd">❌ Refuzuar</span>}

  return (
    <>
      <tr>
        <td><div><div className="mn">{app.name}</div><div className="ms">{app.city}</div></div></td>
        <td><div><div style={{fontWeight:500}}>{app.owner_name}</div><div className="ms">{app.email}</div><div className="ms">{app.phone}</div></div></td>
        <td>{sBadge[app.status]}</td>
        <td style={{fontSize:12,color:'var(--tx3)'}}>{fmtDate(app.created_at)}</td>
        <td>{(app.status==='new'||app.status==='contacted')&&<div style={{display:'flex',gap:6}}>
          <button className="btn btn-success btn-xs" onClick={()=>setShow(true)}>✅ Aprovo</button>
          <button className="btn btn-danger btn-xs" onClick={async()=>{await supabase.from('applications').update({status:'rejected'}).eq('id',app.id);toast.success('U refuzua');onDone()}}>❌</button>
        </div>}</td>
      </tr>
      {show&&<Modal title={`✅ Aprovo — ${app.name}`} onClose={()=>setShow(false)} footer={<><button className="btn btn-s" onClick={()=>setShow(false)}>Anulo</button><button className="btn btn-p" onClick={doApprove} disabled={loading}>{loading?'Duke aprovuar...':'✅ Aprovo'}</button></>}>
        <div className="alert al-bl" style={{marginBottom:14}}>Pas aprovimit shko: <strong>Supabase → Auth → Add User</strong></div>
        <div style={{background:'var(--surface2)',borderRadius:10,padding:14,marginBottom:14,fontSize:13,lineHeight:1.8}}>
          <div>🏋️ <strong>{app.name}</strong> · 👤 {app.owner_name}</div>
          <div>📧 {app.email} · 📞 {app.phone}</div>
          {app.message&&<div style={{marginTop:6,color:'var(--tx3)'}}>💬 {app.message}</div>}
        </div>
        <div className="fgp"><label>🔑 Fjalëkalimi për klientin *</label><input type="text" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Palestra2026!"/><span style={{fontSize:11,color:'var(--tx3)'}}>Do ia telefonosh klientit</span></div>
        <div className="fgp" style={{marginTop:12}}>
          <label>🏢 Lloji i Biznesit</label>
          <select value={bizType} onChange={e=>setBizType(e.target.value)} style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:8,padding:'8px 11px',fontFamily:'inherit',fontSize:13,width:'100%'}}>
            <option value="gym">🏋️ Palestre / Gym</option>
            <option value="barbershop">💈 Barbershop</option>
            <option value="salon">💅 Sallon Bukurie</option>
            <option value="spa">💆 Spa / Masazh</option>
            <option value="yoga">🧘 Yoga / Pilates</option>
            <option value="martial_arts">🥊 Arte Marciale</option>
            <option value="other">🏢 Tjetër</option>
          </select>
        </div>
      </Modal>}
    </>
  )
}

function NutrAppRow({ app, onDone }) {
  const [show,setShow]=useState(false)
  const [password,setPassword]=useState('')
  const [pct,setPct]=useState(70)
  const [loading,setLoading]=useState(false)

  const doApprove = async () => {
    if(!password.trim()){toast.error('Vendos fjalëkalimin');return}
    setLoading(true)
    try {
      const{data:nutr,error}=await supabase.from('nutritionists').insert({name:app.name,email:app.email,phone:app.phone,speciality:app.speciality,bio:app.bio,certificate:app.certificate,status:'approved',commission_pct:pct,approved_at:new Date().toISOString()}).select().single()
      if(error) throw new Error(error.message)
      await supabase.from('nutritionist_applications').update({status:'approved',nutritionist_id:nutr.id}).eq('id',app.id)
      toast.success(`✅ ${app.name} u aprovua si Dietolog!\nEmail: ${app.email} / Pass: ${password}`)
      setShow(false); onDone()
    } catch(e){toast.error(e.message)}
    finally{setLoading(false)}
  }

  return (
    <>
      <tr>
        <td><div><div className="mn">{app.name}</div><div className="ms">{app.speciality}</div></div></td>
        <td><div className="ms">{app.email}</div><div className="ms">{app.phone}</div></td>
        <td style={{fontSize:12,color:'var(--tx2)',maxWidth:180}}>{(app.experience||'—').slice(0,80)}</td>
        <td>{app.status==='new'?<span className="bdg bdg-bl">🆕 E Re</span>:app.status==='approved'?<span className="bdg bdg-gr">✅ Aprovuar</span>:<span className="bdg bdg-rd">❌ Refuzuar</span>}</td>
        <td style={{fontSize:12,color:'var(--tx3)'}}>{fmtDate(app.created_at)}</td>
        <td>{app.status==='new'&&<div style={{display:'flex',gap:6}}>
          <button className="btn btn-success btn-xs" onClick={()=>setShow(true)}>✅ Aprovo</button>
          <button className="btn btn-danger btn-xs" onClick={async()=>{await supabase.from('nutritionist_applications').update({status:'rejected'}).eq('id',app.id);toast.success('U refuzua');onDone()}}>❌</button>
        </div>}</td>
      </tr>
      {show&&<Modal title={`🥗 Aprovo Dietologun — ${app.name}`} onClose={()=>setShow(false)} footer={<><button className="btn btn-s" onClick={()=>setShow(false)}>Anulo</button><button className="btn btn-p" onClick={doApprove} disabled={loading}>{loading?'Duke aprovuar...':'✅ Aprovo'}</button></>}>
        <div style={{background:'var(--surface2)',borderRadius:10,padding:14,marginBottom:14,fontSize:13,lineHeight:1.8}}>
          <div>🥗 <strong>{app.name}</strong> · {app.speciality}</div>
          <div>📧 {app.email} · 📞 {app.phone}</div>
          {app.bio&&<div style={{marginTop:6,color:'var(--tx3)'}}>{app.bio}</div>}
        </div>
        <div className="fg c2">
          <div className="fgp"><label>💰 Komisioni Dietologut (%)</label><input type="number" value={pct} onChange={e=>setPct(Number(e.target.value))} min="50" max="90"/><span style={{fontSize:11,color:'var(--tx3)'}}>Ti merr {100-pct}%</span></div>
          <div className="fgp"><label>🔑 Fjalëkalimi *</label><input type="text" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Dieta2026!"/></div>
        </div>
        <div className="alert al-gr">💰 Dietologu {pct}% · Platforma {100-pct}%</div>
      </Modal>}
    </>
  )
}

function DemoRequestsTab() {
  const [demos, setDemos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const BIZ = {gym:'Palestre',yoga:'Yoga',pilates:'Pilates',martial_arts:'Arte Marciale',dance:'Vallëzim',fitness:'Fitness',barbershop:'Barbershop',salon:'Sallon',spa:'Spa',wellness:'Wellness',other:'Tjetër'}
  const ST_BG  = {new:'#fffbeb',contacted:'#eff6ff',done:'#f0fdf4',cancelled:'#fff1f3'}
  const ST_COL = {new:'#d97706',contacted:'#2563eb',done:'#16a34a',cancelled:'#e0344a'}
  const ST_LBL = {new:'E Re',contacted:'Kontaktuar',done:'Kryer',cancelled:'Anuluar'}

  useEffect(()=>{ load() },[])
  const load = async () => {
    setLoading(true)
    const {data} = await supabase.from('demo_requests').select('*').order('created_at',{ascending:false})
    setDemos(data||[])
    setLoading(false)
  }
  const updateStatus = async (id,status) => {
    await supabase.from('demo_requests').update({status}).eq('id',id)
    load()
  }

  const counts = {all:demos.length, new:demos.filter(d=>d.status==='new').length, contacted:demos.filter(d=>d.status==='contacted').length, done:demos.filter(d=>d.status==='done').length}
  const filtered = filter==='all' ? demos : demos.filter(d=>d.status===filter)

  return (
    <div className="page-in">
      <div className="ph">
        <div>
          <div className="pt">Demo Kërkesat</div>
          <div className="ps">{counts.new} të reja · {counts.contacted} kontaktuar · {counts.done} kryer</div>
        </div>
        <button className="btn btn-s btn-sm" onClick={load}>↻ Rifresko</button>
      </div>

      {/* Filter */}
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {[['all','Të gjitha',counts.all],['new','Të reja',counts.new],['contacted','Kontaktuar',counts.contacted],['done','Kryer',counts.done]].map(([v,l,c])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:'6px 14px',borderRadius:20,border:`1.5px solid ${filter===v?'#6c47ff':'var(--border)'}`,background:filter===v?'var(--pul)':'var(--surface)',color:filter===v?'var(--pu)':'var(--tx3)',fontSize:13,fontWeight:filter===v?700:500,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
            {l}{c>0?` (${c})`:''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ldg"><div className="spn"/>Duke ngarkuar...</div>
      ) : filtered.length===0 ? (
        <div className="card" style={{padding:52,textAlign:'center'}}>
          <div className="ei">📅</div>
          <div className="et">Asnjë kërkesë {filter!=='all'?ST_LBL[filter].toLowerCase():''}</div>
          <div className="es">Kërkesat e Book Demo shfaqen këtu automatikisht</div>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(d=>(
            <div key={d.id} className="card" style={{padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:14}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10,flexWrap:'wrap'}}>
                    <div style={{fontWeight:700,fontSize:15}}>{d.name}</div>
                    <span style={{fontSize:11,fontWeight:700,background:ST_BG[d.status],color:ST_COL[d.status],padding:'3px 10px',borderRadius:20}}>● {ST_LBL[d.status]}</span>
                  </div>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap',fontSize:13,color:'var(--tx3)',marginBottom:8}}>
                    <a href={`tel:${d.phone}`} style={{color:'var(--pu)',fontWeight:600,textDecoration:'none'}}>📞 {d.phone}</a>
                    {d.email&&<a href={`mailto:${d.email}`} style={{color:'var(--tx3)',textDecoration:'none'}}>✉️ {d.email}</a>}
                    <span>📍 {d.city}</span>
                    <span style={{fontWeight:500,color:'var(--tx2)'}}>{BIZ[d.biz_type]||d.biz_type}{d.biz_name&&` — ${d.biz_name}`}</span>
                  </div>
                  {d.preferred_hours?.length>0&&(
                    <div style={{fontSize:12,color:'var(--tx4)',marginBottom:6}}>
                      🕐 <strong style={{color:'var(--tx2)'}}>{d.preferred_hours.join(' · ')}</strong>
                    </div>
                  )}
                  {d.message&&<div style={{fontSize:13,color:'var(--tx2)',background:'var(--surface2)',borderRadius:8,padding:'8px 12px',marginTop:6,borderLeft:'3px solid var(--border)'}}>{d.message}</div>}
                  <div style={{fontSize:11,color:'var(--tx4)',marginTop:8}}>
                    {new Date(d.created_at).toLocaleString('sq-AL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}
                  </div>
                </div>
                <div style={{display:'flex',gap:7,flexWrap:'wrap',alignItems:'flex-start',flexShrink:0}}>
                  <a href={`tel:${d.phone}`} className="btn btn-p btn-sm">📞 Telefono</a>
                  {d.status==='new'&&<button className="btn btn-sm" onClick={()=>updateStatus(d.id,'contacted')} style={{background:'var(--bll)',color:'var(--bl)',border:'1px solid #bfdbfe'}}>✓ Kontaktuar</button>}
                  {d.status==='contacted'&&<button className="btn btn-success btn-sm" onClick={()=>updateStatus(d.id,'done')}>✓ Kryer</button>}
                  {!['cancelled','done'].includes(d.status)&&<button className="btn btn-danger btn-sm" onClick={()=>updateStatus(d.id,'cancelled')}>✕</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


function AffiliateAdminTab() {
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const fmt  = n => (n||0).toLocaleString('sq-AL')
  const fmtL = n => `${fmt(n)} L`

  useEffect(()=>{ loadData() },[])

  const loadData = async () => {
    setLoading(true)
    const [{ data:pend },{ data:hist }] = await Promise.all([
      supabase.from('affiliate_payments').select('*,referrer:referrer_gym_id(name,phone),referred:referred_gym_id(name)').eq('status','pending').order('created_at',{ascending:false}),
      supabase.from('affiliate_payments').select('*,referrer:referrer_gym_id(name),referred:referred_gym_id(name)').eq('status','paid').order('paid_at',{ascending:false}).limit(50),
    ])
    setPending(pend||[])
    setHistory(hist||[])
    setLoading(false)
  }

  const markPaid = async (id) => {
    await supabase.from('affiliate_payments').update({ status:'paid', paid_at: new Date().toISOString() }).eq('id',id)
    toast.success('✅ Pagesa u shënua si e kryer')
    loadData()
  }

  const totalPending = pending.reduce((s,p)=>s+(p.commission_amt||0),0)

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">🤝 Affiliate — Komisione & Pagesat</div><div className="ps">{pending.length} pagesa pritje · {fmtL(totalPending)}</div></div>
        <button className="btn btn-s btn-sm" onClick={loadData}>↻</button>
      </div>

      {loading ? <div style={{padding:40,textAlign:'center',color:'var(--tx4)'}}>Duke ngarkuar...</div> : (
        <>
          {/* Pending payments */}
          {pending.length>0&&(
            <div className="card" style={{marginBottom:16}}>
              <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:14,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span>⏳ Komisione Pritje Pagese ({pending.length})</span>
                <span style={{fontSize:13,color:'var(--am)',fontWeight:700}}>{fmtL(totalPending)} total</span>
              </div>
              {pending.map(p=>(
                <div key={p.id} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 20px',borderBottom:'1px solid var(--surface2)',flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:200}}>
                    <div style={{fontWeight:700,fontSize:14}}>{p.referrer?.name||'—'}</div>
                    <div style={{fontSize:12,color:'var(--tx3)',marginTop:2}}>
                      Referoi: {p.referred?.name||'—'} · {p.month} · {p.commission_pct||10}%
                    </div>
                    {p.referrer?.phone&&<a href={`tel:${p.referrer.phone}`} style={{fontSize:12,color:'var(--pu)',textDecoration:'none',marginTop:2,display:'block'}}>📞 {p.referrer.phone}</a>}
                  </div>
                  <div style={{fontFamily:"'Georgia',serif",fontSize:28,fontWeight:900,color:'var(--am)'}}>{fmtL(p.commission_amt)}</div>
                  <button className="btn btn-success btn-sm" onClick={()=>markPaid(p.id)}>✅ Shëno si Paguar</button>
                </div>
              ))}
            </div>
          )}

          {pending.length===0&&(
            <div className="card" style={{padding:40,textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:40,marginBottom:10}}>✅</div>
              <div style={{fontFamily:"'Georgia',serif",fontSize:18,fontWeight:700}}>Asnjë komision pritje</div>
              <div style={{fontSize:14,color:'var(--tx3)',marginTop:6}}>Të gjitha pagesat janë kryer.</div>
            </div>
          )}

          {/* History */}
          {history.length>0&&(
            <div className="card">
              <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',fontWeight:700,fontSize:14}}>📋 Historia e Pagesave</div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{borderBottom:'2px solid var(--border)'}}>
                    {['Referuesi','Biznesi','Muaji','Komisioni','Paguar'].map(h=>(
                      <th key={h} style={{padding:'8px 16px',textAlign:'left',color:'var(--tx3)',fontWeight:600}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {history.map(p=>(
                      <tr key={p.id} style={{borderBottom:'1px solid var(--surface2)'}}>
                        <td style={{padding:'10px 16px',fontWeight:600}}>{p.referrer?.name||'—'}</td>
                        <td style={{padding:'10px 16px',color:'var(--tx2)'}}>{p.referred?.name||'—'}</td>
                        <td style={{padding:'10px 16px',color:'var(--tx2)'}}>{p.month}</td>
                        <td style={{padding:'10px 16px',fontWeight:700,color:'var(--gr)'}}>{fmtL(p.commission_amt)}</td>
                        <td style={{padding:'10px 16px',fontSize:11,color:'var(--tx3)'}}>{p.paid_at?new Date(p.paid_at).toLocaleDateString('sq-AL'):'-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function AdminPanel({ logout }) {
  const [tab,setTab]=useState('overview')
  const [sbOpen,setSbOpen]=useState(false)
  const {data:overview,reload:ro}=useAsync(getPlatformOverview)
  const {data:gymApps,loading:gal,reload:rga}=useAsync(getApplications)
  const {data:nutrApps,loading:nal,reload:rna}=useAsync(getNutritionistApps)
  const {data:gyms,loading:gl,reload:rg}=useAsync(getGyms)
  const {data:nutritionists,loading:nl,reload:rn}=useAsync(getNutritionists)
  const {data:dietOrders,loading:dol}=useAsync(getDietOrders)
  const newGymApps=(gymApps||[]).filter(a=>a.status==='new').length
  const newNutrApps=(nutrApps||[]).filter(a=>a.status==='new').length
  const reloadAll=()=>{ro();rga();rna();rg();rn()}

  const NAV_ITEMS=[
    {s:'Platforma',items:[{id:'overview',l:'Overview',i:'📊'},{id:'platform_analytics',l:'Analytics Avancuar',i:'📈'},{id:'revenue',l:'Të Ardhurat',i:'💰'}]},
    {s:'Palestra',items:[{id:'gym_apps',l:'Aplikimet Palestra',i:'🏋️',badge:newGymApps},{id:'gyms',l:'Palestrat',i:'🏠'}]},
    {s:'Dietologë',items:[{id:'nutr_apps',l:'Aplikimet Dietolog',i:'🥗',badge:newNutrApps},{id:'nutritionists',l:'Dietologët',i:'👨‍⚕️'},{id:'diet_orders',l:'Porosi Dietash',i:'🛒'}]},
    {s:'Affiliate',items:[{id:'affiliate_admin',l:'Komisione & Pagesat',i:'🤝',badge:0}]},
    {s:'Demo Requests',items:[{id:'demos',l:'Book Demo Kërkesat',i:'📅',badge:0}]},
    {s:'Sistem',items:[{id:'guide',l:'Udhëzues',i:'📖'}]},
  ]

  const TITLE_MAP={overview:'📊 Overview',platform_analytics:'📈 Analytics Avancuar',affiliate_admin:'🤝 Affiliate — Komisione',revenue:'💰 Të Ardhurat',gym_apps:'🏋️ Aplikimet Palestra',gyms:'🏠 Palestrat',nutr_apps:'🥗 Aplikimet Dietolog',nutritionists:'👨‍⚕️ Dietologët',diet_orders:'🛒 Porosi Dietash',demos:'📅 Demo Kërkesat',guide:'📖 Udhëzues'}

  return (
    <div className="app">
      <div className={`sbo ${sbOpen?'open':''}`} onClick={()=>setSbOpen(false)}/>
      <aside className={`sidebar ${sbOpen?'open':''}`}>
        <div className="sb-logo"><div className="sb-icon">⚡</div><div><div className="sb-name">Vaqo Admin</div><div className="sb-sub">Platform Panel</div></div></div>
        <nav className="nav">
          {NAV_ITEMS.map(s=>(
            <div key={s.s} className="nav-sec">
              <div className="nav-lbl">{s.s}</div>
              {s.items.map(item=>(
                <div key={item.id} className={`nav-item ${tab===item.id?'active':''}`} onClick={()=>{setTab(item.id);setSbOpen(false)}}>
                  <span className="nav-ico">{item.i}</span>{item.l}
                  {item.badge>0&&<span className="nav-bdg">{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-bot"><div className="user-card" onClick={logout}><div className="user-av">⚡</div><div><div className="user-nm">Platform Admin</div><div className="user-rl">Dil →</div></div></div></div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="tbl">
            <button className="hmbg" style={{display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSbOpen(s=>!s)}>☰</button>
            <div className="tb-title">{TITLE_MAP[tab]}</div>
          </div>
          <div className="tbr"><PushNotifButton gymId="admin"/><button className="btn btn-s btn-sm" onClick={reloadAll}>↻</button><span className="bdg bdg-pu">⚡ Admin</span></div>
        </div>

        <div className="content">

          {tab==='overview'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Platform Overview</div><div className="ps">Statistikat e gjithë ekosistemit</div></div></div>
              {(newGymApps+newNutrApps)>0&&<div className="alert al-am">⚠️ Ke <strong>{newGymApps+newNutrApps} aplikime të reja</strong> që presin!</div>}
              <div className="sg">
                <StatCard icon="🏋️" label="Palestra Aktive"    value={overview?.active_gyms??0}              change="aprovuar" up/>
                <StatCard icon="👥" label="Total Anëtarë"       value={overview?.total_members??0}            change="të gjitha" up/>
                <StatCard icon="🥗" label="Dietologë Aktivë"    value={overview?.active_nutritionists??0}     change="aprovuar" up/>
                <StatCard icon="💰" label="Gym Revenue/Muaj"    value={fmtNum(overview?.gym_revenue_month??0)+' L'} change="ky muaj" up/>
                <StatCard icon="🛒" label="Porosi Dieta"        value={overview?.total_diet_orders??0}        change="total" up/>
                <StatCard icon="📋" label="Aplikime të Reja"    value={(newGymApps+newNutrApps)}/>
              </div>
              <div className="g2">
                <div className="card" style={{padding:24}}>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,marginBottom:16}}>💰 Të Ardhurat e Platformës</div>
                  {[['🏋️ Abonime Palestrave (muaj)',fmtNum(overview?.gym_revenue_month??0)+' L'],['🥗 Komisioni Dieta (30%)',fmtNum(overview?.diet_revenue??0)+' L'],['📦 Komisioni Produkte (30%)',fmtNum(overview?.product_revenue??0)+' L']].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                      <span style={{fontSize:13,color:'var(--tx2)'}}>{l}</span><span style={{fontWeight:700,color:'var(--gr)'}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="card" style={{padding:24}}>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,marginBottom:16}}>📋 Aplikime të Reja</div>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:14,background:'var(--bll)',borderRadius:10,border:'1px solid #bfdbfe'}}>
                      <div><div style={{fontWeight:600}}>🏋️ Palestra</div><div style={{fontSize:12,color:'var(--bl)'}}>{newGymApps} aplikime</div></div>
                      <button className="btn btn-p btn-sm" onClick={()=>setTab('gym_apps')}>Shiko →</button>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:14,background:'var(--grl)',borderRadius:10,border:'1px solid #bbf7d0'}}>
                      <div><div style={{fontWeight:600}}>🥗 Dietologë</div><div style={{fontSize:12,color:'var(--gr)'}}>{newNutrApps} aplikime</div></div>
                      <button className="btn btn-p btn-sm" onClick={()=>setTab('nutr_apps')}>Shiko →</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab==='revenue'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Të Ardhurat</div></div></div>
              <div className="sg">
                <StatCard icon="💰" label="Gym Revenue Muaj" value={fmtNum(overview?.gym_revenue_month??0)+' L'} change="ky muaj" up/>
                <StatCard icon="🥗" label="Diet Komisioni"   value={fmtNum(overview?.diet_revenue??0)+' L'}      change="total" up/>
                <StatCard icon="📦" label="Shop Komisioni"   value={fmtNum(overview?.product_revenue??0)+' L'}   change="total" up/>
              </div>
              <div className="card">
                <div className="card-hd"><div className="card-t">📊 Porositë e Fundit — Dieta</div></div>
                {dol?<Loading/>:(
                  <div className="tw"><table>
                    <thead><tr><th>#</th><th>Klienti</th><th>Dietologu</th><th>Plani</th><th>Totali</th><th>Platforma</th><th>Data</th><th>Statusi</th></tr></thead>
                    <tbody>
                      {(dietOrders||[]).length===0?<tr><td colSpan={8}><Empty icon="🛒" title="Asnjë porosi"/></td></tr>:
                      (dietOrders||[]).map(o=>(
                        <tr key={o.id}>
                          <td style={{fontFamily:'monospace',fontSize:11,color:'var(--tx4)'}}>{o.invoice_number}</td>
                          <td style={{fontWeight:500}}>{o.buyer_name}</td>
                          <td><span className="bdg bdg-gr">{o.nutritionist?.name||'—'}</span></td>
                          <td style={{fontSize:12}}>{o.diet_plan?.title||'—'}</td>
                          <td style={{fontWeight:600}}>{fmtNum(o.amount)} L</td>
                          <td style={{fontWeight:700,color:'var(--bl)'}}>{fmtNum(o.platform_amount)} L</td>
                          <td style={{fontSize:12,color:'var(--tx3)'}}>{fmtDate(o.created_at)}</td>
                          <td>{o.status==='paid'?<span className="bdg bdg-gr">✅ Paguar</span>:
                            <button className="btn btn-success btn-xs" onClick={async()=>{await supabase.from('diet_orders').update({status:'paid',paid_at:new Date().toISOString()}).eq('id',o.id);toast.success('✅ U konfirmua!');ro()}}>💰 Konfirmo</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {tab==='gym_apps'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Aplikimet Palestra</div><div className="ps">{newGymApps} të reja</div></div></div>
              {newGymApps>0&&<div className="alert al-am">⚠️ Ke {newGymApps} aplikim të ri palestre!</div>}
              {gal?<Loading/>:(
                <div className="card"><div className="tw"><table>
                  <thead><tr><th>Palestra</th><th>Pronari</th><th>Statusi</th><th>Data</th><th>Veprime</th></tr></thead>
                  <tbody>{(gymApps||[]).length===0?<tr><td colSpan={5}><Empty icon="🏋️" title="Asnjë aplikim"/></td></tr>:
                  (gymApps||[]).map(app=><GymAppRow key={app.id} app={app} onDone={reloadAll}/>)}</tbody>
                </table></div></div>
              )}
            </div>
          )}

          {tab==='gyms'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Palestrat</div><div className="ps">{(gyms||[]).length} total</div></div></div>
              {gl?<Loading/>:(
                <div className="card"><div className="tw"><table>
                  <thead><tr><th>Palestra</th><th>Email</th><th>Qyteti</th><th>Statusi</th><th>Krijuar</th><th>Veprime</th></tr></thead>
                  <tbody>{(gyms||[]).length===0?<tr><td colSpan={6}><Empty icon="🏋️" title="Asnjë palestre"/></td></tr>:
                  (gyms||[]).map(gym=>(
                    <tr key={gym.id}>
                      <td><div className="mn">{gym.name}</div></td>
                      <td style={{fontSize:12,color:'var(--tx3)'}}>{gym.email}</td>
                      <td style={{color:'var(--tx3)'}}>{gym.city||'—'}</td>
                      <td>{gym.status==='approved'?<span className="bdg bdg-gr">✅ Aktive</span>:gym.status==='suspended'?<span className="bdg bdg-rd">⏸ Suspenduar</span>:<span className="bdg bdg-am">⏳ Pending</span>}</td>
                      <td style={{fontSize:12,color:'var(--tx3)'}}>{fmtDate(gym.created_at)}</td>
                      <td>{gym.status==='approved'?<button className="btn btn-danger btn-xs" onClick={async()=>{await supabase.from('gyms').update({status:'suspended'}).eq('id',gym.id);toast.success('U suspendua');rg()}}>⏸</button>:
                      gym.status==='suspended'?<button className="btn btn-success btn-xs" onClick={async()=>{await supabase.from('gyms').update({status:'approved'}).eq('id',gym.id);toast.success('U aktivizua');rg()}}>▶</button>:null}</td>
                    </tr>
                  ))}</tbody>
                </table></div></div>
              )}
            </div>
          )}

          {tab==='nutr_apps'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Aplikimet Dietologë</div><div className="ps">{newNutrApps} të reja</div></div></div>
              {newNutrApps>0&&<div className="alert al-am">⚠️ Ke {newNutrApps} aplikim të ri dietologu!</div>}
              {nal?<Loading/>:(
                <div className="card"><div className="tw"><table>
                  <thead><tr><th>Dietologu</th><th>Kontakti</th><th>Eksperienca</th><th>Statusi</th><th>Data</th><th>Veprime</th></tr></thead>
                  <tbody>{(nutrApps||[]).length===0?<tr><td colSpan={6}><Empty icon="🥗" title="Asnjë aplikim"/></td></tr>:
                  (nutrApps||[]).map(app=><NutrAppRow key={app.id} app={app} onDone={reloadAll}/>)}</tbody>
                </table></div></div>
              )}
            </div>
          )}

          {tab==='nutritionists'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Dietologët Aktivë</div></div></div>
              {nl?<Loading/>:(
                <div className="card"><div className="tw"><table>
                  <thead><tr><th>Dietologu</th><th>Specializimi</th><th>Planet</th><th>Porosi</th><th>Fituan</th><th>Platforma</th><th>Komisioni</th><th>Statusi</th><th></th></tr></thead>
                  <tbody>{(nutritionists||[]).length===0?<tr><td colSpan={9}><Empty icon="🥗" title="Asnjë dietolog"/></td></tr>:
                  (nutritionists||[]).map(n=>(
                    <tr key={n.id}>
                      <td><div><div className="mn">{n.name}</div><div className="ms">{n.email}</div></div></td>
                      <td style={{fontSize:12}}>{n.speciality||'—'}</td>
                      <td style={{textAlign:'center',fontWeight:600}}>{n.total_plans||0}</td>
                      <td style={{textAlign:'center',fontWeight:600}}>{n.total_orders||0}</td>
                      <td style={{fontWeight:700,color:'var(--gr)'}}>{fmtNum(n.total_earned||0)} L</td>
                      <td style={{fontWeight:700,color:'var(--bl)'}}>{fmtNum(n.platform_earned||0)} L</td>
                      <td><span className="bdg bdg-bl">{n.commission_pct||70}% / {100-(n.commission_pct||70)}%</span></td>
                      <td>{n.status==='approved'?<span className="bdg bdg-gr">✅</span>:<span className="bdg bdg-rd">❌</span>}</td>
                      <td>{n.status==='approved'?<button className="btn btn-danger btn-xs" onClick={async()=>{await supabase.from('nutritionists').update({status:'suspended'}).eq('id',n.id);toast.success('U suspendua');rn()}}>⏸</button>:<button className="btn btn-success btn-xs" onClick={async()=>{await supabase.from('nutritionists').update({status:'approved'}).eq('id',n.id);toast.success('U aktivizua');rn()}}>▶</button>}</td>
                    </tr>
                  ))}</tbody>
                </table></div></div>
              )}
            </div>
          )}

          {tab==='diet_orders'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Porosi Dietash</div></div></div>
              {dol?<Loading/>:(
                <div className="card"><div className="tw"><table>
                  <thead><tr><th>#</th><th>Klienti</th><th>Dietologu</th><th>Plani</th><th>Totali</th><th>Dietologu</th><th>Platforma</th><th>Data</th><th>Statusi</th></tr></thead>
                  <tbody>{(dietOrders||[]).length===0?<tr><td colSpan={9}><Empty icon="🛒" title="Asnjë porosi"/></td></tr>:
                  (dietOrders||[]).map(o=>(
                    <tr key={o.id}>
                      <td style={{fontFamily:'monospace',fontSize:11,color:'var(--tx4)'}}>{o.invoice_number}</td>
                      <td><div style={{fontWeight:500}}>{o.buyer_name}</div><div className="ms">{o.buyer_email}</div></td>
                      <td><span className="bdg bdg-gr">{o.nutritionist?.name||'—'}</span></td>
                      <td style={{fontSize:12}}>{o.diet_plan?.title||'—'}</td>
                      <td style={{fontWeight:600}}>{fmtNum(o.amount)} L</td>
                      <td style={{color:'var(--gr)',fontWeight:600}}>{fmtNum(o.nutritionist_amount)} L</td>
                      <td style={{color:'var(--bl)',fontWeight:600}}>{fmtNum(o.platform_amount)} L</td>
                      <td style={{fontSize:12,color:'var(--tx3)'}}>{fmtDate(o.created_at)}</td>
                      <td>{o.status==='paid'?<span className="bdg bdg-gr">✅ Paguar</span>:<button className="btn btn-success btn-xs" onClick={async()=>{await supabase.from('diet_orders').update({status:'paid',paid_at:new Date().toISOString()}).eq('id',o.id);toast.success('✅');ro()}}>💰</button>}</td>
                    </tr>
                  ))}</tbody>
                </table></div></div>
              )}
            </div>
          )}

          {tab==='demos'&&(
            <DemoRequestsTab/>
          )}

          {tab==='affiliate_admin'&&(
            <AffiliateAdminTab/>
          )}

          {tab==='platform_analytics'&&(
            <AdminAnalytics/>
          )}

          {tab==='guide'&&(
            <div className="page-in">
              <div className="ph"><div><div className="pt">Udhëzues Admin</div></div></div>
              <div className="g2">
                <div className="card" style={{padding:24}}>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,marginBottom:16}}>🏋️ Si Aprovoj Palestre</div>
                  {[['1','Palestra aplikon nga / (faqja kryesore)'],['2','Shfaqet te "Aplikimet Palestra" me status E Re'],['3','Telefono, merr pagesën cash'],['4','Kliko Aprovo → vendos fjalëkalimin'],['5','Supabase → Auth → Add User → email + fjalëkalim'],['6','Telefono klientin me kredencialet']].map(([n,t])=>(
                    <div key={n} style={{display:'flex',gap:12,marginBottom:10}}>
                      <div style={{width:24,height:24,borderRadius:'50%',background:'var(--tx)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{n}</div>
                      <div style={{fontSize:13,color:'var(--tx2)',paddingTop:3}}>{t}</div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{padding:24}}>
                  <div style={{fontFamily:'Georgia,serif',fontSize:18,marginBottom:16}}>🥗 Si Aprovoj Dietolog</div>
                  {[['1','Dietologu aplikon nga /nutritionist/apply'],['2','Shfaqet te "Aplikimet Dietolog"'],['3','Kontrollo CV dhe çertifikatat'],['4','Vendos komisionin (default 70/30)'],['5','Kliko Aprovo → vendos fjalëkalimin'],['6','Supabase → Auth → Add User → email + fjalëkalim'],['7','Dietologu hyn dhe shton dieta']].map(([n,t])=>(
                    <div key={n} style={{display:'flex',gap:12,marginBottom:10}}>
                      <div style={{width:24,height:24,borderRadius:'50%',background:'var(--gr)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{n}</div>
                      <div style={{fontSize:13,color:'var(--tx2)',paddingTop:3}}>{t}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
