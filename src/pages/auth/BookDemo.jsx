import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { emailDemoRequest } from '../../lib/email'
import { smsDemoConfirm } from '../../lib/sms'
import { VaqoLogo } from '../../components/VaqoLogo'

const BIZ_TYPES = [
  {v:'gym',l:'Palestre & Gym',ico:'🏋️'},{v:'barbershop',l:'Barbershop',ico:'💈'},
  {v:'salon',l:'Sallon Bukurie',ico:'💅'},{v:'spa',l:'Spa & Masazh',ico:'💆'},
  {v:'yoga',l:'Yoga Studio',ico:'🧘'},{v:'pilates',l:'Pilates',ico:'🤸'},
  {v:'martial_arts',l:'Arte Marciale',ico:'🥊'},{v:'dance',l:'Studio Vallëzimi',ico:'💃'},
  {v:'fitness',l:'Functional Fitness',ico:'⚡'},{v:'wellness',l:'Wellness Clinic',ico:'🌿'},
  {v:'other',l:'Tjetër',ico:'🏢'},
]
const CITIES = ['Tiranë','Durrës','Shkodër','Vlorë','Elbasan','Korçë','Fier','Berat','Lushnjë','Kavajë','Lezhë','Tjetër']
const HOURS  = ['09:00–10:00','10:00–11:00','11:00–12:00','14:00–15:00','15:00–16:00','16:00–17:00','17:00–18:00','18:00–19:00']

const INP = {
  width:'100%', border:'1.5px solid #e8eaef', borderRadius:10,
  padding:'11px 14px', fontSize:14, fontFamily:'inherit',
  outline:'none', background:'#fff', color:'#0f1117',
  transition:'border-color .15s, box-shadow .15s', boxSizing:'border-box'
}
const onF = e => { e.target.style.borderColor='#6c47ff'; e.target.style.boxShadow='0 0 0 3px rgba(108,71,255,.12)' }
const onB = e => { e.target.style.borderColor='#e8eaef'; e.target.style.boxShadow='none' }

function useW() {
  const [w,setW] = useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return {isMobile:w<640, isTablet:w>=640&&w<1024}
}

export default function BookDemo() {
  const {isMobile, isTablet} = useW()
  const [step,    setStep]   = useState(1)
  const [loading, setLoading]= useState(false)
  const [error,   setError]  = useState('')
  const [f, setF] = useState({name:'',phone:'',email:'',biz_type:'',city:'',biz_name:'',preferred_hours:[],message:''})
  const set = (k,v) => setF(p=>({...p,[k]:v}))
  const toggleH = h => set('preferred_hours', f.preferred_hours.includes(h)?f.preferred_hours.filter(x=>x!==h):[...f.preferred_hours,h])
  const px = isMobile?16:isTablet?28:48

  const submit = async e => {
    e.preventDefault(); setError('')
    if (!f.name||!f.phone||!f.biz_type||!f.city){setError('Plotëso të gjitha fushat me *');return}
    setLoading(true)
    try {
      const {error:err} = await supabase.from('demo_requests').insert({
        name:f.name.trim(), phone:f.phone.trim(), email:f.email.trim()||null,
        biz_type:f.biz_type, biz_name:f.biz_name.trim()||null, city:f.city,
        preferred_hours:f.preferred_hours, message:f.message.trim()||null, status:'new',
      })
      if (err) throw new Error(err.message)
      try { await emailDemoRequest({ demoRequest:{...f} }) } catch(e){}
      try { if (f.phone) await smsDemoConfirm({ demoRequest:{name:f.name,phone:f.phone,biz_type:f.biz_type} }) } catch(e){}
      setStep(2)
    } catch(e){setError(e.message)}
    finally{setLoading(false)}
  }

  // ── SUCCESS ──
  if (step===2) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f8f9fc',padding:20,fontFamily:'system-ui,sans-serif'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes pop{0%{transform:scale(.7);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}`}</style>
      <div style={{background:'#fff',borderRadius:20,padding:isMobile?28:48,maxWidth:480,width:'100%',textAlign:'center',boxShadow:'0 8px 40px rgba(15,17,23,.1)',border:'1px solid #e8eaef'}}>
        <div style={{width:80,height:80,borderRadius:'50%',background:'#f0fdf4',border:'3px solid #dcfce7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38,margin:'0 auto 22px',animation:'pop .5s ease both'}}>✅</div>
        <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?22:28,fontWeight:900,marginBottom:10,color:'#0f1117'}}>Demo u Rezervua!</h2>
        <p style={{fontSize:15,color:'#6b7385',lineHeight:1.75,marginBottom:24}}>
          Faleminderit <strong style={{color:'#0f1117'}}>{f.name}</strong>!<br/>
          Do t'ju kontaktojmë brenda <strong style={{color:'#0f1117'}}>24 orësh</strong> në <strong style={{color:'#0f1117'}}>{f.phone}</strong>.
        </p>
        <div style={{background:'#f8f9fc',borderRadius:12,padding:'14px 18px',marginBottom:24,textAlign:'left',border:'1px solid #e8eaef'}}>
          {[[BIZ_TYPES.find(b=>b.v===f.biz_type)?.ico||'🏢', BIZ_TYPES.find(b=>b.v===f.biz_type)?.l||''],
            ['📍', f.city], ['📞', f.phone]].map(([ico,v],i)=>v&&(
            <div key={i} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:'1px solid #e8eaef',fontSize:13}}>
              <span style={{width:20,textAlign:'center'}}>{ico}</span>
              <span style={{color:'#0f1117',fontWeight:500}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,flexDirection:isMobile?'column':'row'}}>
          <a href="/" style={{flex:1,background:'#f4f6fa',color:'#0f1117',border:'1px solid #e8eaef',padding:'12px',borderRadius:10,fontSize:14,fontWeight:600,textDecoration:'none',textAlign:'center'}}>← Kryefaqja</a>
          <a href="/explore" style={{flex:1,background:'#6c47ff',color:'#fff',padding:'12px',borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none',textAlign:'center'}}>Shfleto Bizneset →</a>
        </div>
      </div>
    </div>
  )

  // ── FORM ──
  return (
    <div style={{minHeight:'100vh',background:'#f8f9fc',fontFamily:'system-ui,-apple-system,sans-serif',color:'#0f1117'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* NAV */}
      <nav style={{background:'rgba(255,255,255,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid #e8eaef',height:56,padding:`0 ${px}px`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <a href="/" style={{textDecoration:'none'}}><VaqoLogo size="sm"/></a>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {!isMobile&&<span style={{fontSize:13,color:'#6b7385'}}>Pyetje?</span>}
          <a href="tel:+355692291041" style={{background:'#f4f6fa',border:'1px solid #e8eaef',color:'#0f1117',padding:'7px 16px',borderRadius:8,fontSize:13,fontWeight:600,textDecoration:'none'}}>📞 +355 692 291 041</a>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:'0 auto',padding:`${isMobile?24:48}px ${px}px 64px`}}>
        <div style={{display:'grid',gridTemplateColumns:isMobile||isTablet?'1fr':'1fr 340px',gap:isMobile?24:40,alignItems:'start'}}>

          {/* ── LEFT: FORM ── */}
          <div style={{animation:'fadeUp .5s ease both'}}>
            {/* Hero */}
            <div style={{marginBottom:28}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'#f0fdf4',border:'1px solid #dcfce7',borderRadius:100,padding:'5px 14px',fontSize:12,fontWeight:700,color:'#16a34a',marginBottom:16}}>
                ✅ Demo Falas · 30 Minuta
              </div>
              <h1 style={{fontFamily:'Georgia,serif',fontSize:isMobile?26:36,fontWeight:900,lineHeight:1.1,letterSpacing:'-.02em',marginBottom:12}}>
                Shiko Vaqo Live<br/>
                <span style={{color:'#6c47ff'}}>për Biznesin Tënd</span>
              </h1>
              <p style={{fontSize:15,color:'#6b7385',lineHeight:1.75}}>
                30 minuta demonstrim live. Konfigurojmë sipas llojit të biznesit tuaj.
              </p>
            </div>

            {/* Error */}
            {error&&(
              <div style={{background:'#fff1f3',border:'1px solid #ffd6db',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:14,color:'#c0143a',display:'flex',gap:8,alignItems:'center'}}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:12}}>

              {/* Kontakti */}
              <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaef',padding:isMobile?16:22,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#9aa0b0',marginBottom:14,textTransform:'uppercase',letterSpacing:'.07em'}}>Kontakti</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3d4350',marginBottom:6}}>Emri i Plotë *</label>
                    <input style={INP} value={f.name} onChange={e=>set('name',e.target.value)} placeholder="Emri Mbiemri" onFocus={onF} onBlur={onB} required/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12}}>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3d4350',marginBottom:6}}>Telefon *</label>
                      <input style={INP} value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..." onFocus={onF} onBlur={onB} required/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3d4350',marginBottom:6}}>Email</label>
                      <input type="email" style={INP} value={f.email} onChange={e=>set('email',e.target.value)} placeholder="email@..." onFocus={onF} onBlur={onB}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biznesi */}
              <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaef',padding:isMobile?16:22,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#9aa0b0',marginBottom:14,textTransform:'uppercase',letterSpacing:'.07em'}}>Biznesi</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3d4350',marginBottom:8}}>Lloji i Biznesit *</label>
                    <div style={{display:'grid',gridTemplateColumns:`repeat(${isMobile?2:4},1fr)`,gap:7}}>
                      {BIZ_TYPES.slice(0,8).map(bt=>(
                        <button key={bt.v} type="button" onClick={()=>set('biz_type',bt.v)}
                          style={{padding:'10px 8px',borderRadius:9,border:`1.5px solid ${f.biz_type===bt.v?'#6c47ff':'#e8eaef'}`,background:f.biz_type===bt.v?'#f0edff':'#fff',cursor:'pointer',fontFamily:'inherit',textAlign:'center',transition:'all .15s'}}>
                          <div style={{fontSize:18,marginBottom:3}}>{bt.ico}</div>
                          <div style={{fontSize:11,fontWeight:600,color:f.biz_type===bt.v?'#6c47ff':'#3d4350',lineHeight:1.2}}>{bt.l}</div>
                        </button>
                      ))}
                    </div>
                    {/* Overflow types */}
                    <div style={{display:'flex',gap:7,marginTop:7,flexWrap:'wrap'}}>
                      {BIZ_TYPES.slice(8).map(bt=>(
                        <button key={bt.v} type="button" onClick={()=>set('biz_type',bt.v)}
                          style={{padding:'7px 12px',borderRadius:20,border:`1.5px solid ${f.biz_type===bt.v?'#6c47ff':'#e8eaef'}`,background:f.biz_type===bt.v?'#f0edff':'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:600,color:f.biz_type===bt.v?'#6c47ff':'#3d4350',transition:'all .15s'}}>
                          {bt.ico} {bt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12}}>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3d4350',marginBottom:6}}>Emri i Biznesit</label>
                      <input style={INP} value={f.biz_name} onChange={e=>set('biz_name',e.target.value)} placeholder="Elite Gym..." onFocus={onF} onBlur={onB}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3d4350',marginBottom:6}}>Qyteti *</label>
                      <select style={{...INP,cursor:'pointer'}} value={f.city} onChange={e=>set('city',e.target.value)} onFocus={onF} onBlur={onB} required>
                        <option value="">— Zgjidh —</option>
                        {CITIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orari */}
              <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaef',padding:isMobile?16:22,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#9aa0b0',marginBottom:4,textTransform:'uppercase',letterSpacing:'.07em'}}>Ora Preferenciale <span style={{fontWeight:400,textTransform:'none',letterSpacing:0,color:'#9aa0b0'}}>(opsionale)</span></div>
                <div style={{fontSize:12,color:'#9aa0b0',marginBottom:12}}>Zgjidh kur mund të flasim</div>
                <div style={{display:'grid',gridTemplateColumns:`repeat(${isMobile?2:4},1fr)`,gap:8}}>
                  {HOURS.map(h=>(
                    <button key={h} type="button" onClick={()=>toggleH(h)}
                      style={{padding:'9px 4px',borderRadius:9,border:`1.5px solid ${f.preferred_hours.includes(h)?'#6c47ff':'#e8eaef'}`,background:f.preferred_hours.includes(h)?'#f0edff':'#fff',color:f.preferred_hours.includes(h)?'#6c47ff':'#6b7385',fontSize:isMobile?11:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .15s',textAlign:'center'}}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mesazh */}
              <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaef',padding:isMobile?16:22,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
                <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3d4350',marginBottom:8}}>Çfarë dëshironi të shihni? <span style={{fontWeight:400,color:'#9aa0b0'}}>(opsionale)</span></label>
                <textarea style={{...INP,resize:'none',height:76}} value={f.message} onChange={e=>set('message',e.target.value)} placeholder="p.sh. QR check-in, menaxhim anëtarësh, rezervime online..." onFocus={onF} onBlur={onB}/>
              </div>

              <button type="submit" disabled={loading} style={{width:'100%',background:'#6c47ff',color:'#fff',border:'none',padding:'15px',borderRadius:11,fontSize:16,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity:loading?.7:1,transition:'all .2s',boxShadow:'0 4px 16px rgba(108,71,255,.35)'}}>
                {loading&&<div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                {loading?'Duke dërguar...':'Rezervo Demonstrimin Falas →'}
              </button>
              <p style={{textAlign:'center',fontSize:12,color:'#9aa0b0',marginTop:4}}>✅ 100% falas · Pa asnjë detyrim · Kontakt brenda 24 orësh</p>
            </form>
          </div>

          {/* ── RIGHT PANEL ── */}
          {(!isMobile||isTablet)&&(
            <div style={{display:'flex',flexDirection:'column',gap:12,position:isTablet?'static':'sticky',top:72}}>

              {/* Steps */}
              <div style={{background:'#0f1117',borderRadius:16,padding:22,color:'#fff'}}>
                <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.35)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:18}}>Çfarë ndodh pas</div>
                {[
                  ['1','Ne ju telefonojmë','Brenda 24 orësh.','#f0edff','#6c47ff'],
                  ['2','Caktojmë orën','Kohën që ju konvenon.','#dcfce7','#16a34a'],
                  ['3','Demo live 30 min','Vaqo për biznesin tuaj.','#fffbeb','#d97706'],
                  ['4','Filloni falas','30 ditë provë, pa kartë.','#f8f9fc','#6b7385'],
                ].map(([n,t,d,bg,col])=>(
                  <div key={n} style={{display:'flex',gap:12,marginBottom:14}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:col,flexShrink:0}}>{n}</div>
                    <div>
                      <div style={{fontWeight:600,fontSize:13,color:'#fff',marginBottom:2}}>{t}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,.35)',lineHeight:1.5}}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social proof */}
              <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaef',padding:20,boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
                <div style={{color:'#f59e0b',fontSize:13,letterSpacing:2,marginBottom:10}}>★★★★★</div>
                <p style={{fontSize:13,color:'#3d4350',lineHeight:1.7,fontStyle:'italic',marginBottom:14}}>
                  "Demo-ja ishte shumë e qartë. Filluam provën falas po atë ditë dhe tani kemi 2x më shumë rezervime."
                </p>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#6c47ff',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0}}>AK</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13}}>Artan Koci</div>
                    <div style={{fontSize:12,color:'#9aa0b0'}}>FitZone Gym, Tiranë</div>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8eaef',padding:'14px 18px',boxShadow:'0 1px 4px rgba(15,17,23,.04)'}}>
                {[
                  ['✅','30 ditë provë falas'],
                  ['💵','Pa kartë krediti'],
                  ['🔒','Anulo kurdo'],
                  ['⚡','Setup 30 minuta'],
                  ['🇦🇱','Support në shqip'],
                  ['📞','Ndihmë +355 692 291 041'],
                ].map(([ico,txt])=>(
                  <div key={txt} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:'1px solid #f4f6fa',fontSize:13,color:'#3d4350'}}>
                    <span style={{fontSize:15,width:22,textAlign:'center'}}>{ico}</span>
                    <span>{txt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
