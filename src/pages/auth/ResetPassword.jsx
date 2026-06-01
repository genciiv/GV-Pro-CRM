// src/pages/auth/ResetPassword.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { VaqoLogo } from '../../components/VaqoLogo'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [error,    setError]    = useState('')
  const [showP,    setShowP]    = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Supabase auto-handles the token from URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setValidToken(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError('Fjalëkalimi duhet të ketë të paktën 8 karaktere')
    if (password !== confirm) return setError('Fjalëkalimet nuk përputhen')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
      setTimeout(() => window.location.href = '/login', 3000)
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const INP = { width:'100%', border:'1.5px solid #e8eaef', borderRadius:10, padding:'12px 14px', fontSize:15, fontFamily:'inherit', outline:'none', background:'#fff', color:'#0f1117', transition:'border-color .15s, box-shadow .15s', boxSizing:'border-box' }
  const onF = e => { e.target.style.borderColor='#6c47ff'; e.target.style.boxShadow='0 0 0 3px rgba(108,71,255,.12)' }
  const onB = e => { e.target.style.borderColor='#e8eaef'; e.target.style.boxShadow='none' }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f9fc', fontFamily:'system-ui,sans-serif', padding:20 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
      <div style={{ background:'#fff', borderRadius:20, padding:40, maxWidth:420, width:'100%', boxShadow:'0 8px 40px rgba(15,17,23,.1)', border:'1px solid #e8eaef', animation:'pop .3s ease' }}>
        <a href="/" style={{ display:'inline-block', marginBottom:32 }}><VaqoLogo size="sm"/></a>

        {done ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, fontWeight:900, marginBottom:10 }}>Fjalëkalimi u ndryshua!</h2>
            <p style={{ fontSize:14, color:'#6b7385', lineHeight:1.7, marginBottom:20 }}>Duke të ridrejtuar te hyrja...</p>
            <a href="/login" style={{ background:'#6c47ff', color:'#fff', padding:'12px 28px', borderRadius:10, fontSize:14, fontWeight:700, textDecoration:'none', display:'inline-block' }}>Hyr Tani →</a>
          </div>
        ) : !validToken ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:14, opacity:.4 }}>🔗</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:22, fontWeight:900, marginBottom:10 }}>Duke u verifikuar...</h2>
            <p style={{ fontSize:14, color:'#6b7385', lineHeight:1.7 }}>
              Nëse kjo faqe mbetet bosh, <a href="/login" style={{ color:'#6c47ff', fontWeight:600 }}>kthehu te hyrja</a> dhe provo sërish.
            </p>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:26, fontWeight:900, marginBottom:6 }}>Vendos Fjalëkalim të Ri</h1>
            <p style={{ fontSize:14, color:'#6b7385', marginBottom:28, lineHeight:1.6 }}>Zgjedh një fjalëkalim të sigurt me të paktën 8 karaktere.</p>

            {error && <div style={{ background:'#fff1f3', border:'1px solid #ffd6db', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:14, color:'#e0344a' }}>⚠️ {error}</div>}

            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3d4350', marginBottom:6 }}>Fjalëkalimi i Ri</label>
                <div style={{ position:'relative' }}>
                  <input type={showP?'text':'password'} style={{ ...INP, paddingRight:46 }} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min 8 karaktere" onFocus={onF} onBlur={onB} required/>
                  <button type="button" onClick={()=>setShowP(s=>!s)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16, color:'#9aa0b0' }}>
                    {showP ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Strength indicator */}
                {password.length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ height:3, background:'#f0f0f0', borderRadius:2, overflow:'hidden' }}>
                      <div style={{ height:'100%', borderRadius:2, transition:'width .3s', width:`${Math.min(100, password.length * 10)}%`, background: password.length < 6 ? '#e0344a' : password.length < 10 ? '#d97706' : '#16a34a' }}/>
                    </div>
                    <div style={{ fontSize:11, color: password.length < 6 ? '#e0344a' : password.length < 10 ? '#d97706' : '#16a34a', marginTop:4 }}>
                      {password.length < 6 ? '🔴 Shumë i shkurtër' : password.length < 10 ? '🟡 Mesatar' : '🟢 I fortë'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#3d4350', marginBottom:6 }}>Konfirmo Fjalëkalimin</label>
                <input type="password" style={{ ...INP, borderColor: confirm && confirm !== password ? '#e0344a' : '#e8eaef' }} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Shkruaj sërish" onFocus={onF} onBlur={onB} required/>
                {confirm && confirm !== password && <div style={{ fontSize:12, color:'#e0344a', marginTop:4 }}>Fjalëkalimet nuk përputhen</div>}
                {confirm && confirm === password && <div style={{ fontSize:12, color:'#16a34a', marginTop:4 }}>✓ Fjalëkalimet përputhen</div>}
              </div>

              <button type="submit" disabled={loading || password !== confirm || password.length < 8}
                style={{ background:'#6c47ff', color:'#fff', border:'none', padding:'13px', borderRadius:10, fontSize:15, fontWeight:700, cursor:loading?'wait':'pointer', fontFamily:'inherit', marginTop:4, opacity:(loading||password!==confirm||password.length<8)?.6:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 12px rgba(108,71,255,.3)' }}>
                {loading && <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>}
                {loading ? 'Duke ndryshuar...' : 'Ndrysho Fjalëkalimin →'}
              </button>
            </form>

            <div style={{ marginTop:20, textAlign:'center', fontSize:13, color:'#9aa0b0' }}>
              <a href="/login" style={{ color:'#6c47ff', fontWeight:600, textDecoration:'none' }}>← Kthehu te Hyrja</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
