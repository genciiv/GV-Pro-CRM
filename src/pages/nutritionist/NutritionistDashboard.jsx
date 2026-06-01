import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import { useAsync } from '../../hooks/useAsync'
import { supabase } from '../../lib/supabase'
import { fmtNum, fmtDate } from '../../lib/db'
import { StatCard, Modal, Loading, Empty } from '../../components/UI'
import toast from 'react-hot-toast'

const GOALS = { lose_weight:'🏃 Humbje Peshe', build_muscle:'💪 Muskulaturë', stay_fit:'✨ Formë', medical:'🏥 Mjekësor', vegan:'🌱 Vegan', other:'🍽️ Tjetër' }

async function getMyProfile(nutritionistId) {
  const { data } = await supabase.from('nutritionist_stats').select('*').eq('id', nutritionistId).single()
  return data
}

async function getMyPlans(nutritionistId) {
  const { data } = await supabase.from('diet_plans').select('*').eq('nutritionist_id', nutritionistId).order('created_at', { ascending:false })
  return data ?? []
}

async function getMyOrders(nutritionistId) {
  const { data } = await supabase.from('diet_orders')
    .select('*, diet_plan:diet_plans(title,price)')
    .eq('nutritionist_id', nutritionistId)
    .order('created_at', { ascending:false })
  return data ?? []
}

// ── PLANS PAGE ────────────────────────────────────────────
function MyPlans({ nutritionistId }) {
  const { data: plans, loading, reload } = useAsync(() => getMyPlans(nutritionistId), [nutritionistId])
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title:'', description:'', goal:'lose_weight', duration_weeks:4, price:'', calories_per_day:'', meals_per_day:3, includes:'' })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    if (!form.title||!form.price) { toast.error('Titulli dhe çmimi janë të detyrueshme'); return }
    setSaving(true)
    try {
      const data = {
        nutritionist_id: nutritionistId,
        title: form.title, description: form.description,
        goal: form.goal, duration_weeks: parseInt(form.duration_weeks)||4,
        price: parseInt(form.price)||0,
        calories_per_day: parseInt(form.calories_per_day)||null,
        meals_per_day: parseInt(form.meals_per_day)||3,
        includes: form.includes ? form.includes.split('\n').filter(Boolean) : [],
        is_active: true,
      }
      if (editing) {
        await supabase.from('diet_plans').update(data).eq('id', editing.id)
        toast.success('✅ Plani u përditësua!')
      } else {
        await supabase.from('diet_plans').insert(data)
        toast.success('✅ Plani u shtua!')
      }
      setShowAdd(false); setEditing(null)
      setForm({ title:'', description:'', goal:'lose_weight', duration_weeks:4, price:'', calories_per_day:'', meals_per_day:3, includes:'' })
      reload()
    } catch(e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const toggleActive = async (plan) => {
    await supabase.from('diet_plans').update({ is_active: !plan.is_active }).eq('id', plan.id)
    toast.success(plan.is_active ? 'Plani u çaktivizua' : 'Plani u aktivizua')
    reload()
  }

  const startEdit = (p) => {
    setForm({ title:p.title, description:p.description||'', goal:p.goal||'lose_weight', duration_weeks:p.duration_weeks, price:p.price, calories_per_day:p.calories_per_day||'', meals_per_day:p.meals_per_day, includes:(p.includes||[]).join('\n') })
    setEditing(p); setShowAdd(true)
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Planet e Dietës</div><div className="ps">{(plans||[]).length} plane totale</div></div>
        <button className="btn btn-p" onClick={()=>{setEditing(null);setShowAdd(true)}}>+ Plan i Ri</button>
      </div>

      {loading ? <Loading/> : (
        (plans||[]).length === 0 ? (
          <div className="card" style={{padding:60,textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>🥗</div>
            <div style={{fontFamily:'Georgia,serif',fontSize:22,marginBottom:8}}>Asnjë plan ende</div>
            <div style={{fontSize:14,color:'var(--tx3)',marginBottom:24}}>Shto planin e parë të dietës dhe fillo të fitosh</div>
            <button className="btn btn-p" onClick={()=>setShowAdd(true)}>+ Shto Planin e Parë</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
            {(plans||[]).map(p=>(
              <div key={p.id} className="card" style={{opacity:p.is_active?1:.6}}>
                <div style={{padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>{p.title}</div>
                      <div style={{fontSize:12,color:'var(--tx3)'}}>{GOALS[p.goal]||p.goal}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontFamily:'Georgia,serif',fontSize:24,fontWeight:900}}>{fmtNum(p.price)}</div>
                      <div style={{fontSize:11,color:'var(--tx4)'}}>ALL</div>
                    </div>
                  </div>

                  {p.description && <div style={{fontSize:13,color:'var(--tx2)',marginBottom:12,lineHeight:1.6}}>{p.description}</div>}

                  <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>
                    <span className="bdg bdg-bl">📅 {p.duration_weeks} javë</span>
                    {p.calories_per_day && <span className="bdg bdg-gr">🔥 {p.calories_per_day} kcal/ditë</span>}
                    <span className="bdg bdg-gy">🍽️ {p.meals_per_day} vakte</span>
                    <span className="bdg bdg-am">🛒 {p.purchases||0} blerje</span>
                  </div>

                  {(p.includes||[]).length > 0 && (
                    <div style={{marginBottom:14}}>
                      {(p.includes||[]).slice(0,3).map((inc,i)=>(
                        <div key={i} style={{fontSize:12,color:'var(--tx2)',display:'flex',gap:6,marginBottom:3}}>
                          <span style={{color:'var(--gr)'}}>✓</span>{inc}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-s btn-sm" onClick={()=>startEdit(p)} style={{flex:1,justifyContent:'center'}}>✏️ Edito</button>
                    <button className={`btn btn-sm ${p.is_active?'btn-danger':'btn-success'}`} onClick={()=>toggleActive(p)}>
                      {p.is_active ? '⏸ Çaktivizo' : '▶ Aktivizo'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showAdd && (
        <Modal title={editing?'✏️ Edito Planin':'🥗 Plan i Ri i Dietës'} onClose={()=>{setShowAdd(false);setEditing(null)}} footer={
          <><button className="btn btn-s" onClick={()=>{setShowAdd(false);setEditing(null)}}>Anulo</button>
          <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'✅ Ruaj Planin'}</button></>
        }>
          <div className="fg"><div className="fgp"><label>Titulli i Planit *</label><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="p.sh. Dieta Lean Muscle 12 javë"/></div></div>
          <div className="fg c2">
            <div className="fgp"><label>Qëllimi</label>
              <select value={form.goal} onChange={e=>set('goal',e.target.value)}>
                {Object.entries(GOALS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="fgp"><label>Çmimi (ALL) *</label><input type="number" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="2000"/></div>
          </div>
          <div className="fg c2">
            <div className="fgp"><label>Kohëzgjatja (javë)</label><input type="number" value={form.duration_weeks} onChange={e=>set('duration_weeks',e.target.value)} min="1" max="52"/></div>
            <div className="fgp"><label>Kalori / ditë</label><input type="number" value={form.calories_per_day} onChange={e=>set('calories_per_day',e.target.value)} placeholder="1800"/></div>
          </div>
          <div className="fg"><div className="fgp"><label>Vakte / ditë</label><select value={form.meals_per_day} onChange={e=>set('meals_per_day',e.target.value)}>{[3,4,5,6].map(n=><option key={n} value={n}>{n} vakte</option>)}</select></div></div>
          <div className="fg"><div className="fgp"><label>Përshkrimi</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Çfarë përfshin ky plan..."/></div></div>
          <div className="fg" style={{marginBottom:0}}><div className="fgp"><label>Çfarë Përfshin (1 gjë / rresht)</label><textarea value={form.includes} onChange={e=>set('includes',e.target.value)} placeholder="Plan ushqimor 7-ditor&#10;Lista e blerjes javore&#10;Receta shëndetësore&#10;Mbështetje direkte WhatsApp" style={{minHeight:100}}/></div></div>
        </Modal>
      )}
    </div>
  )
}

// ── ORDERS PAGE ───────────────────────────────────────────
function MyOrders({ nutritionistId }) {
  const { data: orders, loading } = useAsync(() => getMyOrders(nutritionistId), [nutritionistId])
  const paid = (orders||[]).filter(o=>o.status==='paid')
  const pending = (orders||[]).filter(o=>o.status==='pending')
  const totalEarned = paid.reduce((a,o)=>a+o.nutritionist_amount, 0)

  return (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Porositë</div><div className="ps">Histori i shitjeve tuaja</div></div></div>
      <div className="sg">
        <StatCard icon="💰" label="Total i Fituar"    value={fmtNum(totalEarned)+' L'} change="70% e shitjeve" up/>
        <StatCard icon="✅" label="Porosi të Paguara" value={paid.length}              change="shitje" up/>
        <StatCard icon="⏳" label="Në Pritje"         value={pending.length}/>
        <StatCard icon="🛒" label="Total Porosi"      value={(orders||[]).length}/>
      </div>
      {loading?<Loading/>:(
        <div className="card">
          <div className="tw"><table>
            <thead><tr><th>#</th><th>Klienti</th><th>Plani</th><th>Shuma Totale</th><th>Ty (70%)</th><th>Data</th><th>Statusi</th></tr></thead>
            <tbody>
              {(orders||[]).length===0?<tr><td colSpan={7}><Empty icon="🛒" title="Asnjë porosi ende" sub="Porositë shfaqen kur klientët blejnë dietat tuaja"/></td></tr>:
              (orders||[]).map(o=>(
                <tr key={o.id}>
                  <td style={{fontFamily:'monospace',fontSize:11,color:'var(--tx4)'}}>{o.invoice_number}</td>
                  <td><div><div style={{fontWeight:500}}>{o.buyer_name}</div><div style={{fontSize:11,color:'var(--tx4)'}}>{o.buyer_email}</div></div></td>
                  <td><span className="bdg bdg-gy">{o.diet_plan?.title||'—'}</span></td>
                  <td style={{fontWeight:500}}>{fmtNum(o.amount)} L</td>
                  <td style={{fontWeight:700,color:'var(--gr)'}}>{fmtNum(o.nutritionist_amount)} L</td>
                  <td style={{fontSize:12,color:'var(--tx3)'}}>{fmtDate(o.created_at)}</td>
                  <td>{o.status==='paid'?<span className="bdg bdg-gr">✅ Paguar</span>:<span className="bdg bdg-am">⏳ Pritje</span>}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  )
}

// ── PROFILE PAGE ──────────────────────────────────────────
function MyProfile({ nutritionist, reload }) {
  const [form, setForm] = useState({
    name: nutritionist.name||'', bio: nutritionist.bio||'',
    phone: nutritionist.phone||'', speciality: nutritionist.speciality||'weight_loss',
    experience_years: nutritionist.experience_years||0, education: nutritionist.education||'',
    certificate: nutritionist.certificate||'',
  })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const save = async () => {
    setSaving(true)
    await supabase.from('nutritionists').update(form).eq('id', nutritionist.id)
    toast.success('✅ Profili u ruajt!'); setSaving(false); reload()
  }

  return (
    <div className="page-in">
      <div className="ph">
        <div><div className="pt">Profili Im</div><div className="ps">Informacioni i shfaqur tek klientët</div></div>
        <button className="btn btn-p" onClick={save} disabled={saving}>{saving?'Duke ruajtur...':'💾 Ruaj'}</button>
      </div>
      <div className="g2">
        <div className="card">
          <div className="card-hd"><div className="card-t">👤 Informacioni Personal</div></div>
          <div className="card-b">
            <div className="fg"><div className="fgp"><label>Emri i Plotë</label><input value={form.name} onChange={e=>set('name',e.target.value)}/></div></div>
            <div className="fg"><div className="fgp"><label>Telefon</label><input value={form.phone} onChange={e=>set('phone',e.target.value)}/></div></div>
            <div className="fg"><div className="fgp"><label>Specializimi</label>
              <select value={form.speciality} onChange={e=>set('speciality',e.target.value)}>
                {Object.entries(GOALS).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div></div>
            <div className="fg"><div className="fgp"><label>Vite Eksperience</label><input type="number" value={form.experience_years} onChange={e=>set('experience_years',e.target.value)} min="0" max="50"/></div></div>
            <div className="fg"><div className="fgp"><label>Bio (shfaqet tek klientët)</label><textarea value={form.bio} onChange={e=>set('bio',e.target.value)} placeholder="Prezantoje veten..." style={{minHeight:120}}/></div></div>
            <div className="fg" style={{marginBottom:0}}><div className="fgp"><label>Edukimi / Çertifikata</label><input value={form.certificate} onChange={e=>set('certificate',e.target.value)}/></div></div>
          </div>
        </div>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-hd"><div className="card-t">📊 Statistikat</div></div>
            <div className="card-b" style={{display:'flex',flexDirection:'column',gap:12}}>
              {[
                ['🥗 Planet aktive', nutritionist.total_plans||0],
                ['🛒 Total porosi', nutritionist.total_orders||0],
                ['💰 Total i fituar', fmtNum(nutritionist.total_earned||0)+' L'],
                ['⭐ Komisioni', (nutritionist.commission_pct||70)+'%'],
              ].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                  <span style={{fontSize:13,color:'var(--tx2)'}}>{l}</span>
                  <span style={{fontWeight:600,fontSize:14}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-hd"><div className="card-t">💡 Këshilla</div></div>
            <div className="card-b" style={{fontSize:13,color:'var(--tx2)',lineHeight:1.8}}>
              <div style={{marginBottom:8}}>✅ Shto foto profili për besueshmëri më të lartë</div>
              <div style={{marginBottom:8}}>✅ Shkruaj bio të detajuar</div>
              <div style={{marginBottom:8}}>✅ Vendos çmime competitive (1,500-5,000 L)</div>
              <div>✅ Aktivizo sa më shumë plane të ndryshme</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── LAYOUT ────────────────────────────────────────────────
const NAV = [
  {s:'Kryesore', items:[{id:'dashboard',l:'Dashboard',i:'📊'},{id:'plans',l:'Planet e Dietës',i:'🥗'},{id:'orders',l:'Porositë',i:'🛒'}]},
  {s:'Llogaria', items:[{id:'profile',l:'Profili Im',i:'👤'}]},
]
const TITLES = { dashboard:'Dashboard', plans:'Planet e Dietës', orders:'Porositë', profile:'Profili Im' }

export default function NutritionistDashboard() {
  const { profile, logout } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [sbOpen, setSbOpen] = useState(false)

  const nutritionistId = profile?.data?.id
  const { data: nutr, reload } = useAsync(() =>
    supabase.from('nutritionist_stats').select('*').eq('id', nutritionistId).single().then(r=>r.data),
    [nutritionistId]
  )

  const nav = id => { setPage(id); setSbOpen(false) }
  const name = profile?.data?.name || 'Dietolog'

  const Dashboard = () => (
    <div className="page-in">
      <div className="ph"><div><div className="pt">Mirë se erdhe, {name.split(' ')[0]}! 👋</div><div className="ps">Pasqyra e aktivitetit tënd</div></div></div>
      <div className="sg">
        <StatCard icon="💰" label="Total i Fituar"  value={fmtNum(nutr?.total_earned||0)+' L'}  change="të gjitha kohërat" up/>
        <StatCard icon="🥗" label="Planet Aktive"    value={nutr?.total_plans||0}               change="plane" up/>
        <StatCard icon="🛒" label="Total Porosi"     value={nutr?.total_orders||0}              change="shitje" up/>
        <StatCard icon="⭐" label="Komisioni Yt"     value={(nutr?.commission_pct||70)+'%'}     change="nga çdo shitje" up/>
      </div>
      <div className="g2">
        <div className="card" style={{padding:32,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12}}>🥗</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:20,marginBottom:8}}>Shto Planin e Parë</div>
          <div style={{fontSize:13,color:'var(--tx3)',marginBottom:20}}>Fillo të shesësh dietat tua tek mijëra anëtarë</div>
          <button className="btn btn-p" onClick={()=>nav('plans')}>Shko te Planet →</button>
        </div>
        <div className="card" style={{padding:32}}>
          <div style={{fontFamily:'Georgia,serif',fontSize:18,marginBottom:16}}>💡 Si Funksionon</div>
          {[
            ['1','Shto një plan diete me çmimin tënd'],
            ['2','Klientët e palestrëve e shohin dhe blejnë'],
            ['3','Ti merr 70% — platforma 30%'],
            ['4','Pagesa bëhet cash te palestra'],
          ].map(([n,t])=>(
            <div key={n} style={{display:'flex',gap:12,marginBottom:12,alignItems:'flex-start'}}>
              <div style={{width:24,height:24,borderRadius:'50%',background:'var(--tx)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{n}</div>
              <div style={{fontSize:13,color:'var(--tx2)',lineHeight:1.5}}>{t}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const PAGE = {
    dashboard: <Dashboard/>,
    plans:     <MyPlans  nutritionistId={nutritionistId}/>,
    orders:    <MyOrders nutritionistId={nutritionistId}/>,
    profile:   <MyProfile nutritionist={nutr||profile?.data||{}} reload={reload}/>,
  }

  return (
    <div className="app">
      <div className={`sbo ${sbOpen?'open':''}`} onClick={()=>setSbOpen(false)}/>
      <aside className={`sidebar ${sbOpen?'open':''}`}>
        <div className="sb-logo">
          <div className="sb-icon">🥗</div>
          <div><div className="sb-name">Vaqo</div><div className="sb-sub">Panel Dietologu</div></div>
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
            <div className="user-av" style={{background:'#16a34a'}}>{name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}</div>
            <div><div className="user-nm">{name}</div><div className="user-rl">Dietolog · Dil →</div></div>
          </div>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="tbl">
            <button className="hmbg" style={{display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setSbOpen(s=>!s)}>☰</button>
            <div className="tb-title">{TITLES[page]}</div>
          </div>
          <div className="tbr">
            <span className="bdg bdg-gr">🥗 Dietolog</span>
          </div>
        </div>
        <div className="content">{PAGE[page]}</div>
      </main>
    </div>
  )
}
