// src/pages/admin/AdminAnalytics.jsx
// Admin Panel i Avancuar — Platform Overview, Revenue, Alerts

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// ── Mini Bar Chart ────────────────────────────────────────
function MiniBar({ data, color='#7c3aed', h=60 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || !data?.length) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0,0,W,H)
    const max = Math.max(...data,1)
    const bw = (W/data.length)*0.7
    const gap = W/data.length
    data.forEach((v,i)=>{
      const bh = (v/max)*(H-8)
      const x = i*gap+(gap-bw)/2
      ctx.fillStyle = i===data.length-1?color:color+'66'
      ctx.beginPath(); ctx.roundRect(x,H-bh,bw,bh,[3,3,0,0]); ctx.fill()
    })
  },[data,color])
  return <canvas ref={ref} width={300} height={h} style={{width:'100%',height:h}}/>
}

// ── Platform KPI Card ─────────────────────────────────────
function KPICard({icon,label,value,sub,color='#7c3aed',trend,spark}) {
  return (
    <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:34,height:34,borderRadius:8,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>{icon}</div>
          <div style={{fontSize:12,color:'#71717a',fontWeight:500}}>{label}</div>
        </div>
        {trend!==undefined&&<div style={{fontSize:11,fontWeight:700,color:trend>=0?'#16a34a':'#dc2626',background:trend>=0?'#f0fdf4':'#fef2f2',padding:'2px 8px',borderRadius:20}}>{trend>=0?'↑':'↓'}{Math.abs(trend)}%</div>}
      </div>
      <div style={{fontSize:30,fontWeight:900,color:'#18181b',lineHeight:1,marginBottom:4}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:'#71717a'}}>{sub}</div>}
      {spark&&<div style={{marginTop:10}}><MiniBar data={spark} color={color} h={44}/></div>}
    </div>
  )
}

const months = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj']
const fmt = n => (n||0).toLocaleString('sq-AL')
const fmtL = n => `${fmt(n)} L`

export default function AdminAnalytics() {
  const [data,  setData]  = useState(null)
  const [loading,setLoading]=useState(true)
  const [tab,   setTab]   = useState('overview')
  const [alerts,setAlerts]=useState([])

  useEffect(()=>{load()},[])

  async function load() {
    setLoading(true)
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(),now.getMonth(),1).toISOString()
      const prevMonthStart = new Date(now.getFullYear(),now.getMonth()-1,1).toISOString()
      const prevMonthEnd = new Date(now.getFullYear(),now.getMonth(),0).toISOString()
      const yearStart = new Date(now.getFullYear(),0,1).toISOString()

      const [
        {data:gyms},
        {data:overview},
        {data:revenueYear},
        {data:newGymsMonth},
        {data:allPayments},
      ] = await Promise.all([
        supabase.from('gyms').select('id,name,status,business_type,city,created_at,plan').order('created_at',{ascending:false}),
        supabase.from('platform_overview').select('*').single(),
        supabase.from('payments').select('amount,created_at,gym_id').gte('created_at',yearStart),
        supabase.from('gyms').select('id').gte('created_at',monthStart).eq('status','approved'),
        supabase.from('payments').select('amount,created_at,gym_id'),
      ])

      const {data:prevGyms} = await supabase.from('gyms').select('id').gte('created_at',prevMonthStart).lte('created_at',prevMonthEnd).eq('status','approved')

      // Revenue by month
      const revenueByMonth = Array(12).fill(0)
      ;(revenueYear||[]).forEach(p=>{ revenueByMonth[new Date(p.created_at).getMonth()] += p.amount||0 })

      // Gyms by month
      const gymsByMonth = Array(12).fill(0)
      ;(gyms||[]).filter(g=>g.status==='approved').forEach(g=>{
        const m = new Date(g.created_at).getMonth()
        gymsByMonth[m]++
      })

      // Platform revenue (subscription fees)
      const PLAN_PRICES = {starter:4900,pro:7900,business:14900}
      const approvedGyms = (gyms||[]).filter(g=>g.status==='approved')
      const platformRevenue = approvedGyms.reduce((s,g)=>s+(PLAN_PRICES[g.plan||'starter']||4900),0)

      // Revenue per gym (last 30 days)
      const gymRevenue = {}
      const day30ago = new Date(now-30*24*3600*1000).toISOString()
      const {data:recentPay} = await supabase.from('payments').select('amount,gym_id').gte('created_at',day30ago)
      ;(recentPay||[]).forEach(p=>{ gymRevenue[p.gym_id]=(gymRevenue[p.gym_id]||0)+(p.amount||0) })

      // Low performance gyms — approved but 0 revenue last 30 days
      const lowPerf = approvedGyms.filter(g=>!gymRevenue[g.id] || gymRevenue[g.id]<1000)

      // Build alerts
      const newAlerts = []
      if (lowPerf.length>0) newAlerts.push({ type:'warning', icon:'⚠️', title:`${lowPerf.length} biznese me performancë të ulët`, desc:'Nuk kanë pagesa 30 ditët e fundit', action:'low_perf' })
      const pendingApps = (gyms||[]).filter(g=>g.status==='pending').length
      if (pendingApps>0) newAlerts.push({ type:'info', icon:'📋', title:`${pendingApps} aplikime pritje`, desc:'Duhet rishikim dhe aprovim', action:'apps' })
      const thisMonthGyms = newGymsMonth?.length||0
      if (thisMonthGyms>=3) newAlerts.push({ type:'success', icon:'🎉', title:`${thisMonthGyms} biznese të reja këtë muaj!`, desc:'Rritje e mirë e platformës', action:null })

      setAlerts(newAlerts)
      setData({
        totalGyms: approvedGyms.length,
        pendingGyms: (gyms||[]).filter(g=>g.status==='pending').length,
        newThisMonth: thisMonthGyms,
        prevMonth: prevGyms?.length||0,
        platformRevenue,
        revenueByMonth,
        gymsByMonth,
        allGyms: gyms||[],
        lowPerf,
        gymRevenue,
        overview: overview||{},
        totalMembers: overview?.total_members||0,
        totalPayments: (allPayments||[]).reduce((s,p)=>s+(p.amount||0),0),
      })
    } catch(e){console.error(e)}
    finally{setLoading(false)}
  }

  const pct = (a,b) => b ? Math.round(((a-b)/b)*100) : 0

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:80,color:'#71717a',gap:12,fontFamily:'system-ui'}}>
      <div style={{width:20,height:20,border:'2px solid #e4e4e7',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
      Duke ngarkuar analitikën e platformës...
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!data) return null

  const TABS = [{id:'overview',l:'📊 Pasqyra'},{id:'businesses',l:'🏢 Bizneset'},{id:'revenue',l:'💰 Të Ardhurat'},{id:'alerts',l:`🔔 Alarmet (${alerts.length})`}]

  return (
    <div className="page-in" style={{fontFamily:'system-ui,sans-serif'}}>
      <style>{`.alrow:hover{background:#fafafa!important}canvas{display:block}`}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontFamily:"'Georgia',serif",fontSize:22,fontWeight:900,marginBottom:3}}>📊 Platform Analytics</div>
          <div style={{fontSize:13,color:'#71717a'}}>Pasqyrë e plotë e platformës Vaqo</div>
        </div>
        <button onClick={load} style={{background:'#f4f4f5',border:'none',padding:'8px 16px',borderRadius:9,fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>↻ Rifresko</button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:24,borderBottom:'1px solid #f0f0f0',overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 18px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',color:tab===t.id?'#7c3aed':'#71717a',borderBottom:`2px solid ${tab===t.id?'#7c3aed':'transparent'}`,marginBottom:-1,whiteSpace:'nowrap',transition:'all .15s'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab==='overview'&&(
        <>
          {/* Alerts banner */}
          {alerts.length>0&&(
            <div style={{marginBottom:20,display:'flex',flexDirection:'column',gap:8}}>
              {alerts.map((a,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:11,border:'1px solid',borderColor:a.type==='warning'?'#fde68a':a.type==='success'?'#bbf7d0':'#bfdbfe',background:a.type==='warning'?'#fffbeb':a.type==='success'?'#f0fdf4':'#eff6ff',cursor:a.action?'pointer':'default'}}
                  onClick={()=>a.action&&setTab(a.action==='low_perf'?'businesses':'overview')}>
                  <span style={{fontSize:20}}>{a.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:14,color:'#18181b'}}>{a.title}</div>
                    <div style={{fontSize:12,color:'#71717a'}}>{a.desc}</div>
                  </div>
                  {a.action&&<span style={{fontSize:12,color:'#7c3aed',fontWeight:600}}>Shiko →</span>}
                </div>
              ))}
            </div>
          )}

          {/* KPIs */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:20}}>
            <KPICard icon="🏢" label="Biznese aktive" value={data.totalGyms} sub={`+${data.newThisMonth} ky muaj`} trend={pct(data.newThisMonth,data.prevMonth)} spark={data.gymsByMonth.slice(-6)} color="#7c3aed"/>
            <KPICard icon="💰" label="Të ardhura platformë/muaj" value={fmtL(data.platformRevenue)} sub="Abonimet aktive" spark={data.revenueByMonth.slice(-6)} color="#16a34a"/>
            <KPICard icon="👥" label="Anëtarë total" value={fmt(data.totalMembers)} color="#2563eb"/>
            <KPICard icon="⏳" label="Aplikime pritje" value={data.pendingGyms} sub="Duhet aprovim" color="#d97706"/>
          </div>

          {/* Charts grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🏢 Biznese të Reja / Muaj</div>
              <MiniBar data={data.gymsByMonth} color="#7c3aed" h={140}/>
              <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                {months.map((m,i)=><div key={m} style={{flex:1,textAlign:'center',fontSize:9,color:'#a1a1aa',minWidth:20}}>{m}</div>)}
              </div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>💰 Të Ardhurat Platformë / Muaj</div>
              <MiniBar data={data.revenueByMonth} color="#16a34a" h={140}/>
              <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
                {months.map((m,i)=><div key={m} style={{flex:1,textAlign:'center',fontSize:9,color:'#a1a1aa',minWidth:20}}>{m}</div>)}
              </div>
            </div>
          </div>

          {/* Business type breakdown */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22,marginTop:16}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🗂️ Bizneset sipas Llojit</div>
            {Object.entries(
              data.allGyms.filter(g=>g.status==='approved').reduce((acc,g)=>{
                acc[g.business_type||'gym']=(acc[g.business_type||'gym']||0)+1
                return acc
              },{})
            ).sort((a,b)=>b[1]-a[1]).map(([type,count])=>{
              const icons = {gym:'🏋️',barbershop:'💈',salon:'💅',spa:'💆',yoga:'🧘',pilates:'🤸',dance:'💃',fitness:'⚡',martial_arts:'🥊',wellness:'🌿'}
              const pctVal = Math.round(count/data.totalGyms*100)
              return (
                <div key={type} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0',borderBottom:'1px solid #f5f5f5'}}>
                  <span style={{fontSize:18,flexShrink:0,width:28}}>{icons[type]||'🏢'}</span>
                  <span style={{fontSize:13,fontWeight:500,minWidth:140}}>{type}</span>
                  <div style={{flex:1,height:6,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:`${pctVal}%`,height:'100%',background:'#7c3aed',borderRadius:3,transition:'width .5s'}}/>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,minWidth:28,textAlign:'right'}}>{count}</span>
                  <span style={{fontSize:11,color:'#a1a1aa',minWidth:36,textAlign:'right'}}>{pctVal}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── BUSINESSES ── */}
      {tab==='businesses'&&(
        <>
          {/* Low perf alert */}
          {data.lowPerf.length>0&&(
            <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'14px 18px',marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:14,color:'#92400e',marginBottom:6}}>⚠️ {data.lowPerf.length} Biznese me Performancë të Ulët</div>
              <div style={{fontSize:13,color:'#78350f'}}>Këta biznese nuk kanë regjistruar pagesa 30 ditët e fundit. Kontaktoji për të ofruar ndihmë.</div>
            </div>
          )}

          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden'}}>
            <div style={{background:'#fafafa',borderBottom:'1px solid #e4e4e7',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 16px'}}>
              {['Biznesi','Lloji','Qyteti','Plani','Të ardhura/30d'].map(h=>(
                <div key={h} style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',color:'#71717a'}}>{h}</div>
              ))}
            </div>
            {data.allGyms.filter(g=>g.status==='approved').map(g=>{
              const rev = data.gymRevenue[g.id]||0
              const isLow = rev < 1000
              const icons = {gym:'🏋️',barbershop:'💈',salon:'💅',spa:'💆',yoga:'🧘',pilates:'🤸',dance:'💃',fitness:'⚡',martial_arts:'🥊',wellness:'🌿'}
              return (
                <div key={g.id} className="alrow" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'12px 16px',borderBottom:'1px solid #f8f8f8',background:isLow?'#fffbeb08':'#fff',transition:'background .15s'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{g.name}</div>
                    <div style={{fontSize:11,color:'#a1a1aa'}}>{new Date(g.created_at).toLocaleDateString('sq-AL')}</div>
                  </div>
                  <div style={{fontSize:13,color:'#52525b'}}>{icons[g.business_type]||'🏢'} {g.business_type||'gym'}</div>
                  <div style={{fontSize:13,color:'#52525b'}}>{g.city||'—'}</div>
                  <div>
                    <span style={{background:g.plan==='business'?'#dcfce7':g.plan==='pro'?'#f5f3ff':'#f4f4f5',color:g.plan==='business'?'#15803d':g.plan==='pro'?'#7c3aed':'#52525b',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,textTransform:'uppercase'}}>
                      {g.plan||'starter'}
                    </span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontWeight:700,fontSize:13,color:isLow?'#d97706':'#16a34a'}}>{fmtL(rev)}</span>
                    {isLow&&<span style={{fontSize:10,background:'#fef3c7',color:'#92400e',padding:'1px 6px',borderRadius:10,fontWeight:700}}>⚠️ Low</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── REVENUE ── */}
      {tab==='revenue'&&(
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            <div style={{background:'linear-gradient(135deg,#18181b,#2d1b69)',borderRadius:14,padding:24,color:'#fff'}}>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:8}}>Abonimet ky muaj</div>
              <div style={{fontFamily:"'Georgia',serif",fontSize:40,fontWeight:900,color:'#c8a96e'}}>{fmtL(data.platformRevenue)}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:6}}>{data.totalGyms} biznese aktive</div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontSize:12,color:'#71717a',marginBottom:8}}>Biznese Starter (4,900 L)</div>
              <div style={{fontFamily:"'Georgia',serif",fontSize:36,fontWeight:900}}>{data.allGyms.filter(g=>g.status==='approved'&&(!g.plan||g.plan==='starter')).length}</div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontSize:12,color:'#71717a',marginBottom:8}}>Biznese Pro (7,900 L)</div>
              <div style={{fontFamily:"'Georgia',serif",fontSize:36,fontWeight:900,color:'#7c3aed'}}>{data.allGyms.filter(g=>g.plan==='pro').length}</div>
            </div>
          </div>

          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:20}}>📊 Të Ardhurat e Platformës — Viti Aktual</div>
            <MiniBar data={data.revenueByMonth} color="#7c3aed" h={180}/>
            <div style={{display:'flex',gap:0,marginTop:8}}>
              {months.map((m,i)=>(
                <div key={m} style={{flex:1,textAlign:'center'}}>
                  <div style={{fontSize:9,color:'#a1a1aa'}}>{m}</div>
                  <div style={{fontSize:10,fontWeight:600,color:'#52525b'}}>{data.revenueByMonth[i]>0?`${Math.round(data.revenueByMonth[i]/1000)}K`:''}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue per business */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🏆 Top Bizneset sipas Të Ardhurave (30 ditë)</div>
            {data.allGyms
              .filter(g=>g.status==='approved'&&data.gymRevenue[g.id]>0)
              .sort((a,b)=>(data.gymRevenue[b.id]||0)-(data.gymRevenue[a.id]||0))
              .slice(0,10)
              .map((g,i)=>{
                const rev = data.gymRevenue[g.id]||0
                const maxRev = Math.max(...data.allGyms.map(x=>data.gymRevenue[x.id]||0))
                return (
                  <div key={g.id} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:'1px solid #f5f5f5'}}>
                    <div style={{width:24,height:24,borderRadius:'50%',background:i<3?'#fef3c7':'#f4f4f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:i<3?'#92400e':'#71717a',flexShrink:0}}>
                      {i+1}
                    </div>
                    <div style={{flex:1,fontSize:13,fontWeight:600}}>{g.name}</div>
                    <div style={{width:120,height:6,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}>
                      <div style={{width:`${(rev/maxRev)*100}%`,height:'100%',background:'#7c3aed',borderRadius:3}}/>
                    </div>
                    <div style={{fontWeight:700,fontSize:13,color:'#16a34a',minWidth:80,textAlign:'right'}}>{fmtL(rev)}</div>
                  </div>
                )
              })}
          </div>
        </>
      )}

      {/* ── ALERTS ── */}
      {tab==='alerts'&&(
        <>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:"'Georgia',serif",fontSize:18,fontWeight:900,marginBottom:4}}>🔔 Sistemi i Alerteve</div>
            <div style={{fontSize:13,color:'#71717a'}}>Monitorim automatik i platformës</div>
          </div>

          {alerts.length===0?(
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:14,padding:40,textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:12}}>✅</div>
              <div style={{fontFamily:"'Georgia',serif",fontSize:20,fontWeight:700,color:'#15803d'}}>Asnjë alert aktiv</div>
              <div style={{fontSize:14,color:'#52525b',marginTop:8}}>Platforma funksionon normalisht.</div>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {alerts.map((a,i)=>(
                <div key={i} style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:20,display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{fontSize:28,flexShrink:0}}>{a.icon}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{a.title}</div>
                    <div style={{fontSize:13,color:'#71717a'}}>{a.desc}</div>
                  </div>
                  {a.action&&<button onClick={()=>setTab(a.action==='low_perf'?'businesses':'overview')} style={{background:'#f5f3ff',color:'#7c3aed',border:'none',padding:'8px 16px',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Shiko →</button>}
                </div>
              ))}
            </div>
          )}

          {/* Alert config */}
          <div style={{background:'#fafafa',border:'1px solid #e4e4e7',borderRadius:14,padding:20,marginTop:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>⚙️ Alertet e Konfiguruar</div>
            {[
              ['⚠️','Biznese me të ardhura < 1,000 L (30 ditë)','Aktiv'],
              ['📋','Aplikime të reja pritje','Aktiv'],
              ['🎉','Biznese të reja të aprovuara','Aktiv'],
              ['💳','Pagesa të vonuara (>15 ditë)','Hëse ardhshme'],
              ['📉','Rënie anëtarësh > 20%','Hëse ardhshme'],
            ].map(([ico,label,status])=>(
              <div key={label} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f0f0f0'}}>
                <span style={{fontSize:18}}>{ico}</span>
                <span style={{flex:1,fontSize:13,color:'#52525b'}}>{label}</span>
                <span style={{fontSize:11,fontWeight:700,color:status==='Aktiv'?'#16a34a':'#a1a1aa',background:status==='Aktiv'?'#dcfce7':'#f4f4f5',padding:'2px 10px',borderRadius:20}}>{status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
