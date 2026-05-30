import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'

export default function Register() {
  const { loginWithGoogle, loginWithApple } = useAuth()
  const [step, setStep] = useState(1)
  const [googleLoad, setGoogleLoad] = useState(false)
  const [appleLoad,  setAppleLoad]  = useState(false) // 1: form, 2: success
  const [form, setForm] = useState({ email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) { setError('Fjalëkalimi duhet të jetë të paktën 6 karaktere'); return }
    if (form.password !== form.confirm) { setError('Fjalëkalimet nuk përputhen'); return }

    setLoading(true)
    try {
      // Kontrollo nëse emaili ekziston te members
      const { data: member } = await supabase
        .from('members')
        .select('id, first_name, last_name, gym_id')
        .eq('email', form.email.trim().toLowerCase())
        .eq('is_active', true)
        .maybeSingle()

      if (!member) {
        setError('Emaili nuk u gjet. Sigurohu që emaili është i njëjtë me atë që ke dhënë te palestra.')
        setLoading(false)
        return
      }

      // Krijo account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { member_id: member.id }
        }
      })

      if (signUpError) {
        // Nëse useri ekziston, provo login
        if (signUpError.message.includes('already registered')) {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: form.email.trim().toLowerCase(),
            password: form.password,
          })
          if (loginError) {
            setError('Ky email është i regjistruar tashmë. Provo të hysh direkt nga Login.')
            setLoading(false)
            return
          }
          window.location.href = '/'
          return
        }
        throw new Error(signUpError.message)
      }

      // Lidh auth_id me member
      if (data.user) {
        await supabase
          .from('members')
          .update({ auth_id: data.user.id })
          .eq('id', member.id)
          .is('auth_id', null)
      }

      setStep(2)
    } catch(e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 2) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa', padding:24 }}>
      <div style={{ background:'#fff', borderRadius:16, padding:48, maxWidth:420, width:'100%', textAlign:'center', boxShadow:'0 4px 24px rgba(0,0,0,.08)' }}>
        <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
        <div style={{ fontFamily:'serif', fontSize:24, fontWeight:900, marginBottom:10 }}>Llogaria u Krijua!</div>
        <div style={{ fontSize:14, color:'#71717a', lineHeight:1.7, marginBottom:28 }}>
          Mirë se vini në Vaqo! 💪<br/>
          Tani mund të hyni dhe të shihni abonimin, planet e stërvitjes dhe shumë më tepër.
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          style={{ background:'#18181b', color:'#fff', border:'none', padding:'13px 32px', borderRadius:10, fontSize:15, fontWeight:600, cursor:'pointer', width:'100%' }}>
          Hyr në App →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#fafafa', fontFamily:"'Geist',-apple-system,sans-serif" }}>
      <style>{`
        .reg-input{width:100%;background:#fff;border:1.5px solid #e4e4e7;color:#18181b;border-radius:10px;padding:13px 14px;font-family:inherit;font-size:15px;outline:none;transition:border-color .15s}
        .reg-input:focus{border-color:#18181b;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
      `}</style>

      {/* Left — Form */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
        <div style={{ width:'100%', maxWidth:400 }}>

          {/* Logo */}
          <button onClick={()=>window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0, marginBottom:36 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>💪</div>
            <span style={{ fontWeight:700, fontSize:17, color:'#18181b' }}>Vaqo</span>
          </button>

          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontFamily:'serif', fontSize:28, fontWeight:900, marginBottom:6 }}>Krijo Llogarinë</h1>
            <p style={{ fontSize:14, color:'#71717a', lineHeight:1.6 }}>
              Regjistrohu me emailin që ke dhënë te palestra jote.
            </p>
          </div>

          {/* Info box */}
          <div style={{ background:'#eff6ff', border:'1px solid #dbeafe', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:13, color:'#1e40af', lineHeight:1.6 }}>
            ℹ️ Përdor emailin që ke dhënë kur u regjistrove te palestra. Nëse nuk e di, kontakto recepsionin.
          </div>

          {/* Google */}
          <button onClick={async()=>{setGoogleLoad(true);try{await loginWithGoogle()}catch(e){setGoogleLoad(false)}}}
            disabled={googleLoad}
            style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:13,borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s',border:'1.5px solid #e4e4e7',background:'#fff',color:'#18181b',marginBottom:10}}>
            {googleLoad?<div style={{width:18,height:18,border:'2px solid #e4e4e7',borderTopColor:'#18181b',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>:<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>}
            {googleLoad?'Duke u lidhur...':'Regjistrohu me Google'}
          </button>

          {/* Apple */}
          <button onClick={async()=>{setAppleLoad(true);try{await loginWithApple()}catch(e){setAppleLoad(false)}}}
            disabled={appleLoad}
            style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:10,padding:13,borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s',border:'1.5px solid #e4e4e7',background:'#fff',color:'#18181b',marginBottom:16}}>
            {appleLoad?<div style={{width:18,height:18,border:'2px solid #e4e4e7',borderTopColor:'#18181b',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>:<svg width="18" height="18" viewBox="0 0 814 1000"><path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 383.8 41.3 451.4 41.3 341.5 41.3 145.5 176.4 40 309.8 40c68.7 0 125.5 44.8 168.5 44.8 41.5 0 106.8-45.3 182.3-45.3zM552 95.4c-35 0-84.7 23.3-113.7 50-22.7 21.3-44.2 57.3-44.2 93.7 0 4.7.7 9.3.7 13.5 3.2.3 6.2.7 10.2.7 34.3 0 83-21 110.3-47.3 26.5-25.3 47.5-60.3 47.5-95 0-4.7-.7-9-1.5-13.4-3.2-.5-6.2-.2-9.3-.2z"/></svg>}
            {appleLoad?'Duke u lidhur...':'Regjistrohu me Apple'}
          </button>

          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
            <div style={{flex:1,height:1,background:'#e4e4e7'}}/>
            <span style={{fontSize:12,color:'#a1a1aa'}}>ose me email</span>
            <div style={{flex:1,height:1,background:'#e4e4e7'}}/>
          </div>

          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:13, color:'#991b1b' }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>
                Email (i njëjtë me palestrën) *
              </label>
              <input
                className="reg-input" type="email" required
                value={form.email} onChange={e=>set('email',e.target.value)}
                placeholder="email@juaj.al"
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>
                Fjalëkalimi (min. 6 karaktere) *
              </label>
              <div style={{ position:'relative' }}>
                <input
                  className="reg-input"
                  type={showPass?'text':'password'} required
                  value={form.password} onChange={e=>set('password',e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingRight:46 }}
                  autoComplete="new-password"
                />
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                  style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#a1a1aa' }}>
                  {showPass?'🙈':'👁️'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>
                Konfirmo Fjalëkalimin *
              </label>
              <input
                className="reg-input"
                type={showPass?'text':'password'} required
                value={form.confirm} onChange={e=>set('confirm',e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* Password strength */}
            {form.password && (
              <div>
                <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                  {[1,2,3,4].map(i=>(
                    <div key={i} style={{ flex:1, height:3, borderRadius:2, background:
                      form.password.length >= i*3
                        ? i<=1?'#dc2626':i<=2?'#d97706':i<=3?'#2563eb':'#16a34a'
                        : '#e4e4e7'
                    }}/>
                  ))}
                </div>
                <div style={{ fontSize:11, color:'#71717a' }}>
                  {form.password.length<6?'Shumë i shkurtër':form.password.length<9?'I dobët':form.password.length<12?'Mesatar':'I fortë ✅'}
                </div>
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ background:'#18181b', color:'#fff', border:'none', padding:'14px', borderRadius:10, fontSize:15, fontWeight:600, cursor:loading?'wait':'pointer', fontFamily:'inherit', marginTop:4, opacity:loading?.7:1 }}>
              {loading ? '⏳ Duke krijuar...' : '✅ Krijo Llogarinë'}
            </button>
          </form>

          <div style={{ marginTop:24, textAlign:'center', fontSize:13, color:'#71717a' }}>
            Ke llogari?{' '}
            <a href="/login" style={{ color:'#18181b', fontWeight:600, textDecoration:'none' }}>Hyr këtu →</a>
          </div>

          <div style={{ marginTop:16, textAlign:'center', fontSize:12, color:'#a1a1aa' }}>
            Nuk je anëtar?{' '}
            <a href="/apply" style={{ color:'#18181b', textDecoration:'none', fontWeight:500 }}>Apliko palestrën</a>
          </div>
        </div>
      </div>

      {/* Right — Info panel */}
      <div style={{ width:380, background:'#18181b', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48, color:'#fff' }} className="reg-panel">
        <style>{`@media(max-width:768px){.reg-panel{display:none}}`}</style>
        <div style={{ maxWidth:280 }}>
          <div style={{ fontFamily:'serif', fontSize:26, marginBottom:14, lineHeight:1.25 }}>
            App-i juaj personal i fitness
          </div>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.8, marginBottom:36 }}>
            Pas regjistrimit keni akses te gjitha të dhënat tuaja.
          </p>
          {[
            ['🎫','Abonomi dhe ditët e mbetura'],
            ['💪','Planet e stërvitjes nga trajneri'],
            ['🥗','Dietat nga dietologët'],
            ['📊','Statistikat dhe historiku'],
            ['🚪','Check-ins dhe prezenca'],
          ].map(([ico,txt])=>(
            <div key={txt} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              <div style={{ width:38, height:38, borderRadius:9, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{ico}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.7)' }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
