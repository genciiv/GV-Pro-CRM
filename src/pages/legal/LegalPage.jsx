import { useEffect, useState } from 'react'

function useW() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return {isMobile:w<640,isTablet:w>=640&&w<1024}
}

export function LegalPage({ title, subtitle, lastUpdated, sections, badge, badgeColor='#18181b' }) {
  const {isMobile,isTablet} = useW()
  const [activeSection, setActiveSection] = useState(null)
  const px = isMobile?16:isTablet?28:48

  useEffect(()=>{
    // Update page title for SEO
    document.title = `${title} — Vaqo`
  },[title])

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif',color:'#18181b',background:'#fafafa',minHeight:'100vh'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:#7c3aed;text-decoration:none}a:hover{text-decoration:underline}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,height:54,padding:`0 ${px}px`,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,.07)'}}>
        <button onClick={()=>window.location.href='/'} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:0}}>
          <div style={{width:28,height:28,borderRadius:7,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>💪</div>
          <span style={{fontSize:18,fontWeight:900,color:'#18181b',fontFamily:'Georgia,serif'}}>Vaqo</span>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {!isMobile&&<button onClick={()=>window.location.href='/terms'} style={{background:'none',border:'none',color:'#71717a',padding:'6px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Termat</button>}
          {!isMobile&&<button onClick={()=>window.location.href='/privacy'} style={{background:'none',border:'none',color:'#71717a',padding:'6px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>Privatësia</button>}
          {!isMobile&&<button onClick={()=>window.location.href='/gdpr'} style={{background:'none',border:'none',color:'#71717a',padding:'6px 10px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>GDPR</button>}
          <button onClick={()=>window.location.href='/demo'} style={{background:'#18181b',color:'#fff',border:'none',padding:'7px 16px',borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Book Demo</button>
        </div>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:`${isMobile?28:48}px ${px}px 80px`,display:'grid',gridTemplateColumns:isMobile||isTablet?'1fr':'240px 1fr',gap:isMobile?0:48,alignItems:'start'}}>

        {/* Sidebar TOC — desktop only */}
        {!isMobile&&!isTablet&&(
          <div style={{position:'sticky',top:72}}>
            <div style={{background:'#fff',borderRadius:14,border:'1px solid #e4e4e7',padding:20}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.07em',color:'#a1a1aa',marginBottom:14}}>Përmbajtja</div>
              <div style={{display:'flex',flexDirection:'column',gap:2}}>
                {sections.map((s,i)=>(
                  <button key={i} onClick={()=>{setActiveSection(i);document.getElementById(`section-${i}`)?.scrollIntoView({behavior:'smooth',block:'start'})}}
                    style={{background:activeSection===i?'#f5f3ff':'none',border:'none',cursor:'pointer',padding:'7px 10px',borderRadius:8,fontSize:13,fontWeight:activeSection===i?600:400,color:activeSection===i?'#7c3aed':'#52525b',textAlign:'left',fontFamily:'inherit',lineHeight:1.4,transition:'all .15s'}}>
                    {s.title}
                  </button>
                ))}
              </div>
              <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid #f0f0f0'}}>
                <div style={{fontSize:11,color:'#a1a1aa',marginBottom:8}}>Faqe ligjore</div>
                {[['📋 Termat','/terms'],['🔒 Privatësia','/privacy'],['🇪🇺 GDPR','/gdpr']].map(([l,h])=>(
                  <a key={h} href={h} style={{display:'block',fontSize:12,color:'#71717a',padding:'4px 0',fontFamily:'inherit'}}>{l}</a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div style={{animation:'fadeUp .5s ease both'}}>
          {/* Header */}
          <div style={{marginBottom:28}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,fontSize:12,color:'#71717a'}}>
              <button onClick={()=>window.location.href='/'} style={{background:'none',border:'none',cursor:'pointer',color:'#71717a',fontFamily:'inherit',fontSize:12}}>Kryefaqja</button>
              <span>›</span><span style={{color:'#18181b',fontWeight:500}}>{title}</span>
            </div>
            <div style={{display:'inline-flex',alignItems:'center',gap:7,background:`${badgeColor}15`,border:`1px solid ${badgeColor}30`,borderRadius:100,padding:'5px 14px',fontSize:12,fontWeight:700,color:badgeColor,marginBottom:16}}>
              {badge}
            </div>
            <h1 style={{fontFamily:'Georgia,serif',fontSize:isMobile?26:34,fontWeight:900,lineHeight:1.1,marginBottom:10}}>{title}</h1>
            <p style={{fontSize:15,color:'#52525b',lineHeight:1.7,marginBottom:12}}>{subtitle}</p>
            <div style={{display:'flex',gap:16,fontSize:12,color:'#a1a1aa',flexWrap:'wrap'}}>
              <span>📅 Përditësuar: <strong style={{color:'#52525b'}}>{lastUpdated}</strong></span>
              <span>🌍 Shqipëri & Kosovë</span>
              <span>⚖️ Ligji shqiptar</span>
            </div>
          </div>

          {/* Alert box */}
          <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'14px 18px',marginBottom:28,fontSize:14,color:'#92400e',lineHeight:1.7}}>
            ⚠️ <strong>E rëndësishme:</strong> Ky dokument është i detyrueshëm ligjërisht. Duke përdorur shërbimet e Vaqo, ju pranoni kushtet e mëposhtme. Lexojini me kujdes.
          </div>

          {/* Sections */}
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {sections.map((s,i)=>(
              <div key={i} id={`section-${i}`} style={{borderBottom:'1px solid #f0f0f0',paddingBottom:24,marginBottom:24}}
                onMouseEnter={()=>setActiveSection(i)}>
                <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?18:22,fontWeight:900,lineHeight:1.2,marginBottom:14,color:'#18181b',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:20}}>{s.icon}</span>{i+1}. {s.title}
                </h2>
                <div style={{fontSize:15,color:'#52525b',lineHeight:1.85}}>
                  {s.content.split('\n').filter(l=>l.trim()).map((line,li)=>{
                    if (line.startsWith('**') && line.endsWith('**')) return <p key={li} style={{fontWeight:700,color:'#18181b',marginBottom:8,marginTop:12}}>{line.replace(/\*\*/g,'')}</p>
                    if (line.startsWith('• ')) return <div key={li} style={{display:'flex',gap:10,padding:'3px 0'}}><span style={{color:'#7c3aed',flexShrink:0}}>•</span><span>{line.slice(2)}</span></div>
                    if (line.startsWith('- ')) return <div key={li} style={{display:'flex',gap:10,padding:'3px 0'}}><span style={{color:'#16a34a',flexShrink:0,fontSize:12,marginTop:3}}>✓</span><span>{line.slice(2)}</span></div>
                    return <p key={li} style={{marginBottom:10}}>{line}</p>
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact box */}
          <div style={{background:'#18181b',borderRadius:14,padding:24,color:'#fff',marginTop:8}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:8}}>📬 Kontakti Ligjor</div>
            <p style={{fontSize:14,color:'rgba(255,255,255,.6)',lineHeight:1.7,marginBottom:12}}>
              Nëse keni pyetje rreth këtij dokumenti ose dëshironi të ushtroni të drejtat tuaja:
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:6,fontSize:14}}>
              <div style={{display:'flex',gap:10,color:'rgba(255,255,255,.8)'}}>
                <span>📧</span><span>legal@vaqo.al</span>
              </div>
              <div style={{display:'flex',gap:10,color:'rgba(255,255,255,.8)'}}>
                <span>🌐</span><span>vaqo.al</span>
              </div>
              <div style={{display:'flex',gap:10,color:'rgba(255,255,255,.8)'}}>
                <span>📍</span><span>Tiranë, Shqipëri</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{background:'#0a0a0a',padding:`20px ${px}px`,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <span style={{fontSize:16,color:'#fff',fontWeight:900,fontFamily:'Georgia,serif',cursor:'pointer'}} onClick={()=>window.location.href='/'}>Vaqo</span>
        <div style={{display:'flex',gap:14}}>
          {[['Termat','/terms'],['Privatësia','/privacy'],['GDPR','/gdpr'],['Blog','/blog']].map(([l,h])=>(
            <a key={l} href={h} style={{color:'rgba(255,255,255,.25)',fontSize:12}}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
