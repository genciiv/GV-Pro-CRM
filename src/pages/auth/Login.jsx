import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import toast from 'react-hot-toast'

export default function Login() {
  const { login, loginWithGoogle, loginWithApple } = useAuth()
  const [form, setForm] = useState({ email:'', password:'' })
  const [loading, setLoading] = useState(false)
  const [googleLoad, setGoogleLoad] = useState(false)
  const [appleLoad,  setAppleLoad]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      window.location.href = '/'
    } catch(e) {
      toast.error(e.message.includes('Invalid') ? 'Email ose fjalëkalim i gabuar' : e.message)
    } finally { setLoading(false) }
  }

  const doGoogle = async () => {
    setGoogleLoad(true)
    try { await loginWithGoogle() }
    catch(e) { toast.error(e.message); setGoogleLoad(false) }
  }

  const doApple = async () => {
    setAppleLoad(true)
    try { await loginWithApple() }
    catch(e) { toast.error(e.message); setAppleLoad(false) }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',fontFamily:"'Geist',-apple-system,sans-serif",background:'#fafafa'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .inp{width:100%;background:#fff;border:1.5px solid #e4e4e7;color:#18181b;border-radius:10px;padding:13px 14px;font-family:inherit;font-size:15px;outline:none;transition:border-color .15s}
        .inp:focus{border-color:#18181b;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
        .social-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:13px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;border:1.5px solid #e4e4e7;background:#fff;color:#18181b}
        .social-btn:hover{background:#fafafa;border-color:#d4d4d8}
        .social-btn:disabled{opacity:.6;cursor:not-allowed}
        @media(max-width:768px){.right-panel{display:none!important}}
      `}</style>

      {/* Left */}
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'32px 24px'}}>
        <div style={{width:'100%',maxWidth:400}}>

          {/* Logo */}
          <button onClick={()=>window.location.href='/'} style={{display:'flex',alignItems:'center',gap:10,background:'none',border:'none',cursor:'pointer',padding:0,marginBottom:40}}>
            <div style={{width:36,height:36,borderRadius:9,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>💪</div>
            <span style={{fontFamily:"'Instrument Serif',serif",fontSize:22,fontWeight:900,color:'#18181b'}}>Vaqo</span>
          </button>

          <h1 style={{fontFamily:"'Instrument Serif',serif",fontSize:30,fontWeight:900,marginBottom:6}}>Mirë se u ktheve</h1>
          <p style={{fontSize:14,color:'#71717a',marginBottom:28,lineHeight:1.6}}>Hyr në llogarinë tënde Vaqo.</p>

          {/* Google */}
          <button className="social-btn" onClick={doGoogle} disabled={googleLoad} style={{marginBottom:10}}>
            {googleLoad ? (
              <div style={{width:18,height:18,border:'2px solid #e4e4e7',borderTopColor:'#18181b',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
            ) : (
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
            {googleLoad ? 'Duke u lidhur...' : 'Vazhdo me Google'}
          </button>

          {/* Apple */}
          <button className="social-btn" onClick={doApple} disabled={appleLoad} style={{marginBottom:20}}>
            {appleLoad ? (
              <div style={{width:18,height:18,border:'2px solid #e4e4e7',borderTopColor:'#18181b',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
            ) : (
              <svg width="18" height="18" viewBox="0 0 814 1000">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 383.8 41.3 451.4 41.3 341.5 41.3 145.5 176.4 40 309.8 40c68.7 0 125.5 44.8 168.5 44.8 41.5 0 106.8-45.3 182.3-45.3zM552 95.4c-35 0-84.7 23.3-113.7 50-22.7 21.3-44.2 57.3-44.2 93.7 0 4.7.7 9.3.7 13.5 3.2.3 6.2.7 10.2.7 34.3 0 83-21 110.3-47.3 26.5-25.3 47.5-60.3 47.5-95 0-4.7-.7-9-1.5-13.4-3.2-.5-6.2-.2-9.3-.2z"/>
              </svg>
            )}
            {appleLoad ? 'Duke u lidhur...' : 'Vazhdo me Apple'}
          </button>

          {/* Divider */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
            <div style={{flex:1,height:1,background:'#e4e4e7'}}/>
            <span style={{fontSize:12,color:'#a1a1aa',fontWeight:500}}>ose me email</span>
            <div style={{flex:1,height:1,background:'#e4e4e7'}}/>
          </div>

          {/* Email form */}
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:'#3f3f46',marginBottom:6}}>Email</label>
              <input className="inp" type="email" required value={form.email} onChange={e=>set('email',e.target.value)} placeholder="email@juaj.al" autoComplete="email"/>
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <label style={{fontSize:13,fontWeight:600,color:'#3f3f46'}}>Fjalëkalimi</label>
              </div>
              <div style={{position:'relative'}}>
                <input className="inp" type={showPass?'text':'password'} required value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••" style={{paddingRight:46}} autoComplete="current-password"/>
                <button type="button" onClick={()=>setShowPass(s=>!s)} style={{position:'absolute',right:14,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:17,color:'#a1a1aa'}}>
                  {showPass?'🙈':'👁️'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{background:'#18181b',color:'#fff',border:'none',padding:'14px',borderRadius:10,fontSize:15,fontWeight:600,cursor:loading?'wait':'pointer',fontFamily:'inherit',marginTop:4,opacity:loading?.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              {loading&&<div style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>}
              {loading?'Duke hyrë...':'Hyr →'}
            </button>
          </form>

          <div style={{marginTop:20,textAlign:'center',fontSize:13,color:'#71717a'}}>
            Anëtar i ri?{' '}
            <a href="/register" style={{color:'#18181b',fontWeight:700,textDecoration:'none'}}>Krijo Llogarinë →</a>
          </div>
          <div style={{marginTop:10,textAlign:'center',fontSize:13,color:'#71717a'}}>
            Biznes?{' '}
            <a href="/apply" style={{color:'#18181b',fontWeight:600,textDecoration:'none'}}>Apliko këtu →</a>
          </div>
          <div style={{marginTop:10,textAlign:'center'}}>
            <a href="/explore" style={{color:'#71717a',fontSize:12,textDecoration:'none'}}>← Kthehu te Explore</a>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="right-panel" style={{width:420,background:'#18181b',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:48,color:'#fff'}}>
        <div style={{maxWidth:300}}>
          <div style={{fontFamily:"'Instrument Serif',serif",fontSize:30,marginBottom:12,lineHeight:1.2}}>Platforma Wellness #1 në Shqipëri</div>
          <p style={{fontSize:14,color:'rgba(255,255,255,.45)',lineHeight:1.8,marginBottom:36}}>Menaxho biznesin tënd, rezervimet dhe klientët — nga çdo pajisje.</p>
          {[['🏋️','Palestra & Studio'],['💈','Barbershop & Sallon'],['💆','Spa & Masazh'],['🧘','Yoga & Pilates'],['🥗','Dietologë']].map(([ico,txt])=>(
            <div key={txt} style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
              <div style={{width:36,height:36,borderRadius:9,background:'rgba(255,255,255,.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{ico}</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.6)'}}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
