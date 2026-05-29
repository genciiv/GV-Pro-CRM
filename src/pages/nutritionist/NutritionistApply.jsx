import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const SPECIALITIES = [
  { value:'weight_loss',   label:'🏃 Humbje Peshe' },
  { value:'muscle_gain',   label:'💪 Rritje Muskulature' },
  { value:'medical',       label:'🏥 Dietë Mjekësore' },
  { value:'sports',        label:'⚽ Dietë Sportive' },
  { value:'vegan',         label:'🌱 Vegane / Vegjetariane' },
  { value:'other',         label:'🍽️ Tjetër' },
]

export default function NutritionistApply() {
  const [f, setF] = useState({ name:'', email:'', phone:'', speciality:'weight_loss', experience:'', bio:'', certificate:'' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    if (!f.name||!f.email||!f.phone) { setError('Të gjitha fushat me * janë të detyrueshme'); return }
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.from('nutritionist_applications').insert({
        name: f.name, email: f.email, phone: f.phone,
        speciality: f.speciality, experience: f.experience,
        bio: f.bio, certificate: f.certificate,
      })
      if (err) throw new Error(err.message)
      setSuccess(true)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',padding:24}}>
      <div style={{background:'#fff',borderRadius:16,padding:48,maxWidth:480,width:'100%',textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>
        <div style={{fontSize:56,marginBottom:20}}>✅</div>
        <div style={{fontFamily:'Instrument Serif,serif',fontSize:26,marginBottom:12}}>Aplikimi u Dërgua!</div>
        <div style={{fontSize:14,color:'#71717a',lineHeight:1.7,marginBottom:28}}>
          Faleminderit <strong>{f.name}</strong>!<br/>
          Do të kontaktoheni brenda 24 orësh në <strong>{f.email}</strong>.
        </div>
        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:16,marginBottom:24,fontSize:13,color:'#14532d',lineHeight:1.7}}>
          <strong>Modeli i Komisionit:</strong><br/>
          Ti vendos çmimin e dietave tua.<br/>
          <strong>70% ty</strong> · <strong>30% platformës</strong><br/>
          Pagesa automatike pas çdo shitjeje.
        </div>
        <a href="/login" style={{background:'#18181b',color:'#fff',border:'none',padding:'11px 32px',borderRadius:9,fontSize:14,fontWeight:600,cursor:'pointer',textDecoration:'none',display:'inline-block'}}>
          Kthehu te Hyrja
        </a>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#fafafa'}}>
      <nav style={{background:'#fff',borderBottom:'1px solid #e4e4e7',padding:'16px 40px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,fontWeight:700,fontSize:16}}>
          <div style={{width:32,height:32,borderRadius:8,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>💪</div>
          FitPro — Dietologët
        </div>
        <a href="/login" style={{background:'#fff',border:'1px solid #e4e4e7',color:'#18181b',padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:500,textDecoration:'none'}}>Hyr →</a>
      </nav>

      <div style={{maxWidth:640,margin:'0 auto',padding:'48px 24px'}}>
        {/* Hero */}
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{fontSize:48,marginBottom:16}}>🥗</div>
          <div style={{fontFamily:'Instrument Serif,serif',fontSize:34,marginBottom:12}}>Bashkohu si Dietolog</div>
          <div style={{fontSize:15,color:'#71717a',lineHeight:1.7,maxWidth:480,margin:'0 auto'}}>
            Shes dietat tua te mijëra anëtarë të palestrëve. Ti vendos çmimin — ne e menaxhojmë pjesën tjetër.
          </div>
        </div>

        {/* Benefits */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:32}}>
          {[
            ['💰','70% të ardhura','nga çdo shitje dietë'],
            ['📱','Platforma gati','pa nevojë për website'],
            ['👥','Klientë të sigurt','nga palestrat partnere'],
            ['📊','Dashboard','shih statistikat live'],
          ].map(([ico,t,s])=>(
            <div key={t} style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:10,padding:16,display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontSize:24,flexShrink:0}}>{ico}</span>
              <div><div style={{fontWeight:600,fontSize:13}}>{t}</div><div style={{fontSize:12,color:'#71717a',marginTop:2}}>{s}</div></div>
            </div>
          ))}
        </div>

        {/* Commission box */}
        <div style={{background:'#18181b',color:'#fff',borderRadius:12,padding:20,marginBottom:28,display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:'Instrument Serif,serif',fontSize:20,marginBottom:4}}>Modeli i Komisionit</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,.6)'}}>Transparent. Pa surpriza.</div>
          </div>
          <div style={{display:'flex',gap:20}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:'Instrument Serif,serif',fontSize:36,fontWeight:900,color:'#c8a96e'}}>70%</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)'}}>Ty</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:'Instrument Serif,serif',fontSize:36,fontWeight:900}}>30%</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.5)'}}>Platformës</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card">
          <div className="card-b">
            {error && <div className="alert al-rd" style={{marginBottom:16}}>❌ {error}</div>}
            <form onSubmit={submit}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#a1a1aa',marginBottom:14,paddingBottom:10,borderBottom:'1px solid #f4f4f5'}}>
                Informacioni Personal
              </div>
              <div className="fg"><div className="fgp"><label>Emri i Plotë *</label><input value={f.name} onChange={e=>set('name',e.target.value)} placeholder="Dr. Emri Mbiemri"/></div></div>
              <div className="fg c2">
                <div className="fgp"><label>Email * (për hyrje)</label><input type="email" value={f.email} onChange={e=>set('email',e.target.value)} placeholder="email@..."/></div>
                <div className="fgp"><label>Telefon *</label><input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..."/></div>
              </div>
              <div className="fg"><div className="fgp"><label>Specializimi *</label>
                <select value={f.speciality} onChange={e=>set('speciality',e.target.value)}>
                  {SPECIALITIES.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div></div>

              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#a1a1aa',margin:'20px 0 14px',paddingBottom:10,borderBottom:'1px solid #f4f4f5'}}>
                Eksperienca & Kualifikimet
              </div>
              <div className="fg"><div className="fgp"><label>Eksperienca (vite + përshkrim)</label><input value={f.experience} onChange={e=>set('experience',e.target.value)} placeholder="5 vite, ish-bashkëpunëtor i..."/></div></div>
              <div className="fg"><div className="fgp"><label>Bio / Prezantim</label><textarea value={f.bio} onChange={e=>set('bio',e.target.value)} placeholder="Prezantoje veten — klientët do ta lexojnë..." style={{minHeight:100}}/></div></div>
              <div className="fg" style={{marginBottom:0}}><div className="fgp"><label>Çertifikata / Diploma</label><input value={f.certificate} onChange={e=>set('certificate',e.target.value)} placeholder="p.sh. Dietolog i Çertifikuar — Universiteti i Tiranës"/></div></div>

              <div className="alert al-bl" style={{margin:'16px 0'}}>
                ℹ️ Pas aprovimit, do të merrni email me kredencialet e hyrjes dhe mund të filloni të shtoni dieta menjëherë.
              </div>

              <button type="submit" disabled={loading} className="btn btn-p"
                style={{width:'100%',justifyContent:'center',padding:'13px 0',fontSize:15}}>
                {loading ? 'Duke dërguar...' : '🥗 Apliko si Dietolog →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
