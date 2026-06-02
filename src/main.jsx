import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './lib/auth.jsx'
import LandingPage           from './pages/LandingPage.jsx'
import Login                 from './pages/auth/Login.jsx'
import Apply                 from './pages/auth/Apply.jsx'
import AdminPanel            from './pages/admin/AdminPanel.jsx'
import GymDashboard          from './pages/gym/GymDashboard.jsx'
import NutritionistDashboard from './pages/nutritionist/NutritionistDashboard.jsx'
import NutritionistApply     from './pages/nutritionist/NutritionistApply.jsx'
import MemberApp             from './pages/member/MemberApp.jsx'
import BarbershopDashboard   from './pages/barbershop/BarbershopDashboard.jsx'
import SalonDashboard        from './pages/salon/SalonDashboard.jsx'
import SpaDashboard          from './pages/spa/SpaDashboard.jsx'
import YogaDashboard         from './pages/yoga/YogaDashboard.jsx'
import CategoryPage          from './pages/categories/CategoryPage.jsx'
import BookDemo              from './pages/auth/BookDemo.jsx'
import Pricing               from './pages/Pricing.jsx'
import Blog                  from './pages/blog/Blog.jsx'
import Terms                 from './pages/legal/Terms.jsx'
import Privacy               from './pages/legal/Privacy.jsx'
import GDPR                  from './pages/legal/GDPR.jsx'
import ArticlePage           from './pages/blog/ArticlePage.jsx'
import Explore              from './pages/explore/Explore.jsx'
import BusinessProfile      from './pages/explore/BusinessProfile.jsx'
import Register              from './pages/auth/Register.jsx'
import QRCheckin             from './pages/auth/QRCheckin.jsx'
import Shop                  from './pages/shop/Shop.jsx'
import ResetPassword         from './pages/auth/ResetPassword.jsx'
import PublicBooking         from './pages/public/PublicBooking.jsx'
import './index.css'

function Router() {
  const { user, profile, loading, logout } = useAuth()
  const path = window.location.pathname

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#fff',gap:12}}>
      <div style={{width:42,height:42,borderRadius:10,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>💪</div>
      <div style={{width:20,height:20,border:'2px solid #e4e4e7',borderTopColor:'#18181b',borderRadius:'50%',animation:'spin .6s linear infinite'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Public routes
  if (path === '/explore')            return <Explore/>
  if (path.startsWith('/category/'))  return <CategoryPage/>
  if (path === '/demo')                return <BookDemo/>
  if (path === '/pricing')              return <Pricing/>
  if (path === '/blog')                 return <Blog/>
  if (path.startsWith('/blog/'))        return <ArticlePage/>
  if (path === '/terms')                return <Terms/>
  if (path === '/privacy')              return <Privacy/>
  if (path === '/gdpr')                 return <GDPR/>
  if (path.startsWith('/b/'))         return <BusinessProfile/>
  if (path === '/apply')              return <Apply/>
  if (path === '/nutritionist/apply') return <NutritionistApply/>
  if (path === '/login') { if (user) { window.location.replace('/'); return null } return <Login/> }
  if (path === '/register')            return <Register/>
  if (path.startsWith('/checkin/'))   return <QRCheckin/>
  if (path === '/shop')               return <Shop/>
  if (path === '/reset-password')     return <ResetPassword/>
  if (path.startsWith('/book/'))      return <PublicBooking/>

  // Logged in - redirect from public pages to dashboard
  if (user && (path === '/' || path === '/login')) {
    // Will be handled below
  }
  if (user) {
    if (!profile) return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',padding:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:48,maxWidth:460,width:'100%',textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{fontFamily:'serif',fontSize:22,marginBottom:12}}>Profili nuk u gjet</div>
          <div style={{fontSize:14,color:'#71717a',marginBottom:16}}>Email: <strong>{user.email}</strong></div>
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

    if (profile.type === 'admin')        return <AdminPanel logout={logout}/>
    if (profile.type === 'nutritionist') return <NutritionistDashboard/>
    if (profile.type === 'member')       return <MemberApp/>
    if (profile.type === 'client')          return <Explore/>
    if (profile.type === 'barbershop')    return <BarbershopDashboard/>
    if (profile.type === 'salon')           return <SalonDashboard/>
    if (profile.type === 'spa')             return <SpaDashboard/>
    if (profile.type === 'yoga')            return <YogaDashboard/>
    if (profile.type === 'pilates')         return <YogaDashboard/>
    if (profile.type === 'martial_arts')    return <YogaDashboard/>
    if (profile.type === 'dance')           return <YogaDashboard/>
    if (profile.type === 'fitness')         return <GymDashboard/>
    if (profile.type === 'wellness')        return <SpaDashboard/>
    if (profile.gym?.status === 'approved') return <GymDashboard/>
    if (profile.type === 'gym') return <GymDashboard/>
    if (profile.gym) return <GymDashboard/>
    if (false) return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',padding:24}}>
        <div style={{background:'#fff',borderRadius:16,padding:48,maxWidth:440,width:'100%',textAlign:'center',boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>
          <div style={{fontSize:48,marginBottom:16}}>⏳</div>
          <div style={{fontFamily:'serif',fontSize:22,marginBottom:12}}>Duke u aprovuar</div>
          <div style={{fontSize:14,color:'#71717a',marginBottom:24}}>Do t'ju njoftojmë brenda 24 orësh.</div>
          <button onClick={logout} style={{background:'#18181b',color:'#fff',border:'none',padding:'10px 24px',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>Dil</button>
        </div>
      </div>
    )
  }

  // 404 for unknown logged-out paths
  if (path !== '/' && !user && path !== '/login' && path !== '/apply' && path !== '/register' &&
      path !== '/nutritionist/apply' && !path.startsWith('/checkin/') &&
      !path.startsWith('/b/') && !path.startsWith('/category/') && !path.startsWith('/blog/') &&
      !['explore','demo','pricing','blog','terms','privacy','gdpr','shop'].includes(path.slice(1))) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fafafa',fontFamily:'system-ui,sans-serif',padding:24}}>
        <div style={{textAlign:'center',maxWidth:400}}>
          <div style={{fontFamily:'Georgia,serif',fontSize:120,fontWeight:900,color:'#e4e4e7',lineHeight:1}}>404</div>
          <div style={{fontFamily:'Georgia,serif',fontSize:24,fontWeight:900,marginBottom:10,marginTop:-10}}>Faqja nuk u gjet</div>
          <div style={{fontSize:14,color:'#71717a',marginBottom:28,lineHeight:1.7}}>URL-ja <code style={{background:'#f4f4f5',padding:'2px 6px',borderRadius:4}}>{path}</code> nuk ekziston.</div>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <a href="/" style={{background:'#18181b',color:'#fff',padding:'11px 24px',borderRadius:9,fontSize:14,fontWeight:700,textDecoration:'none'}}>← Kryefaqja</a>
            <a href="/explore" style={{background:'#fff',color:'#18181b',border:'1px solid #e4e4e7',padding:'11px 20px',borderRadius:9,fontSize:14,fontWeight:500,textDecoration:'none'}}>🔍 Explore</a>
          </div>
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
