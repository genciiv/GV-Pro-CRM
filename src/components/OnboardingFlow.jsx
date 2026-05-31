// src/components/OnboardingFlow.jsx
// Onboarding 4-hapa për biznese të reja

import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { VaqoLogo } from './VaqoLogo'

const CITIES = ['Tiranë','Durrës','Shkodër','Vlorë','Elbasan','Korçë','Fier','Berat','Lushnjë','Kavajë','Lezhë','Tjetër']
const BIZ_TYPES = [
  {v:'gym',l:'🏋️ Palestre & Gym'},{v:'yoga',l:'🧘 Yoga Studio'},
  {v:'pilates',l:'🤸 Pilates'},{v:'martial_arts',l:'🥊 Arte Marciale'},
  {v:'dance',l:'💃 Studio Vallëzimi'},{v:'fitness',l:'⚡ Functional Fitness'},
  {v:'barbershop',l:'💈 Barbershop'},{v:'salon',l:'💅 Sallon Bukurie'},
  {v:'spa',l:'💆 Spa & Masazh'},{v:'wellness',l:'🌿 Wellness Clinic'},
]

function Step({ n, label, active, done }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:8,opacity:active||done?1:.4,transition:'opacity .3s'}}>
      <div style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,flexShrink:0,background:done?'#16a34a':active?'#7c3aed':'#e4e4e7',color:done||active?'#fff':'#a1a1aa',transition:'all .3s'}}>
        {done ? '✓' : n}
      </div>
      <div style={{fontSize:13,fontWeight:done||active?600:400,color:done?'#16a34a':active?'#7c3aed':'#a1a1aa',transition:'color .3s',whiteSpace:'nowrap'}}>
        {label}
      </div>
    </div>
  )
}

function ProgressBar({ step, total=4 }) {
  return (
    <div style={{height:4,background:'#f0f0f0',borderRadius:2,overflow:'hidden',margin:'24px 0'}}>
      <div style={{height:'100%',background:'linear-gradient(90deg,#7c3aed,#a78bfa)',borderRadius:2,width:`${(step/total)*100}%`,transition:'width .4s cubic-bezier(.4,0,.2,1)'}}/>
    </div>
  )
}

const INP = {width:'100%',border:'1.5px solid #e4e4e7',borderRadius:10,padding:'12px 14px',fontSize:15,fontFamily:'inherit',outline:'none',background:'#fff',color:'#18181b',transition:'border-color .15s',boxSizing:'border-box'}
const onF = e=>e.target.style.borderColor='#7c3aed'
const onB = e=>e.target.style.borderColor='#e4e4e7'

export default function OnboardingFlow({ gymId, onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testResult, setTestResult] = useState(null)

  // Step 1 data
  const [s1, setS1] = useState({ name:'', biz_type:'gym', city:'Tiranë', phone:'', address:'', logo_url:'' })
  // Step 2 data
  const [s2, setS2] = useState({ name:'', price:'', duration:30, category:'hair' })
  // Step 3 data
  const [s3, setS3] = useState({ first_name:'', last_name:'', role:'receptionist', phone:'', email:'' })
  // Step 4 data
  const [s4, setS4] = useState({ client_name:'', client_phone:'', client_email:'', service_id:null, date:'', time:'10:00' })
  const [savedService, setSavedService] = useState(null)

  const next = () => { setError(''); setStep(s=>s+1) }
  const prev = () => { setError(''); setStep(s=>s-1) }

  // ── STEP 1 — Save business info
  async function saveStep1() {
    if (!s1.name.trim()) return setError('Emri i biznesit është i detyrueshëm')
    setLoading(true)
    try {
      const { error: err } = await supabase.from('gyms').update({
        name: s1.name.trim(),
        business_type: s1.biz_type,
        city: s1.city,
        phone: s1.phone.trim(),
        address: s1.address.trim(),
        onboarding_step: 2,
      }).eq('id', gymId)
      if (err) throw err
      next()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── STEP 2 — Save first service
  async function saveStep2() {
    if (!s2.name.trim()) return setError('Emri i shërbimit është i detyrueshëm')
    setLoading(true)
    try {
      const { data, error: err } = await supabase.from('services').insert({
        gym_id: gymId,
        name: s2.name.trim(),
        price: Number(s2.price)||0,
        duration_min: Number(s2.duration)||30,
        category: s2.category,
        is_active: true,
      }).select().single()
      if (err) throw err
      setSavedService(data)
      await supabase.from('gyms').update({ onboarding_step: 3 }).eq('id', gymId)
      next()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── STEP 3 — Save first staff (optional)
  async function saveStep3(skip=false) {
    if (!skip && !s3.first_name.trim()) return setError('Emri i stafit është i detyrueshëm')
    setLoading(true)
    try {
      if (!skip) {
        const { error: err } = await supabase.from('staff').insert({
          gym_id: gymId,
          first_name: s3.first_name.trim(),
          last_name: s3.last_name.trim(),
          role: s3.role,
          phone: s3.phone.trim(),
          email: s3.email.trim(),
          is_active: true,
        })
        if (err) throw err
      }
      await supabase.from('gyms').update({ onboarding_step: 4 }).eq('id', gymId)
      next()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  // ── STEP 4 — Test booking
  async function testBooking() {
    if (!s4.client_name.trim()) return setError('Emri i klientit është i detyrueshëm')
    if (!s4.date) return setError('Zgjidh datën')
    setLoading(true)
    try {
      const { data, error: err } = await supabase.from('appointments').insert({
        gym_id: gymId,
        service_id: savedService?.id,
        client_name: s4.client_name.trim(),
        client_phone: s4.client_phone.trim(),
        client_email: s4.client_email.trim(),
        appointment_date: s4.date,
        start_time: s4.time + ':00',
        status: 'confirmed',
        price: savedService?.price||0,
        is_test: true,
      }).select().single()
      if (err) throw err
      setTestResult(data)
      await supabase.from('gyms').update({ onboarding_step: 5, onboarding_done: true }).eq('id', gymId)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const STEPS = ['Biznesi','Shërbimi','Stafi','Testo']
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div style={{minHeight:'100vh',background:'#fafafa',display:'flex',flexDirection:'column',fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pop{0%{transform:scale(.8)}60%{transform:scale(1.05)}100%{transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Top nav */}
      <div style={{background:'#fff',borderBottom:'1px solid #f0f0f0',padding:'14px 32px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <VaqoLogo size="sm"/>
        <div style={{fontSize:13,color:'#71717a'}}>Konfigurimi Fillestar · Hapi {step} nga 4</div>
        <div style={{fontSize:12,color:'#a1a1aa'}}>Ndihmë? <a href="mailto:support@vaqo.al" style={{color:'#7c3aed',textDecoration:'none'}}>support@vaqo.al</a></div>
      </div>

      <div style={{flex:1,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px'}}>
        <div style={{width:'100%',maxWidth:680,animation:'fadeUp .5s ease both'}}>

          {/* Step indicators */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8,flexWrap:'wrap'}}>
            {STEPS.map((l,i)=>(
              <>
                <Step key={i} n={i+1} label={l} active={step===i+1} done={step>i+1}/>
                {i<STEPS.length-1&&<div key={`sep-${i}`} style={{flex:'0 0 24px',height:1,background:'#e4e4e7'}}/>}
              </>
            ))}
          </div>
          <ProgressBar step={step}/>

          {error && (
            <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:10,padding:'11px 16px',marginBottom:16,fontSize:14,color:'#dc2626',display:'flex',gap:8}}>
              ❌ {error}
            </div>
          )}

          {/* ════ STEP 1 — Business Info ════ */}
          {step===1&&(
            <div>
              <div style={{fontFamily:'Georgia,serif',fontSize:26,fontWeight:900,marginBottom:6}}>👋 Mirë se vini te Vaqo!</div>
              <div style={{fontSize:14,color:'#71717a',marginBottom:28,lineHeight:1.7}}>Le të konfigurojmë biznesin tuaj. Merr vetëm 5 minuta.</div>

              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Emri i Biznesit *</label>
                  <input style={INP} value={s1.name} onChange={e=>setS1(p=>({...p,name:e.target.value}))} placeholder="p.sh. Elite Gym Tiranë" onFocus={onF} onBlur={onB}/>
                </div>

                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Lloji i Biznesit *</label>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {BIZ_TYPES.map(bt=>(
                      <button key={bt.v} onClick={()=>setS1(p=>({...p,biz_type:bt.v}))} style={{padding:'10px 14px',borderRadius:9,border:`1.5px solid ${s1.biz_type===bt.v?'#7c3aed':'#e4e4e7'}`,background:s1.biz_type===bt.v?'#f5f3ff':'#fff',color:s1.biz_type===bt.v?'#7c3aed':'#52525b',fontSize:13,fontWeight:s1.biz_type===bt.v?700:400,cursor:'pointer',fontFamily:'inherit',textAlign:'left',transition:'all .15s'}}>
                        {bt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Qyteti *</label>
                    <select style={{...INP,cursor:'pointer'}} value={s1.city} onChange={e=>setS1(p=>({...p,city:e.target.value}))} onFocus={onF} onBlur={onB}>
                      {CITIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Numri i Telefonit</label>
                    <input style={INP} value={s1.phone} onChange={e=>setS1(p=>({...p,phone:e.target.value}))} placeholder="+355 69..." onFocus={onF} onBlur={onB}/>
                  </div>
                </div>

                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Adresa</label>
                  <input style={INP} value={s1.address} onChange={e=>setS1(p=>({...p,address:e.target.value}))} placeholder="Rruga, numri..." onFocus={onF} onBlur={onB}/>
                </div>
              </div>

              <button onClick={saveStep1} disabled={loading} style={{width:'100%',marginTop:28,background:'#7c3aed',color:'#fff',border:'none',padding:'14px',borderRadius:11,fontSize:15,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity:loading?.7:1,transition:'opacity .2s'}}>
                {loading&&<div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                {loading?'Duke ruajtur...':'Hapi 2: Shto Shërbimin →'}
              </button>
            </div>
          )}

          {/* ════ STEP 2 — First Service ════ */}
          {step===2&&(
            <div>
              <div style={{fontFamily:'Georgia,serif',fontSize:26,fontWeight:900,marginBottom:6}}>✂️ Shto Shërbimin e Parë</div>
              <div style={{fontSize:14,color:'#71717a',marginBottom:28,lineHeight:1.7}}>Çfarë ofron biznesi juaj? Mund të shtoni shumë shërbime pastaj.</div>

              <div style={{background:'#f5f3ff',border:'1px solid #ddd6fe',borderRadius:12,padding:'14px 18px',marginBottom:24,fontSize:13,color:'#6d28d9'}}>
                💡 Shembuj: "Prerje flokësh", "Masazh 60 min", "Klasë Yoga", "Abonim Mujor"
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Emri i Shërbimit *</label>
                  <input style={INP} value={s2.name} onChange={e=>setS2(p=>({...p,name:e.target.value}))} placeholder="p.sh. Prerje + Rregullim" onFocus={onF} onBlur={onB}/>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Çmimi (L)</label>
                    <input type="number" style={INP} value={s2.price} onChange={e=>setS2(p=>({...p,price:e.target.value}))} placeholder="1000" onFocus={onF} onBlur={onB}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Kohëzgjatja (minuta)</label>
                    <select style={{...INP,cursor:'pointer'}} value={s2.duration} onChange={e=>setS2(p=>({...p,duration:Number(e.target.value)}))} onFocus={onF} onBlur={onB}>
                      {[15,20,30,45,60,75,90,120].map(m=><option key={m} value={m}>{m} min</option>)}
                    </select>
                  </div>
                </div>

                {/* Preview */}
                {s2.name&&(
                  <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:12,padding:18,display:'flex',gap:14,alignItems:'center'}}>
                    <div style={{width:48,height:48,borderRadius:12,background:'#f5f3ff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>✂️</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15}}>{s2.name}</div>
                      <div style={{fontSize:13,color:'#71717a',marginTop:3}}>⏱ {s2.duration} min &nbsp;·&nbsp; 💰 {Number(s2.price||0).toLocaleString('sq-AL')} L</div>
                    </div>
                    <div style={{fontSize:11,background:'#dcfce7',color:'#15803d',padding:'3px 10px',borderRadius:20,fontWeight:700}}>Gati</div>
                  </div>
                )}
              </div>

              <div style={{display:'flex',gap:10,marginTop:28}}>
                <button onClick={prev} style={{padding:'14px 24px',borderRadius:10,border:'1px solid #e4e4e7',background:'#fff',color:'#52525b',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Prapa</button>
                <button onClick={saveStep2} disabled={loading} style={{flex:1,background:'#7c3aed',color:'#fff',border:'none',padding:'14px',borderRadius:11,fontSize:15,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity:loading?.7:1}}>
                  {loading&&<div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                  {loading?'Duke ruajtur...':'Hapi 3: Shto Stafin →'}
                </button>
              </div>
            </div>
          )}

          {/* ════ STEP 3 — First Staff ════ */}
          {step===3&&(
            <div>
              <div style={{fontFamily:'Georgia,serif',fontSize:26,fontWeight:900,marginBottom:6}}>👤 Shto Anëtarin e Parë të Stafit</div>
              <div style={{fontSize:14,color:'#71717a',marginBottom:28,lineHeight:1.7}}>Opsionale — mund ta bëni pastaj nga dashboard-i.</div>

              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Emri *</label>
                    <input style={INP} value={s3.first_name} onChange={e=>setS3(p=>({...p,first_name:e.target.value}))} placeholder="Artan" onFocus={onF} onBlur={onB}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Mbiemri</label>
                    <input style={INP} value={s3.last_name} onChange={e=>setS3(p=>({...p,last_name:e.target.value}))} placeholder="Koci" onFocus={onF} onBlur={onB}/>
                  </div>
                </div>

                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Roli</label>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {[['receptionist','🗂️ Recepsionist'],['trainer','💪 Trajner'],['barber','✂️ Berber'],['therapist','💆 Terapist'],['instructor','🧘 Instruktor'],['manager','👔 Menaxher']].map(([v,l])=>(
                      <button key={v} onClick={()=>setS3(p=>({...p,role:v}))} style={{padding:'8px 14px',borderRadius:8,border:`1.5px solid ${s3.role===v?'#7c3aed':'#e4e4e7'}`,background:s3.role===v?'#f5f3ff':'#fff',color:s3.role===v?'#7c3aed':'#52525b',fontSize:13,fontWeight:s3.role===v?700:400,cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Telefon</label>
                    <input style={INP} value={s3.phone} onChange={e=>setS3(p=>({...p,phone:e.target.value}))} placeholder="+355 69..." onFocus={onF} onBlur={onB}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Email</label>
                    <input type="email" style={INP} value={s3.email} onChange={e=>setS3(p=>({...p,email:e.target.value}))} placeholder="artan@..." onFocus={onF} onBlur={onB}/>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',gap:10,marginTop:28}}>
                <button onClick={prev} style={{padding:'14px 24px',borderRadius:10,border:'1px solid #e4e4e7',background:'#fff',color:'#52525b',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Prapa</button>
                <button onClick={()=>saveStep3(true)} style={{padding:'14px 20px',borderRadius:10,border:'1px solid #e4e4e7',background:'#fff',color:'#71717a',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>Kalo →</button>
                <button onClick={()=>saveStep3(false)} disabled={loading} style={{flex:1,background:'#7c3aed',color:'#fff',border:'none',padding:'14px',borderRadius:11,fontSize:15,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity:loading?.7:1}}>
                  {loading&&<div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                  {loading?'Duke ruajtur...':'Ruaj dhe Vazhdo →'}
                </button>
              </div>
            </div>
          )}

          {/* ════ STEP 4 — Test Booking ════ */}
          {step===4&&!testResult&&(
            <div>
              <div style={{fontFamily:'Georgia,serif',fontSize:26,fontWeight:900,marginBottom:6}}>🚀 Testo Rezervimin e Parë!</div>
              <div style={{fontSize:14,color:'#71717a',marginBottom:28,lineHeight:1.7}}>Krijo një rezervim test për të parë si funksionon sistemi.</div>

              <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'14px 18px',marginBottom:24,display:'flex',gap:12,alignItems:'center'}}>
                <div style={{fontSize:22}}>✅</div>
                <div style={{fontSize:13,color:'#15803d'}}>
                  Shërbimi "{savedService?.name}" u shtua me sukses! Tani krijo rezervimin e parë.
                </div>
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div>
                  <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Emri i Klientit *</label>
                  <input style={INP} value={s4.client_name} onChange={e=>setS4(p=>({...p,client_name:e.target.value}))} placeholder="Emri Mbiemri" onFocus={onF} onBlur={onB}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Telefon</label>
                    <input style={INP} value={s4.client_phone} onChange={e=>setS4(p=>({...p,client_phone:e.target.value}))} placeholder="+355 69..." onFocus={onF} onBlur={onB}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Email</label>
                    <input type="email" style={INP} value={s4.client_email} onChange={e=>setS4(p=>({...p,client_email:e.target.value}))} placeholder="klient@..." onFocus={onF} onBlur={onB}/>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Data *</label>
                    <input type="date" style={INP} value={s4.date} min={todayStr} onChange={e=>setS4(p=>({...p,date:e.target.value}))} onFocus={onF} onBlur={onB}/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Ora</label>
                    <select style={{...INP,cursor:'pointer'}} value={s4.time} onChange={e=>setS4(p=>({...p,time:e.target.value}))} onFocus={onF} onBlur={onB}>
                      {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'].map(t=><option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{display:'flex',gap:10,marginTop:28}}>
                <button onClick={prev} style={{padding:'14px 24px',borderRadius:10,border:'1px solid #e4e4e7',background:'#fff',color:'#52525b',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>← Prapa</button>
                <button onClick={testBooking} disabled={loading} style={{flex:1,background:'#18181b',color:'#fff',border:'none',padding:'14px',borderRadius:11,fontSize:15,fontWeight:700,cursor:loading?'wait':'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:10,opacity:loading?.7:1}}>
                  {loading&&<div style={{width:18,height:18,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
                  {loading?'Duke krijuar...':'🚀 Krijo Rezervimin!'}
                </button>
              </div>
            </div>
          )}

          {/* ════ SUCCESS ════ */}
          {testResult&&(
            <div style={{textAlign:'center',animation:'fadeUp .5s ease both',padding:'20px 0'}}>
              <div style={{width:90,height:90,borderRadius:'50%',background:'#f0fdf4',border:'3px solid #bbf7d0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:44,margin:'0 auto 24px',animation:'pop .5s ease both'}}>🎉</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:28,fontWeight:900,marginBottom:10}}>Rezervimi u krijua!</div>
              <div style={{fontSize:15,color:'#52525b',lineHeight:1.75,marginBottom:32}}>
                Biznesi juaj është gati! Dashboard-i ju pret me të gjitha funksionet.
              </div>

              <div style={{background:'#fff',border:'1px solid #e4e4e7',borderRadius:14,padding:24,textAlign:'left',marginBottom:28}}>
                <div style={{fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'#a1a1aa',marginBottom:14}}>Rezervimi i parë</div>
                {[
                  ['👤 Klienti', testResult.client_name],
                  ['✂️ Shërbimi', savedService?.name],
                  ['📅 Data', new Date(testResult.appointment_date).toLocaleDateString('sq-AL',{weekday:'long',day:'numeric',month:'long'})],
                  ['🕐 Ora', testResult.start_time?.slice(0,5)],
                  ['💰 Çmimi', `${(testResult.price||0).toLocaleString('sq-AL')} L`],
                ].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f5f5f5',fontSize:14}}>
                    <span style={{color:'#71717a'}}>{l}</span>
                    <span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div style={{background:'#f5f3ff',borderRadius:12,padding:18,textAlign:'center'}}>
                  <div style={{fontSize:24,marginBottom:6}}>📊</div>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>Hapi tjetër</div>
                  <div style={{fontSize:12,color:'#71717a'}}>Shto anëtarë dhe menaxho rezervimet</div>
                </div>
                <div style={{background:'#f0fdf4',borderRadius:12,padding:18,textAlign:'center'}}>
                  <div style={{fontSize:24,marginBottom:6}}>📱</div>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>QR Check-in</div>
                  <div style={{fontSize:12,color:'#71717a'}}>Klientët skanojnë dhe hyjnë automatikisht</div>
                </div>
              </div>

              <button onClick={onComplete} style={{width:'100%',marginTop:24,background:'#7c3aed',color:'#fff',border:'none',padding:'15px',borderRadius:11,fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.background='#6d28d9'}
                onMouseLeave={e=>e.currentTarget.style.background='#7c3aed'}>
                Shko te Dashboard → 🚀
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
