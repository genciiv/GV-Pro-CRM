// src/pages/admin/AdminAnalytics.jsx
// Admin Analytics Avancuar — Të ardhurat, Bizneset, Alarmet

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// ── Mini Bar Chart (canvas, zero deps) ───────────────────
function BarChart({ data=[], labels=[], color='#7c3aed', h=120, compareData, compareColor='#c8a96e' }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || !data.length) return
    const c = ref.current, ctx = c.getContext('2d')
    const W = c.width, H = c.height
    ctx.clearRect(0, 0, W, H)
    const all = [...data, ...(compareData||[])]
    const max = Math.max(...all, 1)
    const cols = data.length
    const groupW = W / cols
    const barW = compareData ? groupW * 0.35 : groupW * 0.6
    data.forEach((v, i) => {
      const bh = Math.max(2, (v/max)*(H-20))
      const x = i*groupW + (groupW - barW*(compareData?2.2:1))/2
      const isLast = i === data.length-1
      ctx.fillStyle = isLast ? color : color+'99'
      ctx.beginPath(); ctx.roundRect(x, H-bh-2, barW, bh, [4,4,0,0]); ctx.fill()
      if (compareData?.[i]) {
        const bh2 = Math.max(2,(compareData[i]/max)*(H-20))
        ctx.fillStyle = compareColor+'99'
        ctx.beginPath(); ctx.roundRect(x+barW+3, H-bh2-2, barW, bh2, [4,4,0,0]); ctx.fill()
      }
      if (labels[i]) {
        ctx.fillStyle = '#aaa'; ctx.font = '22px system-ui'; ctx.textAlign = 'center'
        ctx.fillText(labels[i], i*groupW+groupW/2, H-1)
      }
    })
  }, [data, compareData, color])
  return <canvas ref={ref} width={600} height={h} style={{width:'100%',height:h,display:'block'}}/>
}

function LineChart({ data=[], color='#7c3aed', h=80 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current || data.length < 2) return
    const c = ref.current, ctx = c.getContext('2d')
    const W = c.width, H = c.height
    ctx.clearRect(0,0,W,H)
    const max = Math.max(...data,1), min = Math.min(...data,0)
    const range = max-min||1
    const pts = data.map((v,i)=>({ x:(i/(data.length-1))*W, y:H-((v-min)/range)*(H-12)-6 }))
    // Fill
    ctx.beginPath(); ctx.moveTo(pts[0].x,H)
    pts.forEach(p=>ctx.lineTo(p.x,p.y)); ctx.lineTo(pts[pts.length-1].x,H); ctx.closePath()
    const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,color+'44'); g.addColorStop(1,color+'00')
    ctx.fillStyle=g; ctx.fill()
    // Line
    ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y)
    pts.forEach(p=>ctx.lineTo(p.x,p.y))
    ctx.strokeStyle=color; ctx.lineWidth=2.5; ctx.lineJoin='round'; ctx.stroke()
  }, [data, color])
  return <canvas ref={ref} width={400} height={h} style={{width:'100%',height:h,display:'block'}}/>
}

// ── Helpers ───────────────────────────────────────────────
const fmt  = n => (n||0).toLocaleString('sq-AL')
const fmtL = n => `${fmt(n)} L`
const MONTHS = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj']
const PLAN_PRICE = { starter:4900, pro:7900, business:14900 }
const BIZ_ICON = { gym:'🏋️', barbershop:'💈', salon:'💅', spa:'💆', yoga:'🧘', pilates:'🤸', dance:'💃', fitness:'⚡', martial_arts:'🥊', wellness:'🌿' }

function pct(a,b){ return b ? Math.round(((a-b)/b)*100) : 0 }

function KPICard({ icon, label, value, sub, color='#7c3aed', trend, spark }) {
  return (
    <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:36,height:36,borderRadius:9,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
          <div style={{fontSize:12,color:'#71717a',fontWeight:500,lineHeight:1.4}}>{label}</div>
        </div>
        {trend!==undefined&&(
          <div style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,color:trend>=0?'#15803d':'#dc2626',background:trend>=0?'#dcfce7':'#fee2e2'}}>
            {trend>=0?'↑':'↓'}{Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{fontSize:30,fontWeight:900,lineHeight:1,marginBottom:4}}>{value}</div>
      {sub&&<div style={{fontSize:12,color:'#71717a'}}>{sub}</div>}
      {spark&&<div style={{marginTop:10}}><LineChart data={spark} color={color} h={40}/></div>}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('overview')
  const [data,    setData]    = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const now = new Date()
      const mStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const mPrev   = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString()
      const mPrevE  = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
      const yStart  = new Date(now.getFullYear(), 0, 1).toISOString()
      const d30     = new Date(+now - 30*864e5).toISOString()

      // Parallel fetch
      const [
        {data: gyms},
        {data: payYear},
        {data: payMonth},
        {data: payPrev},
        {data: pay30},
      ] = await Promise.all([
        supabase.from('gyms').select('id,name,status,business_type,city,created_at,plan,email,phone').order('created_at',{ascending:false}),
        supabase.from('payments').select('amount,created_at,gym_id').gte('created_at', yStart),
        supabase.from('payments').select('amount').gte('created_at', mStart),
        supabase.from('payments').select('amount').gte('created_at', mPrev).lte('created_at', mPrevE),
        supabase.from('payments').select('amount,gym_id').gte('created_at', d30),
      ])

      const approved  = (gyms||[]).filter(g=>g.status==='approved')
      const pending   = (gyms||[]).filter(g=>g.status==='pending')
      const newMonth  = approved.filter(g=>g.created_at>=mStart)
      const prevMonth = approved.filter(g=>g.created_at>=mPrev&&g.created_at<=mPrevE)

      // Subscription revenue (from plans)
      const platformRev = approved.reduce((s,g)=>s+(PLAN_PRICE[g.plan||'starter']||PLAN_PRICE.starter),0)

      // Revenue by month (from payments table)
      const revByMonth = Array(12).fill(0)
      ;(payYear||[]).forEach(p=>{ revByMonth[new Date(p.created_at).getMonth()] += p.amount||0 })

      // Gyms created by month
      const gymsByMonth = Array(12).fill(0)
      approved.forEach(g=>{ gymsByMonth[new Date(g.created_at).getMonth()]++ })

      // Revenue per gym last 30d
      const gymRev30 = {}
      ;(pay30||[]).forEach(p=>{ gymRev30[p.gym_id]=(gymRev30[p.gym_id]||0)+(p.amount||0) })

      // Low performance: approved gyms with < 1000L revenue last 30d
      const lowPerf = approved.filter(g=>!gymRev30[g.id]||(gymRev30[g.id]<1000))

      // Type breakdown
      const byType = approved.reduce((acc,g)=>{
        const t=g.business_type||'gym'; acc[t]=(acc[t]||0)+1; return acc
      },{})

      // Alerts
      const alerts = [
        pending.length > 0   && { type:'warning', ico:'📋', title:`${pending.length} aplikime pritje aprovim`,   desc:'Shiko seksionin "Aplikimet"', tab:'apps' },
        lowPerf.length > 0   && { type:'alert',   ico:'⚠️', title:`${lowPerf.length} biznese me aktivitet të ulët`, desc:'Nuk kanë pagesa 30+ ditë', tab:'biz' },
        newMonth.length >= 3 && { type:'success',  ico:'🎉', title:`${newMonth.length} biznese të reja këtë muaj!`, desc:'Platformë në rritje', tab:null },
      ].filter(Boolean)

      // This month payment totals
      const revThis = (payMonth||[]).reduce((s,p)=>s+(p.amount||0),0)
      const revPrev = (payPrev||[]).reduce((s,p)=>s+(p.amount||0),0)

      setData({
        approved, pending, newMonth, prevMonth,
        platformRev, revByMonth, gymsByMonth,
        gymRev30, lowPerf, byType, alerts,
        revThis, revPrev,
        totalRev: (payYear||[]).reduce((s,p)=>s+(p.amount||0),0),
        topGyms: approved.filter(g=>gymRev30[g.id]>0).sort((a,b)=>(gymRev30[b.id]||0)-(gymRev30[a.id]||0)).slice(0,10),
      })
    } catch(e){ console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:80,color:'#71717a',gap:12}}>
      <style>{`@keyframes aasp{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:20,height:20,border:'2.5px solid #e4e4e7',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'aasp .7s linear infinite'}}/>
      Duke ngarkuar analitikën...
    </div>
  )

  if (!data) return null

  const TABS = [
    {id:'overview', l:'📊 Pasqyra'},
    {id:'revenue',  l:'💰 Të Ardhurat'},
    {id:'biz',      l:'🏢 Bizneset'},
    {id:'alerts',   l:`🔔 Alarmet${data.alerts.length?` (${data.alerts.length})`:''}`, badge:data.alerts.length},
  ]

  return (
    <div style={{fontFamily:'system-ui,sans-serif'}}>
      <style>{`.aarow:hover{background:#fafafa!important}canvas{display:block}`}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontFamily:"Georgia,serif",fontSize:21,fontWeight:900,marginBottom:3}}>📈 Analytics Avancuar</div>
          <div style={{fontSize:13,color:'#71717a'}}>Pasqyrë e plotë e platformës Vaqo</div>
        </div>
        <button onClick={load} style={{background:'#f4f4f5',border:'none',padding:'8px 16px',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>↻ Rifresko</button>
      </div>

      {/* Alert banner — always visible */}
      {data.alerts.length>0&&(
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:20}}>
          {data.alerts.map((a,i)=>(
            <div key={i} onClick={()=>a.tab&&setTab(a.tab)}
              style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:11,border:'1px solid',borderColor:a.type==='success'?'#bbf7d0':a.type==='alert'?'#fde68a':'#bfdbfe',background:a.type==='success'?'#f0fdf4':a.type==='alert'?'#fffbeb':'#eff6ff',cursor:a.tab?'pointer':'default'}}>
              <span style={{fontSize:20}}>{a.ico}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{a.title}</div>
                <div style={{fontSize:12,color:'#71717a'}}>{a.desc}</div>
              </div>
              {a.tab&&<span style={{fontSize:12,color:'#7c3aed',fontWeight:600}}>Shiko →</span>}
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:24,borderBottom:'1px solid #f0f0f0'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'9px 16px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',color:tab===t.id?'#7c3aed':'#71717a',borderBottom:`2px solid ${tab===t.id?'#7c3aed':'transparent'}`,marginBottom:-1,whiteSpace:'nowrap',transition:'color .15s',position:'relative'}}>
            {t.l}
            {t.badge>0&&tab!==t.id&&<span style={{position:'absolute',top:6,right:4,width:8,height:8,borderRadius:'50%',background:'#dc2626'}}/>}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW ══ */}
      {tab==='overview'&&(
        <>
          {/* KPIs */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:14,marginBottom:20}}>
            <KPICard icon="🏢" label="Biznese aktive" value={data.approved.length} sub={`+${data.newMonth.length} ky muaj`} trend={pct(data.newMonth.length,data.prevMonth.length)} color="#7c3aed" spark={data.gymsByMonth.slice(-6)}/>
            <KPICard icon="💰" label="Abonime / muaj" value={fmtL(data.platformRev)} sub={`${data.approved.length} biznese × plan`} color="#16a34a" spark={data.revByMonth.slice(-6)}/>
            <KPICard icon="📊" label="Pagesa klientësh (ky muaj)" value={fmtL(data.revThis)} trend={pct(data.revThis,data.revPrev)} color="#2563eb"/>
            <KPICard icon="⏳" label="Aplikime pritje" value={data.pending.length} sub="Duhet aprovim" color="#d97706"/>
          </div>

          {/* Two charts */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>🏢 Biznese të Reja / Muaj</div>
              <div style={{fontSize:11,color:'#71717a',marginBottom:14}}>Viti {new Date().getFullYear()}</div>
              <BarChart data={data.gymsByMonth} labels={MONTHS} color="#7c3aed" h={140}/>
            </div>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>💰 Pagesa Klientësh / Muaj</div>
              <div style={{fontSize:11,color:'#71717a',marginBottom:14}}>Nga bizneset (L)</div>
              <BarChart data={data.revByMonth} labels={MONTHS} color="#16a34a" h={140}/>
            </div>
          </div>

          {/* Business type breakdown */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🗂️ Bizneset sipas Llojit</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {Object.entries(data.byType).sort((a,b)=>b[1]-a[1]).map(([type,count])=>{
                const p = Math.round(count/data.approved.length*100)
                return (
                  <div key={type} style={{display:'flex',alignItems:'center',gap:12}}>
                    <span style={{fontSize:18,width:28,flexShrink:0}}>{BIZ_ICON[type]||'🏢'}</span>
                    <span style={{fontSize:13,fontWeight:500,minWidth:140,color:'#52525b'}}>{type}</span>
                    <div style={{flex:1,height:8,background:'#f0f0f0',borderRadius:4,overflow:'hidden'}}>
                      <div style={{width:`${p}%`,height:'100%',background:'#7c3aed',borderRadius:4,transition:'width .6s'}}/>
                    </div>
                    <span style={{fontSize:13,fontWeight:700,minWidth:30,textAlign:'right'}}>{count}</span>
                    <span style={{fontSize:11,color:'#a1a1aa',minWidth:36,textAlign:'right'}}>{p}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ══ REVENUE ══ */}
      {tab==='revenue'&&(
        <>
          {/* Revenue KPIs */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            <div style={{background:'linear-gradient(135deg,#18181b,#2d1b69)',borderRadius:14,padding:24,color:'#fff'}}>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:8}}>Abonimet platformë / muaj</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:38,fontWeight:900,color:'#c8a96e',lineHeight:1}}>{fmtL(data.platformRev)}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.3)',marginTop:8}}>{data.approved.length} biznese aktive</div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontSize:12,color:'#71717a',marginBottom:8}}>Pagesa klientësh ky muaj</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:34,fontWeight:900}}>{fmtL(data.revThis)}</div>
              <div style={{fontSize:11,color:pct(data.revThis,data.revPrev)>=0?'#16a34a':'#dc2626',marginTop:6,fontWeight:600}}>
                {pct(data.revThis,data.revPrev)>=0?'↑':'↓'}{Math.abs(pct(data.revThis,data.revPrev))}% vs muajit paraardhës
              </div>
            </div>
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontSize:12,color:'#71717a',marginBottom:8}}>Total pagesa këtë vit</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:34,fontWeight:900}}>{fmtL(data.totalRev)}</div>
            </div>
          </div>

          {/* Revenue chart */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>📊 Pagesa Klientësh — Viti {new Date().getFullYear()}</div>
            <div style={{fontSize:11,color:'#71717a',marginBottom:16}}>Shuma totale e pagesave nga bizneset</div>
            <BarChart data={data.revByMonth} labels={MONTHS} color="#7c3aed" h={180}/>
          </div>

          {/* Top gyms by revenue */}
          {data.topGyms.length>0&&(
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🏆 Top Bizneset (30 ditë)</div>
              {data.topGyms.map((g,i)=>{
                const rev = data.gymRev30[g.id]||0
                const maxRev = data.gymRev30[data.topGyms[0].id]||1
                return (
                  <div key={g.id} className="aarow" style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid #f5f5f5',transition:'background .15s'}}>
                    <div style={{width:26,height:26,borderRadius:'50%',background:i<3?'#fef3c7':'#f4f4f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:i<3?'#92400e':'#71717a',flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:16,flexShrink:0}}>{BIZ_ICON[g.business_type]||'🏢'}</span>
                    <div style={{flex:1,fontSize:13,fontWeight:600}}>{g.name}</div>
                    <div style={{width:100,height:6,background:'#f0f0f0',borderRadius:3,overflow:'hidden'}}>
                      <div style={{width:`${(rev/maxRev)*100}%`,height:'100%',background:'#7c3aed',borderRadius:3}}/>
                    </div>
                    <div style={{fontWeight:700,fontSize:13,color:'#16a34a',minWidth:90,textAlign:'right'}}>{fmtL(rev)}</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Plan breakdown */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginTop:16}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📦 Planet Aktive</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14}}>
              {[['starter','Starter','4,900 L','#52525b'],['pro','Pro','7,900 L','#7c3aed'],['business','Business','14,900 L','#16a34a']].map(([plan,name,price,color])=>{
                const count = data.approved.filter(g=>(!g.plan&&plan==='starter')||g.plan===plan).length
                const revenue = count * PLAN_PRICE[plan]
                return (
                  <div key={plan} style={{background:'#fafafa',border:`1px solid ${color}25`,borderRadius:12,padding:18,textAlign:'center'}}>
                    <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color,marginBottom:8}}>{name}</div>
                    <div style={{fontFamily:'Georgia,serif',fontSize:32,fontWeight:900,lineHeight:1,marginBottom:4}}>{count}</div>
                    <div style={{fontSize:12,color:'#71717a',marginBottom:4}}>{price} / muaj</div>
                    <div style={{fontSize:13,fontWeight:700,color}}>{fmtL(revenue)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ══ BUSINESSES ══ */}
      {tab==='biz'&&(
        <>
          {data.lowPerf.length>0&&(
            <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'14px 18px',marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:14,color:'#92400e',marginBottom:4}}>⚠️ {data.lowPerf.length} biznese me aktivitet të ulët</div>
              <div style={{fontSize:13,color:'#78350f'}}>Këta biznese kanë pagesa &lt; 1,000 L në 30 ditët e fundit. Kontaktoji për mbështetje.</div>
            </div>
          )}

          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden'}}>
            {/* Table header */}
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'10px 16px',background:'#fafafa',borderBottom:'1px solid #e4e4e7'}}>
              {['Biznesi','Lloji','Qyteti','Plani','Rev 30d'].map(h=>(
                <div key={h} style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em',color:'#71717a'}}>{h}</div>
              ))}
            </div>
            {data.approved.map(g=>{
              const rev = data.gymRev30[g.id]||0
              const isLow = rev < 1000
              return (
                <div key={g.id} className="aarow" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr',padding:'11px 16px',borderBottom:'1px solid #f8f8f8',background:isLow?'#fffbeb':undefined,transition:'background .15s'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13}}>{g.name}</div>
                    <div style={{fontSize:11,color:'#a1a1aa'}}>{new Date(g.created_at).toLocaleDateString('sq-AL')}</div>
                  </div>
                  <div style={{fontSize:13,color:'#52525b',display:'flex',alignItems:'center',gap:5}}>
                    {BIZ_ICON[g.business_type]||'🏢'} {g.business_type||'gym'}
                  </div>
                  <div style={{fontSize:13,color:'#52525b'}}>{g.city||'—'}</div>
                  <div>
                    <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,textTransform:'uppercase',background:g.plan==='business'?'#dcfce7':g.plan==='pro'?'#f5f3ff':'#f4f4f5',color:g.plan==='business'?'#15803d':g.plan==='pro'?'#7c3aed':'#52525b'}}>
                      {g.plan||'starter'}
                    </span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:13,fontWeight:700,color:isLow?'#d97706':'#16a34a'}}>{fmtL(rev)}</span>
                    {isLow&&<span style={{fontSize:10,background:'#fef3c7',color:'#92400e',padding:'1px 6px',borderRadius:10,fontWeight:700}}>Low</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ══ ALERTS ══ */}
      {tab==='alerts'&&(
        <>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:'Georgia,serif',fontSize:17,fontWeight:900,marginBottom:3}}>🔔 Sistemi i Alerteve</div>
            <div style={{fontSize:13,color:'#71717a'}}>Monitorim automatik i platformës — përditësohet çdo herë që hapni faqen</div>
          </div>

          {/* Active alerts */}
          {data.alerts.length===0?(
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:14,padding:40,textAlign:'center',marginBottom:16}}>
              <div style={{fontSize:44,marginBottom:12}}>✅</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:20,fontWeight:700,color:'#15803d'}}>Asnjë alert aktiv</div>
              <div style={{fontSize:14,color:'#52525b',marginTop:8}}>Platforma funksionon normalisht.</div>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:20}}>
              {data.alerts.map((a,i)=>(
                <div key={i} onClick={()=>a.tab&&setTab(a.tab)}
                  style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:12,padding:20,display:'flex',gap:14,alignItems:'flex-start',cursor:a.tab?'pointer':'default'}}>
                  <span style={{fontSize:26,flexShrink:0}}>{a.ico}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{a.title}</div>
                    <div style={{fontSize:13,color:'#71717a'}}>{a.desc}</div>
                  </div>
                  {a.tab&&<button style={{background:'#f5f3ff',color:'#7c3aed',border:'none',padding:'8px 14px',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap'}}>Shiko →</button>}
                </div>
              ))}
            </div>
          )}

          {/* Alert config info */}
          <div style={{background:'#fafafa',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>⚙️ Alertet e Konfiguruar</div>
            {[
              ['⚠️','Biznese me pagesa &lt; 1,000 L (30 ditë)','Automatik'],
              ['📋','Aplikime të reja pritje aprovim','Automatik'],
              ['🎉','3+ biznese të reja ky muaj','Automatik'],
              ['💳','Pagesa të vonuara > 15 ditë','Hëse ardhshme'],
              ['📉','Rënie anëtarësh > 20%','Hëse ardhshme'],
            ].map(([ico,label,status],i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 0',borderBottom:'1px solid #f0f0f0'}}>
                <span style={{fontSize:17}}>{ico}</span>
                <span style={{flex:1,fontSize:13,color:'#52525b'}} dangerouslySetInnerHTML={{__html:label}}/>
                <span style={{fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:20,color:status==='Automatik'?'#15803d':'#a1a1aa',background:status==='Automatik'?'#dcfce7':'#f4f4f5'}}>{status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
