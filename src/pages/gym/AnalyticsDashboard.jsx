// src/pages/gym/AnalyticsDashboard.jsx
// Dashboard Analytics Avancuar — Grafik, Forecast, At-Risk Clients

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

// ── MINI CHART (Canvas-based, no deps) ───────────────────
function LineChart({ data, color='#7c3aed', height=80, fill=true }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!data?.length || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1
    const pts = data.map((v,i) => ({
      x: (i / (data.length-1)) * W,
      y: H - ((v-min)/range) * (H-16) - 8
    }))
    // Fill
    if (fill) {
      ctx.beginPath()
      ctx.moveTo(pts[0].x, H)
      pts.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.lineTo(pts[pts.length-1].x, H)
      ctx.closePath()
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, color+'55')
      grad.addColorStop(1, color+'00')
      ctx.fillStyle = grad
      ctx.fill()
    }
    // Line
    ctx.beginPath()
    ctx.moveTo(pts[0].x, pts[0].y)
    pts.forEach(p => ctx.lineTo(p.x, p.y))
    ctx.strokeStyle = color
    ctx.lineWidth = 2.5
    ctx.lineJoin = 'round'
    ctx.stroke()
    // Dots
    pts.forEach(p => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 3.5, 0, Math.PI*2)
      ctx.fillStyle = color
      ctx.fill()
    })
  }, [data, color, fill])
  return <canvas ref={canvasRef} width={400} height={height} style={{width:'100%',height}}/>
}

function BarChart({ data, labels, color='#7c3aed', compareData, compareColor='#c8a96e', height=120 }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!data?.length || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const all = [...data, ...(compareData||[])]
    const max = Math.max(...all, 1)
    const barW = (W / data.length) * (compareData ? 0.38 : 0.6)
    const gap = W / data.length
    data.forEach((v, i) => {
      const bh = (v/max) * (H-24)
      const x = i*gap + (gap - barW*(compareData?2.2:1))/2
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, H-bh-2, barW, bh, [4,4,0,0])
      ctx.fill()
      if (compareData?.[i] !== undefined) {
        const bh2 = (compareData[i]/max) * (H-24)
        ctx.fillStyle = compareColor
        ctx.beginPath()
        ctx.roundRect(x+barW+4, H-bh2-2, barW, bh2, [4,4,0,0])
        ctx.fill()
      }
      if (labels?.[i]) {
        ctx.fillStyle = '#888'
        ctx.font = '22px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i], i*gap+gap/2, H)
      }
    })
  }, [data, compareData, color, compareColor])
  return <canvas ref={canvasRef} width={800} height={height} style={{width:'100%',height}}/>
}

// ── HELPERS ──────────────────────────────────────────────
const fmt = n => (n||0).toLocaleString('sq-AL')
const fmtL = n => `${fmt(n)} L`
const months = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj']
const shortMonth = d => months[new Date(d).getMonth()]

function pct(a, b) {
  if (!b) return 0
  return Math.round(((a-b)/b)*100)
}

function StatCard({ icon, label, value, sub, subColor='#16a34a', trend, sparkData, color='#7c3aed' }) {
  return (
    <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22,display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:36,height:36,borderRadius:9,background:`${color}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{icon}</div>
          <div style={{fontSize:13,color:'#71717a',fontWeight:500}}>{label}</div>
        </div>
        {trend!==undefined && (
          <div style={{fontSize:12,fontWeight:700,color:trend>=0?'#16a34a':'#dc2626',background:trend>=0?'#f0fdf4':'#fef2f2',padding:'2px 8px',borderRadius:20}}>
            {trend>=0?'↑':'↓'}{Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{fontSize:32,fontWeight:900,color:'#18181b',lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:12,color:subColor,fontWeight:500}}>{sub}</div>}
      {sparkData && <LineChart data={sparkData} color={color} height={48}/>}
    </div>
  )
}

// ── FORECAST ─────────────────────────────────────────────
function calcForecast(monthlyData) {
  if (monthlyData.length < 2) return []
  // Simple linear regression
  const n = monthlyData.length
  const x = monthlyData.map((_,i) => i)
  const y = monthlyData
  const sumX = x.reduce((a,b)=>a+b,0)
  const sumY = y.reduce((a,b)=>a+b,0)
  const sumXY = x.reduce((a,b,i)=>a+b*y[i],0)
  const sumX2 = x.reduce((a,b)=>a+b*b,0)
  const slope = (n*sumXY - sumX*sumY)/(n*sumX2 - sumX*sumX)
  const intercept = (sumY - slope*sumX)/n
  // Project 3 months ahead
  return [1,2,3].map(i => Math.max(0, Math.round(slope*(n+i-1)+intercept)))
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function AnalyticsDashboard({ gymId }) {
  const [loading,  setLoading]  = useState(true)
  const [period,   setPeriod]   = useState('month') // month|year
  const [tab,      setTab]      = useState('overview') // overview|revenue|members|risk
  const [data,     setData]     = useState(null)
  const [atRisk,   setAtRisk]   = useState([])
  const [sending,  setSending]  = useState({})

  useEffect(() => { load() }, [gymId, period])

  async function load() {
    setLoading(true)
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth()-1, 1).toISOString()
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString()
      const day30ago = new Date(now-30*24*3600*1000).toISOString()
      const day60ago = new Date(now-60*24*3600*1000).toISOString()

      // ── Parallel queries
      const [
        { data: members },
        { data: payments },
        { data: checkins },
        { data: memberships },
        { data: paymentsYear },
        { data: riskMembers },
      ] = await Promise.all([
        supabase.from('members').select('id,first_name,last_name,email,phone,is_active,created_at').eq('gym_id', gymId),
        supabase.from('payments').select('amount,created_at,member_id').eq('gym_id', gymId).gte('created_at', monthStart),
        supabase.from('checkins').select('created_at,member_id').eq('gym_id', gymId).gte('created_at', monthStart),
        supabase.from('member_memberships').select('*,plan:plans(name,price)').eq('gym_id', gymId),
        supabase.from('payments').select('amount,created_at').eq('gym_id', gymId).gte('created_at', yearStart),
        // At-risk: active members who haven't checked in 30+ days
        supabase.from('members').select('id,first_name,last_name,phone,email,last_checkin').eq('gym_id', gymId).eq('is_active', true).or(`last_checkin.lte.${day30ago},last_checkin.is.null`).limit(50),
      ])

      // ── Prev month payments
      const { data: prevPayments } = await supabase.from('payments').select('amount').eq('gym_id', gymId).gte('created_at', prevMonthStart).lte('created_at', prevMonthEnd)

      // ── This month calc
      const thisRevenue = (payments||[]).reduce((s,p) => s+(p.amount||0), 0)
      const prevRevenue = (prevPayments||[]).reduce((s,p) => s+(p.amount||0), 0)

      // ── Members this month vs prev
      const newThisMonth = (members||[]).filter(m => m.created_at >= monthStart).length
      const newPrevMonth = (members||[]).filter(m => m.created_at >= prevMonthStart && m.created_at <= prevMonthEnd).length

      // ── Active members
      const activeMembers = (members||[]).filter(m => m.is_active).length
      const totalMembers = (members||[]).length

      // ── Checkins today
      const today = now.toISOString().split('T')[0]
      const todayCheckins = (checkins||[]).filter(c => c.created_at?.startsWith(today)).length

      // ── Revenue by month (last 12)
      const revenueByMonth = Array(12).fill(0)
      ;(paymentsYear||[]).forEach(p => {
        const m = new Date(p.created_at).getMonth()
        revenueByMonth[m] += p.amount||0
      })

      // ── Checkins by day (last 30)
      const checkinsByDay = {}
      ;(checkins||[]).forEach(c => {
        const d = c.created_at?.split('T')[0]
        if (d) checkinsByDay[d] = (checkinsByDay[d]||0)+1
      })
      const last30Days = Array.from({length:30},(_,i)=>{
        const d = new Date(now-((29-i)*24*3600*1000))
        return checkinsByDay[d.toISOString().split('T')[0]] || 0
      })

      // ── Members by month (last 6)
      const membersByMonth = Array(6).fill(0)
      ;(members||[]).forEach(m => {
        const mo = new Date(m.created_at).getMonth()
        const idx = 5 - (now.getMonth()-mo+12)%12
        if (idx>=0) membersByMonth[idx]++
      })

      // ── Forecast
      const validMonths = revenueByMonth.slice(0, now.getMonth()+1).filter(v=>v>0)
      const forecast = calcForecast(validMonths)

      // ── Expiring soon (7 days)
      const in7 = new Date(now.getTime()+7*24*3600*1000).toISOString()
      const { data: expiring } = await supabase.from('member_memberships').select('*,member:members(first_name,last_name,phone),plan:plans(name)').eq('gym_id', gymId).eq('status','active').lte('end_date', in7).gte('end_date', now.toISOString())

      // ── Debtors
      const { data: debtors } = await supabase.from('members').select('id,first_name,last_name,phone,balance').eq('gym_id', gymId).lt('balance', 0).order('balance').limit(20)

      // ── At-risk: sort by days since last checkin
      const riskSorted = (riskMembers||[]).map(m => ({
        ...m,
        daysSince: m.last_checkin
          ? Math.floor((now - new Date(m.last_checkin))/(24*3600*1000))
          : 99
      })).sort((a,b) => b.daysSince-a.daysSince)

      setAtRisk(riskSorted)
      setData({
        thisRevenue, prevRevenue,
        revenueTrend: pct(thisRevenue, prevRevenue),
        activeMembers, totalMembers,
        newThisMonth, newPrevMonth,
        memberTrend: pct(newThisMonth, newPrevMonth),
        todayCheckins,
        revenueByMonth,
        last30Days,
        membersByMonth,
        forecast,
        expiring: expiring||[],
        debtors: debtors||[],
        avgRevPerMember: activeMembers ? Math.round(thisRevenue/activeMembers) : 0,
        retentionRate: totalMembers ? Math.round(activeMembers/totalMembers*100) : 0,
      })
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function sendAtRiskSMS(member) {
    setSending(s=>({...s,[member.id]:true}))
    try {
      const { smsMembershipExpiring } = await import('../../lib/sms')
      // Use a generic "we miss you" approach
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`},
        body: JSON.stringify({
          type: 'membership_expiring',
          to: member.phone,
          data: { plan:'Anëtar', days: member.daysSince+' ditë pa vizitë', expiry:'—', gym:'Palestra', phone:'' }
        })
      })
    } catch(e){}
    finally { setSending(s=>({...s,[member.id]:false})) }
  }

  const TABS = [
    {id:'overview', l:'📊 Pasqyra'},
    {id:'revenue',  l:'💰 Të Ardhurat'},
    {id:'members',  l:'👥 Anëtarët'},
    {id:'risk',     l:`⚠️ At-Risk (${atRisk.length})`},
  ]

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:80,color:'#71717a',gap:12,fontFamily:'system-ui'}}>
      <div style={{width:20,height:20,border:'2px solid #e4e4e7',borderTopColor:'#7c3aed',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
      Duke ngarkuar analitikën...
    </div>
  )

  if (!data) return null

  return (
    <div className="page-in" style={{fontFamily:'system-ui,sans-serif'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}.ar-row:hover{background:#fafafa!important}`}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontFamily:"'Georgia',serif",fontSize:22,fontWeight:900,marginBottom:4}}>📊 Analytics Avancuar</div>
          <div style={{fontSize:13,color:'#71717a'}}>Të dhëna live · Përditësohet automatikisht</div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button onClick={load} style={{background:'#f4f4f5',border:'none',padding:'7px 14px',borderRadius:8,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>↻ Rifresko</button>
          <div style={{display:'flex',background:'#f4f4f5',borderRadius:9,padding:3,gap:2}}>
            {[['month','Muaji'],['year','Viti']].map(([v,l])=>(
              <button key={v} onClick={()=>setPeriod(v)} style={{padding:'6px 16px',borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',background:period===v?'#fff':'transparent',color:period===v?'#18181b':'#71717a',boxShadow:period===v?'0 1px 4px rgba(0,0,0,.08)':'none',transition:'all .15s'}}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{display:'flex',gap:6,marginBottom:24,borderBottom:'1px solid #f0f0f0',paddingBottom:0,overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'10px 18px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',color:tab===t.id?'#7c3aed':'#71717a',borderBottom:`2px solid ${tab===t.id?'#7c3aed':'transparent'}`,marginBottom:-1,whiteSpace:'nowrap',transition:'all .15s'}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab==='overview' && (
        <>
          {/* KPI row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:14,marginBottom:24}}>
            <StatCard icon="💰" label="Të ardhura këtë muaj" value={fmtL(data.thisRevenue)} sub={`vs ${fmtL(data.prevRevenue)} muajin paraardhës`} trend={data.revenueTrend} sparkData={data.revenueByMonth.slice(-6)} color="#7c3aed"/>
            <StatCard icon="👥" label="Anëtarë aktivë" value={data.activeMembers} sub={`${data.newThisMonth} të rinj këtë muaj`} trend={data.memberTrend} sparkData={data.membersByMonth} color="#2563eb"/>
            <StatCard icon="🚪" label="Hyrje sot" value={data.todayCheckins} sub={`${data.last30Days.reduce((a,b)=>a+b,0)} hyrje 30 ditët e fundit`} sparkData={data.last30Days} color="#16a34a"/>
            <StatCard icon="📈" label="Të ardhura / anëtar" value={fmtL(data.avgRevPerMember)} sub={`Retention: ${data.retentionRate}%`} color="#d97706"/>
          </div>

          {/* Two columns */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            {/* Revenue chart */}
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14}}>💰 Të Ardhurat 12 Muajt</div>
                <div style={{fontSize:11,color:'#71717a'}}>L / muaj</div>
              </div>
              <BarChart data={data.revenueByMonth} labels={months} color="#7c3aed" height={140}/>
            </div>

            {/* Checkins chart */}
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:22}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14}}>🚪 Hyrjet — 30 ditët e fundit</div>
                <div style={{fontSize:11,color:'#71717a'}}>hyrje/ditë</div>
              </div>
              <LineChart data={data.last30Days} color="#16a34a" height={140}/>
            </div>
          </div>

          {/* Forecast + Alerts */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {/* Forecast */}
            <div style={{background:'linear-gradient(135deg,#18181b,#2d1b69)',borderRadius:14,padding:24,color:'#fff'}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>🔮 Forecast — 3 Muajt e Ardhshëm</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.4)',marginBottom:20}}>Bazuar në trendin aktual</div>
              {data.forecast.map((v,i) => {
                const mo = (new Date().getMonth()+i+1)%12
                return (
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                    <div style={{fontSize:13,color:'rgba(255,255,255,.6)'}}>{months[mo]}</div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:Math.max(20,(v/Math.max(...data.forecast,1))*120),height:6,background:'#7c3aed',borderRadius:3}}/>
                      <div style={{fontWeight:700,fontSize:14,color:'#c8a96e',minWidth:80,textAlign:'right'}}>{fmtL(v)}</div>
                    </div>
                  </div>
                )
              })}
              <div style={{marginTop:16,fontSize:11,color:'rgba(255,255,255,.25)'}}>⚠️ Forecast bazuar në të dhënat historike — jo i garantuar</div>
            </div>

            {/* Alerts */}
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🔔 Alarmet e Ditës</div>
              {[
                data.expiring.length>0 && { color:'#fef3c7', border:'#fde68a', ico:'⚠️', text:`${data.expiring.length} abonim skadojnë brenda 7 ditëve` },
                data.debtors.length>0  && { color:'#fef2f2', border:'#fecaca', ico:'🔴', text:`${data.debtors.length} klientë me borxh` },
                atRisk.length>0        && { color:'#eff6ff', border:'#bfdbfe', ico:'💤', text:`${atRisk.length} anëtarë nuk kanë ardhur 30+ ditë` },
                data.todayCheckins===0 && { color:'#f5f3ff', border:'#ddd6fe', ico:'🚪', text:'Asnjë hyrje sot — aksesi aktiv?' },
              ].filter(Boolean).map((alert, i) => alert && (
                <div key={i} style={{background:alert.color,border:`1px solid ${alert.border}`,borderRadius:9,padding:'10px 14px',marginBottom:8,fontSize:13}}>
                  {alert.ico} {alert.text}
                </div>
              ))}
              {data.expiring.length===0&&data.debtors.length===0&&atRisk.length===0&&(
                <div style={{textAlign:'center',color:'#71717a',padding:'20px 0',fontSize:13}}>✅ Gjithçka në rregull sot!</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── REVENUE TAB ── */}
      {tab==='revenue' && (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
            <StatCard icon="💰" label="Ky muaj" value={fmtL(data.thisRevenue)} trend={data.revenueTrend} color="#7c3aed"/>
            <StatCard icon="📅" label="Muaji i kaluar" value={fmtL(data.prevRevenue)} color="#52525b"/>
            <StatCard icon="📆" label="Ky vit (total)" value={fmtL(data.revenueByMonth.reduce((a,b)=>a+b,0))} color="#d97706"/>
          </div>

          {/* Monthly comparison chart */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontWeight:700,fontSize:15}}>📊 Krahasim Mujor — Viti Aktual</div>
              <div style={{display:'flex',gap:14,fontSize:12}}>
                <span style={{display:'flex',alignItems:'center',gap:5}}><span style={{width:12,height:12,borderRadius:2,background:'#7c3aed',display:'inline-block'}}/> Ky vit</span>
              </div>
            </div>
            <BarChart data={data.revenueByMonth} labels={months} color="#7c3aed" height={200}/>
          </div>

          {/* Forecast */}
          <div style={{background:'linear-gradient(135deg,#18181b,#2d1b69)',borderRadius:14,padding:28,color:'#fff'}}>
            <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>🔮 Forecast të Ardhurash — 3 Muajt e Ardhshëm</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.4)',marginBottom:24}}>Analizë e trendit linear bazuar në të dhënat historike</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {data.forecast.map((v,i) => {
                const mo = (new Date().getMonth()+i+1)%12
                const prev = i===0 ? data.revenueByMonth[new Date().getMonth()] : data.forecast[i-1]
                const diff = pct(v, prev)
                return (
                  <div key={i} style={{background:'rgba(255,255,255,.06)',borderRadius:12,padding:20,textAlign:'center'}}>
                    <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:8}}>{months[mo]}</div>
                    <div style={{fontFamily:"'Georgia',serif",fontSize:36,fontWeight:900,color:'#c8a96e',marginBottom:6}}>{fmtL(v)}</div>
                    <div style={{fontSize:11,color:diff>=0?'#4ade80':'#f87171',fontWeight:600}}>{diff>=0?'↑':'↓'}{Math.abs(diff)}% vs muaj i kaluar</div>
                  </div>
                )
              })}
            </div>
            <div style={{marginTop:20,fontSize:11,color:'rgba(255,255,255,.2)',textAlign:'center'}}>Forecast është estimim — jo parashikim i garantuar</div>
          </div>

          {/* Debtors */}
          {data.debtors.length>0 && (
            <div style={{background:'#fff',border:'1px solid #fecaca',borderRadius:14,padding:24,marginTop:16}}>
              <div style={{fontWeight:700,fontSize:14,color:'#dc2626',marginBottom:16}}>🔴 Borxhet — {data.debtors.length} klientë</div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{borderBottom:'2px solid #f5f5f5'}}>
                    {['Emri','Telefon','Borxhi','Veprim'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',color:'#71717a',fontWeight:600}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {data.debtors.map(d=>(
                      <tr key={d.id} className="ar-row" style={{borderBottom:'1px solid #f8f8f8',transition:'background .15s'}}>
                        <td style={{padding:'10px 12px',fontWeight:600}}>{d.first_name} {d.last_name}</td>
                        <td style={{padding:'10px 12px',color:'#71717a'}}>{d.phone||'—'}</td>
                        <td style={{padding:'10px 12px',fontWeight:700,color:'#dc2626'}}>{Math.abs(d.balance).toLocaleString('sq-AL')} L</td>
                        <td style={{padding:'10px 12px'}}>
                          {d.phone&&<a href={`tel:${d.phone}`} style={{background:'#18181b',color:'#fff',padding:'5px 12px',borderRadius:7,fontSize:12,fontWeight:600,textDecoration:'none'}}>📞 Telefono</a>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab==='members' && (
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
            <StatCard icon="👥" label="Total anëtarë" value={data.totalMembers} color="#18181b"/>
            <StatCard icon="✅" label="Aktivë" value={data.activeMembers} color="#16a34a" sub={`${data.retentionRate}% retention rate`}/>
            <StatCard icon="🆕" label="Të rinj ky muaj" value={data.newThisMonth} trend={data.memberTrend} color="#2563eb"/>
            <StatCard icon="⚠️" label="Abonim skadon (7 ditë)" value={data.expiring.length} color="#d97706" subColor="#d97706" sub={data.expiring.length>0?'Kontakto tani':'Asnjë skadon'}/>
          </div>

          {/* Members chart */}
          <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginBottom:16}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>👥 Anëtarë të Rinj — 6 Muajt e Fundit</div>
            <BarChart data={data.membersByMonth} labels={months.slice(Math.max(0,new Date().getMonth()-5),new Date().getMonth()+1)} color="#2563eb" height={160}/>
          </div>

          {/* Expiring */}
          {data.expiring.length>0 && (
            <div style={{background:'#fff',border:'1px solid #fde68a',borderRadius:14,padding:24}}>
              <div style={{fontWeight:700,fontSize:14,color:'#92400e',marginBottom:16}}>⚠️ Abonimi Skadon Brenda 7 Ditëve</div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{borderBottom:'2px solid #f5f5f5'}}>
                    {['Anëtari','Plani','Skadon','Veprim'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',color:'#71717a',fontWeight:600}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {data.expiring.map(e=>(
                      <tr key={e.id} className="ar-row" style={{borderBottom:'1px solid #f8f8f8'}}>
                        <td style={{padding:'10px 12px',fontWeight:600}}>{e.member?.first_name} {e.member?.last_name}</td>
                        <td style={{padding:'10px 12px',color:'#71717a'}}>{e.plan?.name}</td>
                        <td style={{padding:'10px 12px',color:'#d97706',fontWeight:600}}>{new Date(e.end_date).toLocaleDateString('sq-AL')}</td>
                        <td style={{padding:'10px 12px',display:'flex',gap:6}}>
                          {e.member?.phone&&<a href={`tel:${e.member.phone}`} style={{background:'#18181b',color:'#fff',padding:'5px 10px',borderRadius:7,fontSize:12,fontWeight:600,textDecoration:'none'}}>📞</a>}
                          {e.member?.phone&&<button style={{background:'#7c3aed',color:'#fff',padding:'5px 10px',borderRadius:7,fontSize:12,fontWeight:600,border:'none',cursor:'pointer',fontFamily:'inherit'}}>📱 SMS</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── AT-RISK TAB ── */}
      {tab==='risk' && (
        <>
          <div style={{background:'linear-gradient(135deg,#fffbeb,#fef3c7)',border:'1px solid #fde68a',borderRadius:14,padding:20,marginBottom:20,display:'flex',gap:16,alignItems:'center'}}>
            <div style={{fontSize:36}}>💤</div>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:'#92400e'}}>Anëtarë At-Risk — {atRisk.length} persona</div>
              <div style={{fontSize:13,color:'#78350f',lineHeight:1.6}}>Këta anëtarë janë aktivë por nuk kanë ardhur prej 30+ ditësh. Kontaktojini para se të humbasni abonimin.</div>
            </div>
          </div>

          {/* Risk stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
            {[
              ['30-45 ditë','⚠️',atRisk.filter(m=>m.daysSince>=30&&m.daysSince<45).length,'#d97706','#fffbeb'],
              ['45-60 ditë','🔴',atRisk.filter(m=>m.daysSince>=45&&m.daysSince<60).length,'#dc2626','#fef2f2'],
              ['60+ ditë','💀',atRisk.filter(m=>m.daysSince>=60).length,'#7f1d1d','#fef2f2'],
            ].map(([label,ico,count,color,bg])=>(
              <div key={label} style={{background:bg,border:`1px solid ${color}30`,borderRadius:12,padding:18,textAlign:'center'}}>
                <div style={{fontSize:28,marginBottom:6}}>{ico}</div>
                <div style={{fontFamily:"'Georgia',serif",fontSize:36,fontWeight:900,color,lineHeight:1}}>{count}</div>
                <div style={{fontSize:12,color:'#71717a',marginTop:4}}>{label}</div>
              </div>
            ))}
          </div>

          {/* At-risk table */}
          {atRisk.length===0 ? (
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:14,padding:40,textAlign:'center'}}>
              <div style={{fontSize:48,marginBottom:12}}>🎉</div>
              <div style={{fontFamily:"'Georgia',serif",fontSize:20,fontWeight:700,color:'#15803d'}}>Asnjë anëtar at-risk!</div>
              <div style={{fontSize:14,color:'#52525b',marginTop:8}}>Të gjithë anëtarët aktivë kanë vizituar brenda 30 ditëve të fundit.</div>
            </div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{background:'#fafafa',borderBottom:'1px solid #e4e4e7'}}>
                    {['Anëtari','Telefon','Email','Ditë pa vizitë','Rreziku','Veprim'].map(h=>(
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontWeight:700,color:'#52525b',fontSize:12,textTransform:'uppercase',letterSpacing:'.04em'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {atRisk.map(m => {
                    const risk = m.daysSince>=60?'💀 Kritik':m.daysSince>=45?'🔴 I Lartë':'⚠️ Mesatar'
                    const riskColor = m.daysSince>=60?'#dc2626':m.daysSince>=45?'#d97706':'#92400e'
                    const riskBg = m.daysSince>=60?'#fef2f2':m.daysSince>=45?'#fffbeb':'#fefce8'
                    return (
                      <tr key={m.id} className="ar-row" style={{borderBottom:'1px solid #f5f5f5',transition:'background .15s'}}>
                        <td style={{padding:'12px 16px',fontWeight:600}}>{m.first_name} {m.last_name}</td>
                        <td style={{padding:'12px 16px',color:'#52525b'}}>{m.phone||'—'}</td>
                        <td style={{padding:'12px 16px',color:'#71717a',fontSize:12}}>{m.email||'—'}</td>
                        <td style={{padding:'12px 16px'}}>
                          <span style={{fontWeight:700,fontSize:18,color:riskColor}}>{m.daysSince}</span>
                          <span style={{fontSize:11,color:'#a1a1aa',marginLeft:4}}>ditë</span>
                        </td>
                        <td style={{padding:'12px 16px'}}>
                          <span style={{background:riskBg,color:riskColor,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{risk}</span>
                        </td>
                        <td style={{padding:'12px 16px'}}>
                          <div style={{display:'flex',gap:6}}>
                            {m.phone&&<a href={`tel:${m.phone}`} style={{background:'#18181b',color:'#fff',padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,textDecoration:'none',display:'inline-block'}}>📞 Telefono</a>}
                            {m.phone&&(
                              <button onClick={()=>sendAtRiskSMS(m)} disabled={sending[m.id]} style={{background:sending[m.id]?'#f4f4f5':'#7c3aed',color:sending[m.id]?'#71717a':'#fff',padding:'6px 12px',borderRadius:8,fontSize:12,fontWeight:600,border:'none',cursor:sending[m.id]?'wait':'pointer',fontFamily:'inherit'}}>
                                {sending[m.id]?'..':'📱 SMS'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tips */}
          <div style={{background:'#f8f8f8',borderRadius:12,padding:20,marginTop:16}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:12}}>💡 Strategji për At-Risk Klientët</div>
            {[
              ['📞','Telefono personalisht','Thirrja personale ka 3x më shumë sukses se SMS.'],
              ['🎁','Oferta speciale','Ofro sesion falas ose zbritje 20% për rikthim.'],
              ['📱','SMS kujtues','Dërgo SMS të personalizuar me emrin e tyre.'],
              ['🤝','Takimi personal','Fto për takrim personal me trajnerin.'],
            ].map(([ico,t,d])=>(
              <div key={t} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:'1px solid #f0f0f0'}}>
                <span style={{fontSize:16,flexShrink:0}}>{ico}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{t}</div>
                  <div style={{fontSize:12,color:'#71717a'}}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
