import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { ExploreMap } from '../../components/Map'

const BIZ_TYPES = {
  all:          { label:'Të Gjitha',      icon:'🌟' },
  gym:          { label:'Palestra',       icon:'🏋️' },
  barbershop:   { label:'Barbershop',     icon:'💈' },
  salon:        { label:'Sallon',         icon:'💅' },
  spa:          { label:'Spa & Masazh',   icon:'💆' },
  yoga:         { label:'Yoga & Pilates', icon:'🧘' },
  martial_arts: { label:'Arte Marciale',  icon:'🥊' },
}

const CITIES = ['Të Gjitha', 'Tiranë', 'Durrës', 'Shkodër', 'Vlorë', 'Elbasan', 'Korçë', 'Fier', 'Berat', 'Lushnjë']

async function getBusinesses(type, city, search) {
  let q = supabase.from('public_businesses').select('*')
  if (type && type !== 'all') q = q.eq('business_type', type)
  if (city && city !== 'Të Gjitha') q = q.eq('city', city)
  if (search) q = q.ilike('name', `%${search}%`)
  q = q.order('rating', { ascending:false })
  const { data } = await q
  return data ?? []
}

function Stars({ rating, size=14 }) {
  const r = parseFloat(rating) || 0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ fontSize:size, color: i<=Math.round(r) ? '#f59e0b' : '#e4e4e7' }}>★</div>
      ))}
      {r > 0 && <span style={{ fontSize:size-2, fontWeight:600, color:'#71717a', marginLeft:2 }}>{r.toFixed(1)}</span>}
    </div>
  )
}

function BusinessCard({ biz, onClick }) {
  const type = BIZ_TYPES[biz.business_type] || BIZ_TYPES.gym
  const services = biz.top_services || []

  return (
    <div onClick={onClick} style={{ background:'#fff', borderRadius:16, border:'1px solid #e4e4e7', overflow:'hidden', cursor:'pointer', transition:'all .2s', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,.1)' }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)' }}>

      {/* Cover */}
      <div style={{ height:140, background: biz.cover_url ? `url(${biz.cover_url}) center/cover` : 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {!biz.cover_url && <div style={{ fontSize:52, opacity:.3 }}>{type.icon}</div>}
        <div style={{ position:'absolute', top:12, left:12, background:'rgba(0,0,0,.5)', backdropFilter:'blur(8px)', borderRadius:20, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#fff' }}>
          {type.icon} {type.label}
        </div>
        {biz.rating > 4.5 && (
          <div style={{ position:'absolute', top:12, right:12, background:'#f59e0b', borderRadius:20, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#fff' }}>⭐ Top</div>
        )}
        {biz.logo_url && (
          <div style={{ position:'absolute', bottom:-24, left:18, width:48, height:48, borderRadius:12, background:'#fff', border:'2px solid #fff', boxShadow:'0 4px 12px rgba(0,0,0,.1)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            <img src={biz.logo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: biz.logo_url ? '32px 18px 18px' : '18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:3 }}>{biz.name}</div>
            <div style={{ fontSize:12, color:'#71717a' }}>📍 {biz.city} {biz.address && `· ${biz.address}`}</div>
          </div>
        </div>

        {biz.rating > 0 && (
          <div style={{ marginBottom:10 }}>
            <Stars rating={biz.rating}/>
            {biz.review_count > 0 && <span style={{ fontSize:11, color:'#a1a1aa', marginLeft:4 }}>({biz.review_count} vlerësime)</span>}
          </div>
        )}

        {biz.description && (
          <div style={{ fontSize:13, color:'#52525b', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {biz.description}
          </div>
        )}

        {/* Services preview */}
        {services.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            {services.slice(0,3).map((s,i) => (
              <div key={i} style={{ background:'#fafafa', border:'1px solid #e4e4e7', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#52525b' }}>
                {s.emoji} {s.name} <span style={{ fontWeight:600 }}>{s.price?.toLocaleString('sq-AL')} L</span>
              </div>
            ))}
            {services.length > 3 && <div style={{ background:'#f4f4f5', borderRadius:8, padding:'4px 10px', fontSize:12, color:'#71717a' }}>+{services.length-3}</div>}
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:12, fontSize:12, color:'#71717a' }}>
            {biz.staff_count > 0 && <span>👥 {biz.staff_count} staf</span>}
            {biz.service_count > 0 && <span>✂️ {biz.service_count} shërbime</span>}
          </div>
          <button style={{ background:'#18181b', color:'#fff', border:'none', padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
            Rezervo →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Explore() {
  const [businesses, setBusinesses] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [type,       setType]       = useState('all')
  const [city,       setCity]       = useState('Të Gjitha')
  const [search,     setSearch]     = useState('')
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [viewMode,   setViewMode]   = useState('list') // list | map

  useEffect(() => {
    const t = setTimeout(() => load(), 300)
    return () => clearTimeout(t)
  }, [type, city, search])

  const load = async () => {
    setLoading(true)
    const data = await getBusinesses(type, city, search)
    setBusinesses(data)
    setLoading(false)
  }

  const go = p => window.location.pathname = p

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', fontFamily:"'Geist',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .biz-type-btn{border:none;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap}
        .search-inp{border:1.5px solid #e4e4e7;outline:none;font-family:inherit;transition:all .15s;background:#fff}
        .search-inp:focus{border-color:#18181b;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
        @media(max-width:768px){
          .hero-text{font-size:32px!important}
          .filters{flex-direction:column!important}
          .grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #e4e4e7', padding:'0 32px', height:58, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <button onClick={()=>go('/')} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:30, height:30, borderRadius:7, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>💪</div>
          <span style={{ fontWeight:800, fontSize:16, color:'#18181b' }}>Vaqo</span>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>go('/login')} style={{ background:'none', border:'1px solid #e4e4e7', color:'#18181b', padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Hyr</button>
          <button onClick={()=>go('/apply')} style={{ background:'#18181b', color:'#fff', border:'none', padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Regjistro Biznesin</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#18181b 0%,#1e293b 100%)', padding:'56px 32px 48px', textAlign:'center' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.1)', borderRadius:100, padding:'5px 14px', fontSize:11, fontWeight:700, color:'rgba(255,255,255,.7)', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:24 }}>
            🌟 150+ Biznese Wellness në Shqipëri
          </div>
          <h1 className="hero-text" style={{ fontFamily:"'Instrument Serif',serif", fontSize:48, fontWeight:900, color:'#fff', lineHeight:1.1, letterSpacing:'-.02em', marginBottom:14 }}>
            Gjej dhe Rezervo<br/>
            <span style={{ color:'#c8a96e' }}>Biznesin e Duhur</span>
          </h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,.55)', lineHeight:1.7, marginBottom:32 }}>
            Palestra, barbershop, sallon, spa, yoga — rezervo online tek bizneset më të mira shqiptare.
          </p>

          {/* Search bar */}
          <div style={{ background:'#fff', borderRadius:14, padding:6, display:'flex', gap:6, maxWidth:560, margin:'0 auto', boxShadow:'0 8px 32px rgba(0,0,0,.2)' }}>
            <div style={{ position:'relative', flex:1 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#a1a1aa' }}>🔍</span>
              <input
                className="search-inp"
                placeholder="Kërko biznes..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
                style={{ width:'100%', padding:'11px 12px 11px 38px', borderRadius:10, fontSize:14 }}
              />
            </div>
            <select value={city} onChange={e=>setCity(e.target.value)}
              style={{ border:'1px solid #e4e4e7', borderRadius:10, padding:'11px 12px', fontSize:14, fontFamily:'inherit', background:'#fafafa', color:'#18181b', cursor:'pointer', outline:'none' }}>
              {CITIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TYPE FILTERS */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e4e4e7', padding:'0 32px', overflowX:'auto' }}>
        <div style={{ display:'flex', gap:4, padding:'10px 0', minWidth:'max-content' }}>
          {Object.entries(BIZ_TYPES).map(([k,v])=>(
            <button key={k} className="biz-type-btn"
              onClick={()=>setType(k)}
              style={{ padding:'8px 16px', borderRadius:20, fontSize:13, fontWeight:600, background:type===k?'#18181b':'transparent', color:type===k?'#fff':'#52525b', border:`1px solid ${type===k?'#18181b':'transparent'}` }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'32px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div style={{ fontSize:14, color:'#71717a', fontWeight:500 }}>
            {loading ? 'Duke kërkuar...' : `${businesses.length} biznese ${type!=='all'?BIZ_TYPES[type]?.label:''}${city!=='Të Gjitha'?' në '+city:''}`}
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={()=>setViewMode('list')} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #e4e4e7', background:viewMode==='list'?'#18181b':'#fff', color:viewMode==='list'?'#fff':'#52525b', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>☰ Lista</button>
            <button onClick={()=>setViewMode('map')}  style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #e4e4e7', background:viewMode==='map'?'#18181b':'#fff',  color:viewMode==='map'?'#fff':'#52525b',  fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>🗺️ Harta</button>
          </div>
        </div>

        {/* MAP VIEW */}
        {viewMode==='map' && !loading && (
          <div style={{ marginBottom:24 }}>
            <ExploreMap
              businesses={businesses}
              onSelect={biz=>window.location.href=`/b/${biz.slug}`}
              style={{ height:500 }}
            />
          </div>
        )}

        {viewMode==='list' && loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }} className="grid">
            {[1,2,3,4,5,6].map(i=>(
              <div key={i} style={{ background:'#fff', borderRadius:16, border:'1px solid #e4e4e7', overflow:'hidden' }}>
                <div style={{ height:140, background:'linear-gradient(90deg,#f4f4f5 25%,#e4e4e7 50%,#f4f4f5 75%)', backgroundSize:'400% 100%', animation:'shimmer 1.5s infinite' }}/>
                <div style={{ padding:18 }}>
                  {[80,60,100].map((w,j)=>(
                    <div key={j} style={{ height:12, background:'#f4f4f5', borderRadius:6, marginBottom:10, width:`${w}%` }}/>
                  ))}
                </div>
              </div>
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : businesses.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <div style={{ fontSize:56, marginBottom:16, opacity:.3 }}>🔍</div>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, marginBottom:8 }}>Asnjë biznes nuk u gjet</div>
            <div style={{ fontSize:14, color:'#71717a', marginBottom:24 }}>Provo të ndryshosh filtrat ose qytetin</div>
            <button onClick={()=>{setType('all');setCity('Të Gjitha');setSearch('')}} style={{ background:'#18181b', color:'#fff', border:'none', padding:'10px 24px', borderRadius:9, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              Pastro Filtrat
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20, animation:'fadeUp .3s ease' }} className="grid">
            {businesses.map(biz=>(
              <BusinessCard key={biz.id} biz={biz} onClick={()=>go(`/b/${biz.slug}`)}/>
            ))}
          </div>
        )}

        {/* CTA for businesses */}
        <div style={{ marginTop:60, background:'#18181b', borderRadius:20, padding:'40px 32px', textAlign:'center', color:'#fff' }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🏢</div>
          <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:26, marginBottom:10 }}>Je pronar biznesi?</div>
          <div style={{ fontSize:15, color:'rgba(255,255,255,.5)', marginBottom:24, lineHeight:1.7 }}>
            Regjistro biznesin tënd dhe fillo të marrësh rezervime online sot.
          </div>
          <button onClick={()=>go('/apply')} style={{ background:'#c8a96e', color:'#fff', border:'none', padding:'13px 32px', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
            Regjistro Biznesin Falas →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background:'#0a0a0a', color:'rgba(255,255,255,.3)', padding:'24px 32px', textAlign:'center', fontSize:12, marginTop:40 }}>
        © 2026 Vaqo — Platforma Wellness #1 në Shqipëri 🇦🇱 &nbsp;·&nbsp;
        <button onClick={()=>go('/')} style={{ color:'rgba(255,255,255,.4)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>Kryefaqja</button>
        &nbsp;·&nbsp;
        <button onClick={()=>go('/login')} style={{ color:'rgba(255,255,255,.4)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:12 }}>Hyr</button>
      </div>
    </div>
  )
}
