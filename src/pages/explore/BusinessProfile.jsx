import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { fmtNum } from '../../lib/db'
import { BusinessMap } from '../../components/Map'
import { BookingModal } from '../../components/Booking'

const BIZ_TYPES = {
  gym:'🏋️ Palestre', barbershop:'💈 Barbershop', salon:'💅 Sallon',
  spa:'💆 Spa & Masazh', yoga:'🧘 Yoga Studio', pilates:'🤸 Pilates',
  martial_arts:'🥊 Arte Marciale', other:'🏢 Biznes',
}
const LEVELS = { beginner:'🟢 Fillestar', intermediate:'🟡 Mesatar', advanced:'🔴 Avancuar', all:'⚪ Të Gjithë' }

function Stars({ rating, size=16 }) {
  const r = parseFloat(rating)||0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      {[1,2,3,4,5].map(i=>(
        <span key={i} style={{ fontSize:size, color:i<=Math.round(r)?'#f59e0b':'#e4e4e7' }}>★</span>
      ))}
    </div>
  )
}

async function getBusiness(slug) {
  const { data } = await supabase.from('public_businesses').select('*').eq('slug', slug).single()
  return data
}
async function getStaff(gymId) {
  const { data } = await supabase.from('staff').select('*').eq('gym_id', gymId).eq('is_active', true).order('name')
  return data??[]
}
async function getServices(gymId) {
  const { data } = await supabase.from('services').select('*').eq('gym_id', gymId).eq('is_active', true).order('sort_order')
  return data??[]
}
async function getUpcomingClasses(gymId) {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('yoga_classes')
    .select('*, instructor:staff(name), bookings:yoga_bookings(id,status)')
    .eq('gym_id', gymId).gte('date', today).eq('is_cancelled', false)
    .order('date').order('start_time').limit(10)
  return data??[]
}
async function getReviews(gymId) {
  const { data } = await supabase.from('gym_reviews').select('*').eq('gym_id', gymId).eq('is_public', true).order('created_at', { ascending:false }).limit(10)
  return data??[]
}

export default function BusinessProfile() {
  const slug = window.location.pathname.replace('/b/','')
  const [biz,      setBiz]      = useState(null)
  const [staff,    setStaff]    = useState([])
  const [services, setServices] = useState([])
  const [classes,  setClasses]  = useState([])
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState('services')
  const [showBook, setShowBook] = useState(false)
  const [selService, setSelService] = useState(null)
  const [selStaff,   setSelStaff]   = useState(null)
  const [notFound, setNotFound] = useState(false)

  const isAppointmentBased = biz && ['barbershop','salon','spa'].includes(biz.business_type)
  const isClassBased       = biz && ['yoga','pilates','martial_arts'].includes(biz.business_type)
  const isGym              = biz && biz.business_type === 'gym'

  useEffect(() => {
    load()
  }, [slug])

  const load = async () => {
    setLoading(true)
    const b = await getBusiness(slug)
    if (!b) { setNotFound(true); setLoading(false); return }
    setBiz(b)
    const [s, sv, cl, r] = await Promise.all([
      getStaff(b.id), getServices(b.id), getUpcomingClasses(b.id), getReviews(b.id)
    ])
    setStaff(s); setServices(sv); setClasses(cl); setReviews(r)
    setLoading(false)
    if (isClassBased) setTab('classes')
  }

  const go = p => window.location.pathname = p

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', fontFamily:"'Geist',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:32, height:32, border:'3px solid #e4e4e7', borderTopColor:'#18181b', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 12px' }}/>
        <div style={{ fontSize:14, color:'#71717a' }}>Duke ngarkuar...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', fontFamily:"'Geist',sans-serif", padding:24 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>😕</div>
        <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, marginBottom:10 }}>Biznesi nuk u gjet</div>
        <div style={{ fontSize:14, color:'#71717a', marginBottom:24 }}>Linku mund të jetë i gabuar ose biznesi nuk ekziston.</div>
        <button onClick={()=>go('/explore')} style={{ background:'#18181b', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>← Kthehu te Explore</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', fontFamily:"'Geist',-apple-system,sans-serif", color:'#18181b' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .svc-card:hover{background:#fafafa!important;border-color:#18181b!important}
        .staff-card:hover{transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(0,0,0,.08)!important}
        @media(max-width:768px){
          .layout{grid-template-columns:1fr!important}
          .sticky-card{position:static!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #e4e4e7', padding:'0 24px', height:54, display:'flex', alignItems:'center', gap:12, position:'sticky', top:0, zIndex:100 }}>
        <button onClick={()=>go('/explore')} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', color:'#52525b', fontSize:13, fontWeight:500, fontFamily:'inherit', padding:0 }}>
          ← Explore
        </button>
        <div style={{ width:1, height:16, background:'#e4e4e7' }}/>
        <div style={{ fontWeight:600, fontSize:14 }}>{biz?.name}</div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <button onClick={()=>go('/login')} style={{ background:'none', border:'1px solid #e4e4e7', color:'#18181b', padding:'6px 14px', borderRadius:7, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Hyr</button>
        </div>
      </nav>

      {/* COVER */}
      <div style={{ height:220, background: biz.cover_url ? `url(${biz.cover_url}) center/cover` : 'linear-gradient(135deg,#18181b 0%,#27272a 100%)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {!biz.cover_url && <div style={{ fontSize:72, opacity:.15 }}>{BIZ_TYPES[biz.business_type]?.split(' ')[0]||'🏢'}</div>}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.6) 100%)' }}/>
      </div>

      {/* HEADER */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e4e4e7', padding:'0 24px 20px', marginTop:-1 }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginBottom:16, flexWrap:'wrap' }}>
            {biz.logo_url ? (
              <div style={{ width:72, height:72, borderRadius:16, border:'3px solid #fff', boxShadow:'0 4px 16px rgba(0,0,0,.12)', overflow:'hidden', flexShrink:0, marginTop:-36 }}>
                <img src={biz.logo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </div>
            ) : (
              <div style={{ width:72, height:72, borderRadius:16, background:'#18181b', border:'3px solid #fff', boxShadow:'0 4px 16px rgba(0,0,0,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, marginTop:-36, flexShrink:0 }}>
                {BIZ_TYPES[biz.business_type]?.split(' ')[0]||'🏢'}
              </div>
            )}
            <div style={{ flex:1, paddingBottom:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:26, fontWeight:900 }}>{biz.name}</h1>
                <span style={{ background:'#f4f4f5', borderRadius:20, padding:'3px 10px', fontSize:12, fontWeight:600, color:'#52525b' }}>{BIZ_TYPES[biz.business_type]||'Biznes'}</span>
              </div>
              <div style={{ display:'flex', gap:14, fontSize:13, color:'#71717a', marginTop:6, flexWrap:'wrap' }}>
                <span>📍 {biz.city}{biz.address&&`, ${biz.address}`}</span>
                {biz.phone&&<span>📞 {biz.phone}</span>}
                {biz.staff_count>0&&<span>👥 {biz.staff_count} staf</span>}
              </div>
              {biz.rating>0&&(
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
                  <Stars rating={biz.rating} size={14}/>
                  <span style={{ fontWeight:700, fontSize:14 }}>{parseFloat(biz.rating).toFixed(1)}</span>
                  <span style={{ fontSize:13, color:'#a1a1aa' }}>({biz.review_count} vlerësime)</span>
                </div>
              )}
            </div>
            <button onClick={()=>setShowBook(true)} style={{ background:'#18181b', color:'#fff', border:'none', padding:'12px 24px', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
              📅 Rezervo Tani
            </button>
          </div>

          {biz.description&&<div style={{ fontSize:14, color:'#52525b', lineHeight:1.7, marginBottom:14 }}>{biz.description}</div>}

          {/* Social links */}
          {(biz.social_instagram||biz.social_facebook||biz.website)&&(
            <div style={{ display:'flex', gap:10 }}>
              {biz.social_instagram&&<a href={`https://instagram.com/${biz.social_instagram}`} target="_blank" rel="noopener" style={{ fontSize:12, color:'#e1306c', fontWeight:600, textDecoration:'none', background:'#fce7f3', padding:'4px 10px', borderRadius:8 }}>📸 Instagram</a>}
              {biz.social_facebook&&<a href={biz.social_facebook} target="_blank" rel="noopener" style={{ fontSize:12, color:'#1877f2', fontWeight:600, textDecoration:'none', background:'#eff6ff', padding:'4px 10px', borderRadius:8 }}>👍 Facebook</a>}
              {biz.website&&<a href={biz.website} target="_blank" rel="noopener" style={{ fontSize:12, color:'#18181b', fontWeight:600, textDecoration:'none', background:'#f4f4f5', padding:'4px 10px', borderRadius:8 }}>🌐 Website</a>}
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e4e4e7', padding:'0 24px' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', gap:0, overflowX:'auto' }}>
          {[
            ['services', '✂️ Shërbimet', services.length > 0],
            ['staff',    '👥 Stafi',     staff.length > 0],
            ['classes',  '📅 Klasat',    classes.length > 0],
            ['reviews',  '⭐ Vlerësimet', true],
          ].filter(([,,show])=>show).map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{ padding:'14px 20px', background:'none', border:'none', cursor:'pointer', fontSize:14, fontWeight:600, color:tab===k?'#18181b':'#71717a', borderBottom:`2px solid ${tab===k?'#18181b':'transparent'}`, transition:'all .15s', fontFamily:'inherit', whiteSpace:'nowrap' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 24px 48px' }}>

        {/* Services */}
        {tab==='services'&&(
          <div style={{ display:'flex', flexDirection:'column', gap:10, animation:'fadeUp .2s ease' }}>
            {services.length===0?<div style={{ textAlign:'center', padding:40, color:'#71717a' }}>Asnjë shërbim i shtuar ende</div>:
            services.map(s=>(
              <div key={s.id} className="svc-card" style={{ background:'#fff', border:'1px solid #e4e4e7', borderRadius:14, padding:'16px 20px', display:'flex', alignItems:'center', gap:16, transition:'all .15s', cursor:'pointer' }}
                onClick={()=>{setSelService(s);setShowBook(true)}}>
                <div style={{ width:48, height:48, borderRadius:11, background:'#f4f4f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{s.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15, marginBottom:3 }}>{s.name}</div>
                  <div style={{ fontSize:13, color:'#71717a' }}>⏱ {s.duration_min} min{s.description&&` · ${s.description}`}</div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontWeight:700, fontSize:18 }}>{fmtNum(s.price)} L</div>
                  <div style={{ fontSize:12, color:'#16a34a', fontWeight:600, marginTop:2 }}>Rezervo →</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Staff */}
        {tab==='staff'&&(
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16, animation:'fadeUp .2s ease' }}>
            {staff.length===0?<div style={{ textAlign:'center', padding:40, color:'#71717a' }}>Asnjë staf i shtuar</div>:
            staff.map(s=>(
              <div key={s.id} className="staff-card" style={{ background:'#fff', border:'1px solid #e4e4e7', borderRadius:14, padding:20, textAlign:'center', transition:'all .2s', cursor:'pointer' }}
                onClick={()=>{setSelStaff(s);setShowBook(true)}}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:['#18181b','#2563eb','#16a34a','#d97706','#dc2626','#7c3aed'][s.avatar_color||0], display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:700, color:'#fff', margin:'0 auto 12px' }}>
                  {s.name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{s.name}</div>
                <div style={{ fontSize:12, color:'#71717a', marginBottom:10 }}>{s.speciality||'Specialist'}</div>
                <button style={{ background:'#18181b', color:'#fff', border:'none', padding:'7px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', width:'100%' }}>
                  Rezervo
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Classes */}
        {tab==='classes'&&(
          <div style={{ display:'flex', flexDirection:'column', gap:12, animation:'fadeUp .2s ease' }}>
            {classes.length===0?<div style={{ textAlign:'center', padding:40, color:'#71717a' }}>Asnjë klasë e planifikuar</div>:
            classes.map(c=>{
              const confirmed = (c.bookings||[]).filter(b=>b.status==='confirmed').length
              const isFull = c.capacity && confirmed >= c.capacity
              return (
                <div key={c.id} style={{ background:'#fff', border:'1px solid #e4e4e7', borderRadius:14, overflow:'hidden', display:'flex' }}>
                  <div style={{ width:70, background:'linear-gradient(180deg,#7c3aed,#2563eb)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px 8px', flexShrink:0 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:'#fff', lineHeight:1 }}>{c.start_time?.slice(0,5)}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.6)', marginTop:4 }}>{c.duration_min}min</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:6, textAlign:'center' }}>
                      {new Date(c.date+'T00:00').toLocaleDateString('sq-AL',{day:'numeric',month:'short'})}
                    </div>
                  </div>
                  <div style={{ flex:1, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{c.class_type} <span style={{ fontSize:11, background:'#f4f4f5', padding:'2px 8px', borderRadius:8, color:'#52525b', fontWeight:600 }}>{LEVELS[c.level]||c.level}</span></div>
                      <div style={{ fontSize:13, color:'#71717a' }}>
                        {c.instructor&&<span>👤 {c.instructor.name} · </span>}
                        👥 {confirmed}{c.capacity?`/${c.capacity}`:''} vende · 💰 {fmtNum(c.price)} L
                      </div>
                    </div>
                    {isFull ? (
                      <span style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:600 }}>🔒 E Plotë</span>
                    ) : (
                      <button onClick={()=>setShowBook(true)} style={{ background:'#18181b', color:'#fff', border:'none', padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
                        Rezervo →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Reviews */}
        {tab==='reviews'&&(
          <div style={{ animation:'fadeUp .2s ease' }}>
            {biz.rating>0&&(
              <div style={{ background:'#fff', border:'1px solid #e4e4e7', borderRadius:14, padding:24, marginBottom:20, display:'flex', gap:32, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:56, fontWeight:900, lineHeight:1 }}>{parseFloat(biz.rating).toFixed(1)}</div>
                  <Stars rating={biz.rating} size={20}/>
                  <div style={{ fontSize:13, color:'#71717a', marginTop:6 }}>{biz.review_count} vlerësime</div>
                </div>
              </div>
            )}
            {reviews.length===0?<div style={{ textAlign:'center', padding:40, color:'#71717a' }}>Asnjë vlerësim ende · Ji i pari!</div>:
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {reviews.map(r=>(
                <div key={r.id} style={{ background:'#fff', border:'1px solid #e4e4e7', borderRadius:12, padding:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{r.client_name}</div>
                    <Stars rating={r.rating} size={13}/>
                  </div>
                  {r.comment&&<div style={{ fontSize:14, color:'#52525b', lineHeight:1.7 }}>{r.comment}</div>}
                </div>
              ))}
            </div>}
          </div>
        )}
      </div>

      {/* MAP */}
      {biz && (
        <div style={{ maxWidth:900, margin:'0 auto', padding:'0 24px 32px' }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>📍 Lokacioni</div>
          <BusinessMap business={biz} style={{ height:240, border:'1px solid #e4e4e7' }}/>
          {biz.address && <div style={{ marginTop:10, fontSize:13, color:'#71717a' }}>📍 {biz.address}, {biz.city}</div>}
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBook&&biz&&(
        <BookingModal
          biz={biz}
          services={services}
          staff={staff}
          onClose={()=>{setShowBook(false);setSelService(null);setSelStaff(null)}}
        />
      )}
    </div>
  )
}
