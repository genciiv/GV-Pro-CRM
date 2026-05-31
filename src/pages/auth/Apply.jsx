import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { VaqoLogo } from '../../components/VaqoLogo'

const BIZ_TYPES = [
  { v:'gym',          l:'🏋️ Palestre & Gym',     desc:'Menaxhim anëtarësh, QR check-in, plane stërvitjeje' },
  { v:'barbershop',   l:'💈 Barbershop',           desc:'Rezervime online, staf berberësh, shërbime' },
  { v:'salon',        l:'💅 Sallon Bukurie',        desc:'Takime stilistësh, shërbime bukurie, kujtues' },
  { v:'spa',          l:'💆 Spa & Masazh',          desc:'Terapistë, trajtimie, rezervime premium' },
  { v:'yoga',         l:'🧘 Yoga Studio',           desc:'Orare klasash, kapacitet, listë pritjeje' },
  { v:'pilates',      l:'🤸 Pilates',               desc:'Klasa grupore, sesione individuale, progres' },
  { v:'martial_arts', l:'🥊 Arte Marciale',         desc:'Gradime, nivele, klasa sipas moshës' },
  { v:'dance',        l:'💃 Studio Vallëzimi',      desc:'Kurse, recitale, grupe moshash' },
  { v:'fitness',      l:'⚡ Functional Fitness',    desc:'HIIT, CrossFit, WOD ditore, performance' },
  { v:'wellness',     l:'🌿 Wellness Clinic',       desc:'Terapi holistike, histori pacientësh, takime' },
]

const CITIES = ['Tiranë','Durrës','Shkodër','Vlorë','Elbasan','Korçë','Fier','Berat','Lushnjë','Kavajë','Lezhë','Tjetër']
const INP = { width:'100%', border:'1.5px solid #e4e4e7', borderRadius:10, padding:'12px 14px', fontSize:15, fontFamily:'inherit', outline:'none', background:'#fff', color:'#18181b', transition:'border-color .15s', boxSizing:'border-box' }
const onF = e => e.target.style.borderColor = '#7c3aed'
const onB = e => e.target.style.borderColor = '#e4e4e7'

export default function Apply() {
  const [step,    setStep]    = useState(1) // 1=type, 2=details
  const [bizType, setBizType] = useState('')
  const [f, setF] = useState({ gymName:'', ownerName:'', email:'', phone:'', city:'Tiranë', address:'', message:'' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))

  const selectedBiz = BIZ_TYPES.find(b => b.v === bizType)

  const submit = async e => {
    e.preventDefault()
    if (!f.gymName || !f.ownerName || !f.email || !f.phone) { setError('Plotëso të gjitha fushat me *'); return }
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.from('applications').insert({
        name: f.gymName.trim(), owner_name: f.ownerName.trim(),
        email: f.email.trim(), phone: f.phone.trim(),
        city: f.city, address: f.address.trim(),
        message: f.message.trim(), status: 'pending',
        business_type: bizType,
      })
      if (err) throw new Error(err.message)
      setSuccess(true)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',padding:24,fontFamily:'system-ui,sans-serif'}}>
      <div style={{background:'#fff',borderRadius:20,padding:48,maxWidth:500,width:'100%',textAlign:'center',boxShadow:'0 8px 40px rgba(0,0,0,.08)'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,margin:'0 auto 20px'}}>✅</div>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:26,fontWeight:900,marginBottom:12}}>Aplikimi u Dërgua!</h2>
        <p style={{fontSize:15,color:'#52525b',lineHeight:1.75,marginBottom:8}}>
          Faleminderit <strong>{f.ownerName}</strong>!
        </p>
        <p style={{fontSize:15,color:'#52525b',lineHeight:1.75,marginBottom:28}}>
          Do t'ju kontaktojmë brenda <strong>24 orësh</strong> në <strong>{f.phone}</strong> ose <strong>{f.email}</strong>.
        </p>
        <div style={{background:'#f8f8f8',borderRadius:12,padding:20,marginBottom:24,textAlign:'left'}}>
          {[
            ['🏢 Biznesi', f.gymName],
            ['📱 Lloji', selectedBiz?.l || bizType],
            ['📍 Qyteti', f.city],
          ].map(([l,v]) => (
            <div key={l} style={{display:'flex',gap:10,padding:'6px 0',borderBottom:'1px solid #f0f0f0',fontSize:13}}>
              <span style={{color:'#71717a',minWidth:100}}>{l}</span>
              <span style={{fontWeight:600}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10}}>
          <a href="/" style={{flex:1,background:'#f4f4f5',color:'#18181b',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none',display:'block',textAlign:'center'}}>← Kryefaqja</a>
          <a href="/demo" style={{flex:1,background:'#7c3aed',color:'#fff',border:'none',padding:'12px',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none',display:'block',textAlign:'center'}}>Book Demo →</a>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#fafafa',fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <nav style={{background:'rgba(255,255,255,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,.07)',height:56,padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <a href="/"><VaqoLogo size="sm"/></a>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span style={{fontSize:13,color:'#71717a'}}>Ke llogari?</span>
          <a href="/login" style={{background:'#18181b',color:'#fff',padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:700,textDecoration:'none'}}>Hyr</a>
        </div>
      </nav>

      <div style={{maxWidth:860,margin:'0 auto',padding:'40px 20px 64px',animation:'fadeUp .5s ease both'}}>

        {/* Progress */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:32,justifyContent:'center'}}>
          {['Lloji i Biznesit','Detajet'].map((l,i) => (
            <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,background:step>i+1?'#16a34a':step===i+1?'#7c3aed':'#e4e4e7',color:step>=i+1?'#fff':'#a1a1aa',transition:'all .3s'}}>
                {step>i+1?'✓':i+1}
              </div>
              <span style={{fontSize:13,fontWeight:step===i+1?700:400,color:step===i+1?'#7c3aed':'#71717a'}}>{l}</span>
              {i<1 && <div style={{width:40,height:1,background:step>1?'#7c3aed':'#e4e4e7',marginLeft:4}}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 — Choose type */}
        {step===1 && (
          <div>
            <div style={{textAlign:'center',marginBottom:32}}>
              <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(24px,4vw,36px)',fontWeight:900,marginBottom:10}}>
                Çfarë lloj biznesi ke?
              </h1>
              <p style={{fontSize:15,color:'#52525b'}}>Zgjidh dhe ne konfigurojmë gjithçka për ty.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:12,marginBottom:28}}>
              {BIZ_TYPES.map(bt => (
                <button key={bt.v} onClick={()=>setBizType(bt.v)}
                  style={{padding:'18px 20px',borderRadius:14,border:`2px solid ${bizType===bt.v?'#7c3aed':'#e4e4e7'}`,background:bizType===bt.v?'#f5f3ff':'#fff',cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all .15s'}}>
                  <div style={{fontSize:22,marginBottom:8}}>{bt.l.split(' ')[0]}</div>
                  <div style={{fontWeight:700,fontSize:14,color:'#18181b',marginBottom:4}}>{bt.l.slice(bt.l.indexOf(' ')+1)}</div>
                  <div style={{fontSize:12,color:'#71717a',lineHeight:1.5}}>{bt.desc}</div>
                </button>
              ))}
            </div>
            <div style={{textAlign:'center'}}>
              <button onClick={()=>bizType&&setStep(2)} disabled={!bizType}
                style={{background:bizType?'#7c3aed':'#e4e4e7',color:bizType?'#fff':'#a1a1aa',border:'none',padding:'14px 48px',borderRadius:11,fontSize:16,fontWeight:700,cursor:bizType?'pointer':'not-allowed',fontFamily:'inherit',transition:'all .2s'}}>
                Vazhdo → {selectedBiz?.l}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Details */}
        {step===2 && (
          <div style={{maxWidth:600,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:28}}>
              <div style={{fontSize:36,marginBottom:8}}>{selectedBiz?.l.split(' ')[0]}</div>
              <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(22px,3.5vw,32px)',fontWeight:900,marginBottom:8}}>
                Regjistro {selectedBiz?.l.slice(selectedBiz.l.indexOf(' ')+1)}
              </h1>
              <p style={{fontSize:14,color:'#52525b'}}>30 ditë falas · Pa kontratë · Setup 30 min</p>
            </div>

            {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'11px 16px',marginBottom:16,fontSize:14,color:'#dc2626'}}>❌ {error}</div>}

            <form onSubmit={submit}>
              <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#a1a1aa',marginBottom:14}}>🏢 Biznesi</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Emri i Biznesit *</label>
                    <input style={INP} value={f.gymName} onChange={e=>set('gymName',e.target.value)} placeholder="p.sh. Elite Gym Tiranë" onFocus={onF} onBlur={onB} required/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Qyteti *</label>
                      <select style={{...INP,cursor:'pointer'}} value={f.city} onChange={e=>set('city',e.target.value)} onFocus={onF} onBlur={onB}>
                        {CITIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Adresa</label>
                      <input style={INP} value={f.address} onChange={e=>set('address',e.target.value)} placeholder="Rruga, nr..." onFocus={onF} onBlur={onB}/>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,marginBottom:14}}>
                <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#a1a1aa',marginBottom:14}}>👤 Pronari</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Emri i Plotë *</label>
                    <input style={INP} value={f.ownerName} onChange={e=>set('ownerName',e.target.value)} placeholder="Emri Mbiemri" onFocus={onF} onBlur={onB} required/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Telefon *</label>
                      <input style={INP} value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..." onFocus={onF} onBlur={onB} required/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Email *</label>
                      <input type="email" style={INP} value={f.email} onChange={e=>set('email',e.target.value)} placeholder="email@..." onFocus={onF} onBlur={onB} required/>
                    </div>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Mesazh (opsionale)</label>
                    <textarea style={{...INP,resize:'none',height:80}} value={f.message} onChange={e=>set('message',e.target.value)} placeholder="Çfarë dëshironi të dini, pyetje..." onFocus={onF} onBlur={onB}/>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',gap:10,marginTop:4}}>
                <button type="button" onClick={()=>setStep(1)} style={{padding:'14px 24px',borderRadius:10,border:'1px solid #e4e4e7',background:'#fff',color:'#52525b',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Prapa</button>
                <button type="submit" disabled={loading} style={{flex:1,background:'#7c3aed',color:'#fff',border:'none',padding:'14px',borderRadius:11,fontSize:15,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity:loading?.7:1}}>
                  {loading&&<div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                  {loading?'Duke dërguar...':'🚀 Dërgo Aplikimin Falas'}
                </button>
              </div>
              <p style={{textAlign:'center',fontSize:12,color:'#a1a1aa',marginTop:10}}>✅ 30 ditë falas · 💵 Pa kartë krediti · 🔒 Anulo kurdo</p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
