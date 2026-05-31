import { useState, useEffect } from 'react'
import { getArticle, getRelated } from './blogData'

function useW() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return {isMobile:w<640,isTablet:w>=640&&w<1024}
}

// Simple markdown-like renderer
function renderContent(content) {
  if (!content) return null
  return content.trim().split('\n').map((line, i) => {
    const key = i
    // H2
    if (line.startsWith('## ')) return <h2 key={key} style={{ fontFamily:'Georgia,serif', fontSize:'clamp(20px,3vw,26px)', fontWeight:900, lineHeight:1.2, marginTop:36, marginBottom:14, color:'#18181b', paddingBottom:10, borderBottom:'2px solid #f0f0f0' }}>{line.slice(3)}</h2>
    // H3
    if (line.startsWith('### ')) return <h3 key={key} style={{ fontFamily:'Georgia,serif', fontSize:'clamp(17px,2.5vw,20px)', fontWeight:700, lineHeight:1.3, marginTop:24, marginBottom:10, color:'#18181b' }}>{line.slice(4)}</h3>
    // Bold list item
    if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*(.*)/)
      if (match) return <div key={key} style={{ display:'flex', gap:10, padding:'5px 0', fontSize:15, color:'#52525b', lineHeight:1.7 }}><span style={{ color:'#7c3aed', flexShrink:0, marginTop:1 }}>▸</span><span><strong style={{ color:'#18181b' }}>{match[1]}</strong>{match[2]}</span></div>
    }
    // List item
    if (line.startsWith('- ')) return <div key={key} style={{ display:'flex', gap:10, padding:'4px 0', fontSize:15, color:'#52525b', lineHeight:1.7 }}><span style={{ color:'#16a34a', flexShrink:0, marginTop:2, fontSize:12 }}>✓</span><span>{line.slice(2)}</span></div>
    // Numbered
    if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)[1]
      return <div key={key} style={{ display:'flex', gap:12, padding:'5px 0', fontSize:15, color:'#52525b', lineHeight:1.7 }}><span style={{ fontWeight:700, color:'#7c3aed', flexShrink:0, minWidth:20 }}>{num}.</span><span>{line.replace(/^\d+\. /, '')}</span></div>
    }
    // Table header
    if (line.startsWith('| ') && line.includes('---')) return null
    if (line.startsWith('| ')) {
      const cells = line.split('|').filter(c=>c.trim())
      const isHeader = i>0 && content.split('\n')[i-1]?.startsWith('| ')
      return <div key={key} style={{ display:'grid', gridTemplateColumns:`repeat(${cells.length},1fr)`, gap:0, borderBottom:'1px solid #f0f0f0' }}>
        {cells.map((c,ci)=><div key={ci} style={{ padding:'8px 12px', fontSize:13, background:ci===0?'#fafafa':'#fff', fontWeight:isHeader?700:400, color:ci===0?'#18181b':'#52525b' }}>{c.trim().replace(/\*\*/g,'')}</div>)}
      </div>
    }
    // Blockquote style box
    if (line.startsWith('**') && line.endsWith('**')) return <div key={key} style={{ background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:10, padding:'12px 16px', margin:'16px 0', fontSize:15, fontWeight:700, color:'#7c3aed' }}>{line.replace(/\*\*/g,'')}</div>
    // Empty line
    if (!line.trim()) return <div key={key} style={{ height:8 }}/>
    // Normal paragraph - handle inline bold
    const parts = line.split(/\*\*(.+?)\*\*/)
    return <p key={key} style={{ fontSize:15, color:'#52525b', lineHeight:1.8, marginBottom:8 }}>
      {parts.map((part,pi)=>pi%2===0?part:<strong key={pi} style={{ color:'#18181b' }}>{part}</strong>)}
    </p>
  })
}

export default function ArticlePage() {
  const {isMobile,isTablet} = useW()
  const slug = window.location.pathname.replace('/blog/','').replace(/\/$/,'')
  const article = getArticle(slug)
  const related = getRelated(slug, 3)
  const [scrollPct, setScrollPct] = useState(0)
  const px = isMobile?16:isTablet?32:64

  useEffect(()=>{
    const fn=()=>{
      const el=document.documentElement
      const pct=Math.round(el.scrollTop/(el.scrollHeight-el.clientHeight)*100)
      setScrollPct(Math.min(100,pct))
    }
    window.addEventListener('scroll',fn)
    return()=>window.removeEventListener('scroll',fn)
  },[])

  if (!article) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif', padding:24 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>😕</div>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, marginBottom:12 }}>Artikulli nuk u gjet</h2>
        <button onClick={()=>window.location.href='/blog'} style={{ background:'#18181b', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>← Kthehu te Blog</button>
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', color:'#18181b', background:'#fafafa', minHeight:'100vh' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}a{color:inherit;text-decoration:none}`}</style>

      {/* Progress bar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:3, background:'#f0f0f0', zIndex:200 }}>
        <div style={{ height:'100%', background:'#7c3aed', width:`${scrollPct}%`, transition:'width .1s' }}/>
      </div>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, height:56, padding:`0 ${px}px`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(0,0,0,.07)' }}>
        <button onClick={()=>window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💪</div>
          <span style={{ fontSize:19, fontWeight:900, color:'#18181b', fontFamily:'Georgia,serif' }}>Vaqo</span>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>window.location.href='/blog'} style={{ background:'none', border:'1px solid #e4e4e7', color:'#18181b', padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>← Blog</button>
          <button onClick={()=>window.location.href='/demo'} style={{ background:'#18181b', color:'#fff', border:'none', padding:'8px 18px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Book Demo</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ height:isMobile?180:260, background:article.imageGradient, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <div style={{ fontSize:isMobile?60:80, opacity:.2 }}>{article.image}</div>
        <div style={{ position:'absolute', bottom:20, left:px }}>
          <span style={{ background:article.categoryColor, color:'#fff', fontSize:12, fontWeight:700, padding:'4px 12px', borderRadius:20 }}>{article.category}</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:760, margin:'0 auto', padding:`${isMobile?24:40}px ${px}px 64px` }}>

        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:20, fontSize:12, color:'#71717a' }}>
          <button onClick={()=>window.location.href='/'} style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', fontFamily:'inherit', fontSize:12 }}>Kryefaqja</button>
          <span>›</span>
          <button onClick={()=>window.location.href='/blog'} style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', fontFamily:'inherit', fontSize:12 }}>Blog</button>
          <span>›</span>
          <span style={{ color:'#18181b', fontWeight:500 }}>{article.category}</span>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily:'Georgia,serif', fontSize:isMobile?'clamp(22px,6vw,28px)':isTablet?32:38, fontWeight:900, lineHeight:1.1, letterSpacing:'-.02em', marginBottom:16, color:'#18181b' }}>
          {article.title}
        </h1>

        {/* Meta */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, flexWrap:'wrap' }}>
          <div style={{ width:36, height:36, borderRadius:'50%', background:'#18181b', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, flexShrink:0 }}>
            {article.author.avatar}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>{article.author.name}</div>
            <div style={{ fontSize:12, color:'#71717a' }}>{article.date} · ⏱ {article.readTime} lexim</div>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:6, flexWrap:'wrap' }}>
            {article.tags.map(tag=>(
              <span key={tag} style={{ background:'#f4f4f5', color:'#52525b', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20 }}>#{tag}</span>
            ))}
          </div>
        </div>

        {/* Excerpt box */}
        <div style={{ background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:12, padding:'16px 20px', marginBottom:28, fontSize:16, color:'#52525b', lineHeight:1.75, fontStyle:'italic' }}>
          {article.excerpt}
        </div>

        {/* Article content */}
        <div style={{ fontSize:15, lineHeight:1.8 }}>
          {renderContent(article.content)}
        </div>

        {/* CTA in article */}
        <div style={{ background:'#18181b', borderRadius:16, padding:isMobile?24:32, marginTop:40, color:'#fff', textAlign:'center' }}>
          <div style={{ fontSize:32, marginBottom:12 }}>🚀</div>
          <h3 style={{ fontFamily:'Georgia,serif', fontSize:isMobile?20:24, marginBottom:10 }}>Gati të fillosh?</h3>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginBottom:22, lineHeight:1.7 }}>30 ditë falas. Pa kartë krediti. Setup 30 minuta.</p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
            <button onClick={()=>window.location.href='/demo'} style={{ background:'#7c3aed', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              Book Demo Falas →
            </button>
            <button onClick={()=>window.location.href='/pricing'} style={{ background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,.3)', padding:'12px 22px', borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
              Shiko Çmimet
            </button>
          </div>
        </div>

        {/* Related articles */}
        {related.length>0&&(
          <div style={{ marginTop:48 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#7c3aed', marginBottom:20 }}>Artikuj të ngjashëm</div>
            <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr', gap:16 }}>
              {related.map(a=>(
                <div key={a.slug} onClick={()=>window.location.href=`/blog/${a.slug}`} style={{ background:'#fff', borderRadius:14, border:'1px solid #e4e4e7', overflow:'hidden', cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.08)'}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                  <div style={{ height:80, background:a.imageGradient, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ fontSize:32, opacity:.3 }}>{a.image}</div>
                  </div>
                  <div style={{ padding:14 }}>
                    <div style={{ fontSize:10, color:a.categoryColor, fontWeight:700, textTransform:'uppercase', marginBottom:6 }}>{a.category}</div>
                    <div style={{ fontFamily:'Georgia,serif', fontSize:14, fontWeight:700, lineHeight:1.3, marginBottom:6 }}>{a.title}</div>
                    <div style={{ fontSize:11, color:'#71717a' }}>{a.readTime} lexim</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{ background:'#0a0a0a', padding:`20px ${px}px`, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontSize:17, color:'#fff', fontWeight:900, fontFamily:'Georgia,serif', cursor:'pointer' }} onClick={()=>window.location.href='/'}>Vaqo</span>
        {!isMobile&&<div style={{ fontSize:11, color:'rgba(255,255,255,.2)' }}>© 2026 Vaqo · Platforma Wellness #1 në Shqipëri 🇦🇱</div>}
        <div style={{ display:'flex', gap:14 }}>
          {[['Blog','/blog'],['Çmimet','/pricing'],['Book Demo','/demo']].map(([l,h])=>(
            <a key={l} href={h} style={{ color:'rgba(255,255,255,.25)', fontSize:12, textDecoration:'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
