import { useState } from 'react'
import { useAuth } from '../../lib/auth'

export default function Login() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      setTimeout(() => { window.location.href = '/' }, 800)
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ose fjalëkalim i gabuar' : err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#fafafa', fontFamily:"'Geist',-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .login-input{width:100%;background:#fff;border:1.5px solid #e4e4e7;color:#18181b;border-radius:10px;padding:13px 14px;font-family:inherit;font-size:15px;outline:none;transition:border-color .15s,box-shadow .15s}
        .login-input:focus{border-color:#18181b;box-shadow:0 0 0 3px rgba(0,0,0,.06)}
        .login-btn{width:100%;background:#18181b;color:#fff;border:none;padding:14px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;margin-top:8px}
        .login-btn:hover:not(:disabled){background:#333}
        .login-btn:disabled{opacity:.6;cursor:wait}
        .login-panel{display:flex}
        @media(max-width:768px){.login-panel{display:none!important}}
      `}</style>

      {/* Nav */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e4e4e7', padding:'14px 20px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={()=>window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💪</div>
          <span style={{ fontWeight:700, fontSize:16, color:'#18181b' }}>FitPro CRM</span>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex:1, display:'flex' }}>

        {/* Form - LEFT */}
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 20px' }}>
          <div style={{ width:'100%', maxWidth:400 }}>

            {/* Header */}
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <div style={{ width:56, height:56, borderRadius:14, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 16px' }}>💪</div>
              <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, fontWeight:900, marginBottom:6, color:'#18181b' }}>Mirë se erdhe</h1>
              <p style={{ fontSize:14, color:'#71717a' }}>Hyr me llogarinë tënde FitPro</p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'12px 14px', marginBottom:20, fontSize:13, color:'#991b1b', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>❌</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Email</label>
                <input
                  className="login-input"
                  type="email" required autoFocus autoComplete="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@palestra.al"
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3f3f46', marginBottom:6 }}>Fjalëkalimi</label>
                <div style={{ position:'relative' }}>
                  <input
                    className="login-input"
                    type={showPass ? 'text' : 'password'} required autoComplete="current-password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ paddingRight:48 }}
                  />
                  <button type="button" onClick={() => setShowPass(s=>!s)}
                    style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#a1a1aa', padding:4 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? '⏳ Duke hyrë...' : 'Hyr në sistem →'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
              <div style={{ flex:1, height:1, background:'#e4e4e7' }}/>
              <span style={{ fontSize:12, color:'#a1a1aa', whiteSpace:'nowrap' }}>ose</span>
              <div style={{ flex:1, height:1, background:'#e4e4e7' }}/>
            </div>

            {/* Links */}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <a href="/apply" style={{ display:'block', width:'100%', padding:'13px 14px', borderRadius:10, border:'1.5px solid #e4e4e7', background:'#fff', textAlign:'center', fontSize:14, fontWeight:600, color:'#18181b', textDecoration:'none', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#18181b';e.currentTarget.style.background='#fafafa'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e4e4e7';e.currentTarget.style.background='#fff'}}>
                🏋️ Apliko si Palestre
              </a>
              <a href="/nutritionist/apply" style={{ display:'block', width:'100%', padding:'13px 14px', borderRadius:10, border:'1.5px solid #bbf7d0', background:'#f0fdf4', textAlign:'center', fontSize:14, fontWeight:600, color:'#16a34a', textDecoration:'none', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='#dcfce7'}}
                onMouseLeave={e=>{e.currentTarget.style.background='#f0fdf4'}}>
                🥗 Apliko si Dietolog
              </a>
            </div>

            <p style={{ textAlign:'center', fontSize:12, color:'#a1a1aa', marginTop:24 }}>
              Duke hyrë, pranoni{' '}
              <a href="#" style={{ color:'#18181b', textDecoration:'none', fontWeight:500 }}>Kushtet e Shërbimit</a>
            </p>
          </div>
        </div>

        {/* Right panel - desktop only */}
        <div className="login-panel" style={{ width:420, background:'#18181b', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:48, color:'#fff' }}>
          <div style={{ maxWidth:320 }}>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:28, marginBottom:14, lineHeight:1.25 }}>
              Menaxho palestrën me profesionalizëm
            </div>
            <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', lineHeight:1.8, marginBottom:36 }}>
              QR check-in, pagesa, fatura dhe raporte — gjithçka në një vend.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {[
                ['📊','Dashboard live me statistika'],
                ['📷','QR Check-in me kamerë'],
                ['💰','Pagesa cash dhe fatura PDF'],
                ['🥗','Planet e dietave nga ekspertë'],
                ['📈','Raporte dhe analiza'],
              ].map(([ico,txt])=>(
                <div key={txt} style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{ico}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,.7)' }}>{txt}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display:'flex', gap:24, marginTop:40, paddingTop:32, borderTop:'1px solid rgba(255,255,255,.08)' }}>
              {[['50+','Palestra'],['12K+','Anëtarë'],['98%','Kënaqësi']].map(([n,l])=>(
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, fontWeight:900, color:'#c8a96e' }}>{n}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
