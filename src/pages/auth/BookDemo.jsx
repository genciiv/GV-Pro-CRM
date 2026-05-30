import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const BIZ_TYPES = [
  { value:'gym',          label:'🏋️ Palestre & Gym' },
  { value:'yoga',         label:'🧘 Yoga Studio' },
  { value:'pilates',      label:'🤸 Pilates' },
  { value:'martial_arts', label:'🥊 Arte Marciale' },
  { value:'dance',        label:'💃 Studio Vallëzimi' },
  { value:'fitness',      label:'⚡ Functional Fitness' },
  { value:'barbershop',   label:'💈 Barbershop' },
  { value:'salon',        label:'💅 Sallon Bukurie' },
  { value:'spa',          label:'💆 Spa & Masazh' },
  { value:'wellness',     label:'🌿 Wellness Clinic' },
  { value:'other',        label:'🏢 Tjetër' },
]

const CITIES = ['Tiranë','Durrës','Shkodër','Vlorë','Elbasan','Korçë','Fier','Berat','Lushnjë','Kavajë','Lezhë','Tjetër']

const HOURS = [
  '09:00 – 10:00','10:00 – 11:00','11:00 – 12:00',
  '12:00 – 13:00','14:00 – 15:00','15:00 – 16:00',
  '16:00 – 17:00','17:00 – 18:00','18:00 – 19:00',
]

export default function BookDemo() {
  const [step, setStep] = useState(1) // 1: form, 2: success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    biz_type: '', city: '', biz_name: '',
    preferred_hours: [], message: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleHour = (h) => {
    const hours = form.preferred_hours.includes(h)
      ? form.preferred_hours.filter(x => x !== h)
      : [...form.preferred_hours, h]
    set('preferred_hours', hours)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.phone || !form.biz_type || !form.city) {
      setError('Plotëso të gjitha fushat e detyrueshme')
      return
    }

    setLoading(true)
    try {
      const { error: err } = await supabase.from('demo_requests').insert({
        name:            form.name.trim(),
        phone:           form.phone.trim(),
        email:           form.email.trim() || null,
        biz_type:        form.biz_type,
        biz_name:        form.biz_name.trim() || null,
        city:            form.city,
        preferred_hours: form.preferred_hours,
        message:         form.message.trim() || null,
        status:          'new',
      })
      if (err) throw new Error(err.message)
      setStep(2)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const INP = {
    width: '100%', border: '1.5px solid #e4e4e7', borderRadius: 10,
    padding: '12px 14px', fontSize: 15, fontFamily: 'inherit',
    outline: 'none', background: '#fff', color: '#18181b',
    transition: 'border-color .15s',
  }

  const onFocus = e => e.target.style.borderColor = '#18181b'
  const onBlur  = e => e.target.style.borderColor = '#e4e4e7'

  if (step === 2) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', padding:24, fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:20, padding:56, maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,.08)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'#f0fdf4', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 24px' }}>✅</div>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:28, fontWeight:900, marginBottom:12 }}>Demo u Rezervua!</h2>
        <p style={{ fontSize:15, color:'#52525b', lineHeight:1.75, marginBottom:8 }}>
          Faleminderit <strong>{form.name}</strong>!
        </p>
        <p style={{ fontSize:15, color:'#52525b', lineHeight:1.75, marginBottom:32 }}>
          Do t'ju kontaktojmë brenda <strong>24 orësh</strong> në numrin <strong>{form.phone}</strong> për të caktuar demonstrimin.
        </p>

        <div style={{ background:'#f8f8f8', borderRadius:12, padding:20, marginBottom:28, textAlign:'left' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#a1a1aa', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Detajet e kërkesës</div>
          {[
            ['👤 Emri', form.name],
            ['📞 Telefon', form.phone],
            ['🏢 Lloji', BIZ_TYPES.find(b=>b.value===form.biz_type)?.label || form.biz_type],
            ['📍 Qyteti', form.city],
            ...(form.preferred_hours.length ? [['🕐 Orari preferencial', form.preferred_hours.join(', ')]] : []),
          ].map(([l,v]) => (
            <div key={l} style={{ display:'flex', gap:12, padding:'6px 0', borderBottom:'1px solid #f0f0f0', fontSize:13 }}>
              <span style={{ color:'#71717a', minWidth:120 }}>{l}</span>
              <span style={{ fontWeight:500 }}>{v}</span>
            </div>
          ))}
        </div>

        <button onClick={()=>window.location.href='/'} style={{ background:'#18181b', color:'#fff', border:'none', padding:'13px 32px', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', width:'100%' }}>
          ← Kthehu në Kryefaqe
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#fafafa', fontFamily:"system-ui,-apple-system,sans-serif" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Nav */}
      <nav style={{ background:'rgba(255,255,255,.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(0,0,0,.07)', height:58, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <button onClick={()=>window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>💪</div>
          <span style={{ fontSize:20, fontWeight:900, color:'#18181b', fontFamily:'Georgia,serif' }}>Vaqo</span>
        </button>
        <div style={{ fontSize:13, color:'#71717a' }}>
          Ke pyetje? <a href="tel:+355690000000" style={{ color:'#18181b', fontWeight:700, textDecoration:'none' }}>Na telefono</a>
        </div>
      </nav>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'56px 24px 80px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 420px', gap:56, alignItems:'start' }}>

          {/* LEFT — Form */}
          <div style={{ animation:'fadeUp .6s ease both' }}>
            {/* Header */}
            <div style={{ marginBottom:36 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:100, padding:'5px 14px', fontSize:12, fontWeight:700, color:'#16a34a', marginBottom:20 }}>
                📅 Demo Falas · 30 Minuta
              </div>
              <h1 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(28px,4vw,44px)', fontWeight:900, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:14 }}>
                Shiko Vaqo<br/>
                <span style={{ color:'#7c3aed' }}>Live në Biznesin Tënd</span>
              </h1>
              <p style={{ fontSize:16, color:'#52525b', lineHeight:1.75 }}>
                Rezervo 30 minuta me ekipin tonë. Të tregojmë saktësisht si Vaqo funksionon për llojin tuaj të biznesit — live, pa prezantime të gatshme.
              </p>
            </div>

            {/* Form */}
            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 16px', marginBottom:20, fontSize:14, color:'#dc2626' }}>
                ❌ {error}
              </div>
            )}

            <form onSubmit={submit}>
              {/* Kontakti */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e4e4e7', padding:24, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#18181b', marginBottom:16, textTransform:'uppercase', letterSpacing:'.06em' }}>👤 Informacioni Juaj</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Emri i Plotë *</label>
                    <input style={INP} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Emri Mbiemri" onFocus={onFocus} onBlur={onBlur} required/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Telefon *</label>
                      <input style={INP} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+355 69..." onFocus={onFocus} onBlur={onBlur} required/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Email (opsionale)</label>
                      <input type="email" style={INP} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@..." onFocus={onFocus} onBlur={onBlur}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biznesi */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e4e4e7', padding:24, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#18181b', marginBottom:16, textTransform:'uppercase', letterSpacing:'.06em' }}>🏢 Biznesi Juaj</div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Lloji i Biznesit *</label>
                    <select style={{ ...INP, cursor:'pointer' }} value={form.biz_type} onChange={e=>set('biz_type',e.target.value)} onFocus={onFocus} onBlur={onBlur} required>
                      <option value="">— Zgjidh llojin —</option>
                      {BIZ_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Emri i Biznesit</label>
                      <input style={INP} value={form.biz_name} onChange={e=>set('biz_name',e.target.value)} placeholder="p.sh. Elite Gym" onFocus={onFocus} onBlur={onBlur}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Qyteti *</label>
                      <select style={{ ...INP, cursor:'pointer' }} value={form.city} onChange={e=>set('city',e.target.value)} onFocus={onFocus} onBlur={onBlur} required>
                        <option value="">— Zgjidh qytetin —</option>
                        {CITIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orari */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e4e4e7', padding:24, marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#18181b', marginBottom:6, textTransform:'uppercase', letterSpacing:'.06em' }}>🕐 Kur Mund të Flasim?</div>
                <div style={{ fontSize:12, color:'#71717a', marginBottom:14 }}>Zgjidh një ose më shumë orë preferenciale (opsionale)</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {HOURS.map(h => (
                    <button key={h} type="button" onClick={()=>toggleHour(h)}
                      style={{ padding:'9px 6px', borderRadius:9, border:`1.5px solid ${form.preferred_hours.includes(h)?'#18181b':'#e4e4e7'}`, background:form.preferred_hours.includes(h)?'#18181b':'#fff', color:form.preferred_hours.includes(h)?'#fff':'#52525b', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', transition:'all .15s' }}>
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mesazh */}
              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e4e4e7', padding:24, marginBottom:24 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:8 }}>💬 Çfarë dëshironi të shihni? (opsionale)</label>
                <textarea style={{ ...INP, resize:'none', height:90 }} value={form.message} onChange={e=>set('message',e.target.value)} placeholder="p.sh. Si funksionon QR check-in, si menaxhohen anëtarët..." onFocus={onFocus} onBlur={onBlur}/>
              </div>

              <button type="submit" disabled={loading} style={{ width:'100%', background:'#18181b', color:'#fff', border:'none', padding:'15px', borderRadius:11, fontSize:16, fontWeight:700, cursor:loading?'wait':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity:loading?.7:1 }}>
                {loading && <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>}
                {loading ? 'Duke dërguar...' : '📅 Rezervo Demonstrimin Falas'}
              </button>

              <p style={{ textAlign:'center', fontSize:12, color:'#a1a1aa', marginTop:12 }}>
                ✅ 100% falas · Pa asnjë detyrim · Do t'ju kontaktojmë brenda 24 orësh
              </p>
            </form>
          </div>

          {/* RIGHT — Info panel */}
          <div style={{ position:'sticky', top:80 }}>
            {/* What happens */}
            <div style={{ background:'#18181b', borderRadius:16, padding:28, color:'#fff', marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,.4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:20 }}>Çfarë ndodh pas rezervimit</div>
              {[
                ['1','📞','Ne ju telefonojmë','Brenda 24 orësh në numrin tuaj.'],
                ['2','📅','Caktojmë orën','Zgjedhim kohën që ju konvenon.'],
                ['3','💻','Demo Live 30 min','Tregojmë Vaqo live për biznesin tuaj.'],
                ['4','🚀','Filloni Falas','30 ditë provë pa asnjë pagesë.'],
              ].map(([n,ico,t,d]) => (
                <div key={n} style={{ display:'flex', gap:14, marginBottom:20 }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{ico}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:'#fff', marginBottom:3 }}>{t}</div>
                    <div style={{ fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.5 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div style={{ background:'#fff', borderRadius:16, border:'1px solid #e4e4e7', padding:24, marginBottom:16 }}>
              <div style={{ color:'#f59e0b', fontSize:13, letterSpacing:3, marginBottom:12 }}>★★★★★</div>
              <p style={{ fontSize:14, color:'#18181b', lineHeight:1.7, fontStyle:'italic', marginBottom:16 }}>
                "Demo-ja ishte shumë e qartë. Brenda 30 minutave e kuptuam si funksionon gjithçka dhe filluam provën falas po atë ditë."
              </p>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'#18181b', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>AK</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:13 }}>Artan Koci</div>
                  <div style={{ fontSize:12, color:'#71717a' }}>FitZone Gym, Tiranë</div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div style={{ background:'#f8f8f8', borderRadius:12, padding:18 }}>
              {[
                ['✅','30 ditë provë falas'],
                ['💵','Pa kartë krediti'],
                ['🔒','Anulo kurdo'],
                ['⚡','Setup 30 minuta'],
                ['🇦🇱','Support në shqip'],
              ].map(([ico,txt]) => (
                <div key={txt} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 0', borderBottom:'1px solid #f0f0f0', fontSize:13, color:'#52525b' }}>
                  <span>{ico}</span><span>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
