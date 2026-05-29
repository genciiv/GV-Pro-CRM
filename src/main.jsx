import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import LandingPage          from './pages/LandingPage.jsx'
import Login                from './pages/auth/Login.jsx'
import Apply                from './pages/auth/Apply.jsx'
import AdminPanel           from './pages/admin/AdminPanel.jsx'
import GymDashboard         from './pages/gym/GymDashboard.jsx'
import NutritionistDashboard from './pages/nutritionist/NutritionistDashboard.jsx'
import NutritionistApply   from './pages/nutritionist/NutritionistApply.jsx'
import './index.css'

function Router() {
  const { user, profile, loading, logout } = useAuth()
  const path = window.location.pathname

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#fafafa',gap:16}}>
      <div style={{fontSize:44}}>💪</div>
      <div style={{width:22,height:22,border:'2px solid #e4e4e7',borderTopColor:'#18181b',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Public routes
  if (path === '/apply')                return <Apply/>
  if (path === '/nutritionist/apply')   return <NutritionistApply/>
  if (path === '/login' && !user)       return <Login/>

  // Logged in
  if (user) {
    if (!profile) return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',padding:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:48,maxWidth:460,width:'100%',textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{fontFamily:'serif',fontSize:22,marginBottom:12}}>Profili nuk u gjet</div>
          <div style={{fontSize:14,color:'#71717a',lineHeight:1.7,marginBottom:16}}>Email: <strong>{user.email}</strong></div>
          <div style={{background:'#fef3c7',border:'1px solid #fde68a',borderRadius:10,padding:14,marginBottom:24,fontSize:13,textAlign:'left',lineHeight:1.8}}>
            <strong>Zgjidha:</strong> Supabase → SQL Editor → Run:<br/>
            <code style={{fontSize:11,background:'#fff',padding:'2px 6px',borderRadius:4,display:'block',marginTop:6,wordBreak:'break-all'}}>
              UPDATE platform_admins SET auth_id = (SELECT id FROM auth.users WHERE email = '{user.email}' LIMIT 1) WHERE email = '{user.email}';
            </code>
          </div>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <button onClick={()=>window.location.reload()} style={{background:'#18181b',color:'#fff',border:'none',padding:'10px 20px',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>↻ Rifresko</button>
            <button onClick={logout} style={{background:'#fff',color:'#18181b',border:'1px solid #e4e4e7',padding:'10px 20px',borderRadius:8,fontSize:14,cursor:'pointer'}}>Dil</button>
          </div>
        </div>
      </div>
    )

    if (profile.type === 'admin')         return <AdminPanel logout={logout}/>
    if (profile.type === 'nutritionist')  return <NutritionistDashboard/>
    if (profile.type === 'gym' && profile.gym?.status === 'approved') return <GymDashboard/>
    if (profile.type === 'gym') return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',padding:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:48,maxWidth:440,width:'100%',textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>
          <div style={{fontSize:48,marginBottom:16}}>⏳</div>
          <div style={{fontFamily:'serif',fontSize:22,marginBottom:12}}>Duke u aprovuar</div>
          <div style={{fontSize:14,color:'#71717a',lineHeight:1.7,marginBottom:24}}>Do t'ju njoftojmë brenda 24 orësh.</div>
          <button onClick={logout} style={{background:'#18181b',color:'#fff',border:'none',padding:'10px 24px',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>Dil</button>
        </div>
      </div>
    )
  }

  // Landing
  const go = p => { window.location.pathname = p }
  return <LandingPage onApply={()=>go('/apply')} onLogin={()=>go('/login')}/>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Router/>
      <Toaster position="top-right" toastOptions={{style:{fontFamily:'Geist,sans-serif',fontSize:13,borderRadius:10,padding:'10px 14px'},duration:3500}}/>
    </AuthProvider>
  </React.StrictMode>
)
