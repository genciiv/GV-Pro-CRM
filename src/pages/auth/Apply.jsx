import { useState } from 'react'
import { submitApplication } from '../../lib/db'

export default function Apply() {
  const [f, setF] = useState({ gymName:'', ownerName:'', email:'', phone:'', city:'Tiranë', address:'', message:'' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')
  const set = (k,v) => setF(p=>({...p,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    if (!f.gymName||!f.ownerName||!f.email||!f.phone) { setError('Të gjitha fushat me * janë të detyrueshme'); return }
    setLoading(true); setError('')
    try { await submitApplication(f); setSuccess(true) }
    catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',padding:24}}>
      <div style={{background:'#fff',borderRadius:16,padding:48,maxWidth:480,width:'100%',textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>
        <div style={{fontSize:56,marginBottom:20}}>✅</div>
        <div style={{fontFamily:'Instrument Serif,serif',fontSize:26,marginBottom:12}}>Aplikimi u Dërgua!</div>
        <div style={{fontSize:14,color:'#71717a',lineHeight:1.7,marginBottom:28}}>
          Faleminderit! Do t'ju kontaktojmë brenda 24 orësh në <strong>{f.email}</strong>.<br/>
          Pas konfirmimit të pagesës, merrni kredencialet e hyrjes.
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
          Vaqo
        </div>
        <a href="/login" style={{background:'#fff',border:'1px solid #e4e4e7',color:'#18181b',padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:500,textDecoration:'none'}}>Hyr →</a>
      </nav>

      <div style={{maxWidth:600,margin:'0 auto',padding:'48px 24px'}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0',borderRadius:20,padding:'4px 14px',fontSize:12,fontWeight:600,marginBottom:16}}>
            ● 30 Ditë Provë Falas
          </div>
          <div style={{fontFamily:'Instrument Serif,serif',fontSize:32,marginBottom:10}}>Regjistro Palestrën Tënde</div>
          <div style={{fontSize:14,color:'#71717a',lineHeight:1.7}}>
            Plotëso formularin. Kontaktojmë brenda 24 orësh dhe konfigurojmë sistemin për ty.
          </div>
        </div>

        <div className="card">
          <div className="card-b">
            {error && <div className="alert al-rd" style={{marginBottom:16}}>❌ {error}</div>}
            <form onSubmit={submit}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#a1a1aa',marginBottom:14,paddingBottom:10,borderBottom:'1px solid #f4f4f5'}}>
                Informacioni i Palestrës
              </div>
              <div className="fg">
                <div className="fgp"><label>Emri i Palestrës *</label><input value={f.gymName} onChange={e=>set('gymName',e.target.value)} placeholder="p.sh. PowerZone Gym"/></div>
              </div>
              <div className="fg c2">
                <div className="fgp"><label>Qyteti</label>
                  <select value={f.city} onChange={e=>set('city',e.target.value)}>
                    {['Tiranë','Durrës','Shkodër','Vlorë','Elbasan','Korçë','Fier','Berat','Lushnjë','Kavajë','Lezhë'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fgp"><label>Adresa</label><input value={f.address} onChange={e=>set('address',e.target.value)} placeholder="Rruga, nr..."/></div>
              </div>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#a1a1aa',margin:'20px 0 14px',paddingBottom:10,borderBottom:'1px solid #f4f4f5'}}>
                Informacioni i Pronarit
              </div>
              <div className="fg">
                <div className="fgp"><label>Emri i Plotë *</label><input value={f.ownerName} onChange={e=>set('ownerName',e.target.value)} placeholder="Emri Mbiemri"/></div>
              </div>
              <div className="fg c2">
                <div className="fgp"><label>Email * (për hyrje)</label><input type="email" value={f.email} onChange={e=>set('email',e.target.value)} placeholder="email@palestra.al"/></div>
                <div className="fgp"><label>Telefon *</label><input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69 ..."/></div>
              </div>
              <div className="fg" style={{marginBottom:0}}>
                <div className="fgp"><label>Mesazh (opsional)</label><textarea value={f.message} onChange={e=>set('message',e.target.value)} placeholder="Çdo informacion shtesë..."/></div>
              </div>

              <div className="alert al-bl" style={{margin:'16px 0'}}>
                ℹ️ Pas dërgimit → kontaktojmë → pagesa në dorë → marrin email me fjalëkalim → hyrje menjëherë
              </div>

              <button type="submit" disabled={loading} className="btn btn-p"
                style={{width:'100%',justifyContent:'center',padding:'12px 0',fontSize:15}}>
                {loading ? 'Duke dërguar...' : '📩 Dërgo Aplikimin →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
