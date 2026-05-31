import { useState, useEffect } from 'react'
import { ARTICLES, CATEGORIES } from './blogData'

function useW() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return {isMobile:w<640,isTablet:w>=640&&w<1024}
}

function ArticleCard({ article, featured=false, onClick }) {
  const { isMobile } = useW()
  return (
    <div onClick={onClick} style={{ background:'#fff', borderRadius:16, border:'1px solid #e4e4e7', overflow:'hidden', cursor:'pointer', transition:'all .2s', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,.1)' }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,.04)' }}>

      {/* Cover */}
      <div style={{ height: featured ? (isMobile?160:220) : 160, background: article.imageGradient, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
        <div style={{ fontSize: featured ? 64 : 48, opacity:.3 }}>{article.image}</div>
        <div style={{ position:'absolute', top:14, left:14 }}>
          <span style={{ background: article.categoryColor, color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20 }}>
            {article.category}
          </span>
        </div>
        <div style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,.4)', color:'#fff', fontSize:11, padding:'3px 10px', borderRadius:20 }}>
          ⏱ {article.readTime}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: featured ? (isMobile?20:28) : 20 }}>
        <div style={{ fontSize:12, color:'#71717a', marginBottom:8, display:'flex', gap:10, alignItems:'center' }}>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.author.name}</span>
        </div>
        <h3 style={{ fontFamily:'Georgia,serif', fontSize: featured ? (isMobile?18:22) : 17, fontWeight:900, lineHeight:1.25, marginBottom:10, color:'#18181b' }}>
          {article.title}
        </h3>
        <p style={{ fontSize:14, color:'#52525b', lineHeight:1.7, marginBottom:14, display:'-webkit-box', WebkitLineClamp:featured?4:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
          {article.excerpt}
        </p>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {article.tags.slice(0,3).map(tag=>(
            <span key={tag} style={{ background:'#f4f4f5', color:'#52525b', fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20 }}>#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Blog() {
  const {isMobile,isTablet} = useW()
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const px = isMobile?16:isTablet?32:64

  const go = slug => window.location.href = `/blog/${slug}`

  const filtered = ARTICLES.filter(a => {
    const matchCat = activeCat==='all' || a.categorySlug===activeCat
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered.filter(a=>a.featured)
  const rest = filtered.filter(a=>!a.featured)

  return (
    <div style={{ fontFamily:'system-ui,-apple-system,sans-serif', color:'#18181b', background:'#fafafa', minHeight:'100vh' }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, height:56, padding:`0 ${px}px`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(0,0,0,.07)' }}>
        <button onClick={()=>window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>💪</div>
          <span style={{ fontSize:19, fontWeight:900, color:'#18181b', fontFamily:'Georgia,serif' }}>Vaqo</span>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {!isMobile&&<button onClick={()=>window.location.href='/pricing'} style={{ background:'none', border:'1px solid #e4e4e7', color:'#18181b', padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Çmimet</button>}
          <button onClick={()=>window.location.href='/demo'} style={{ background:'#18181b', color:'#fff', border:'none', padding:'8px 18px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Book Demo</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:`${isMobile?40:64}px ${px}px ${isMobile?28:40}px`, background:'#fff', borderBottom:'1px solid #e4e4e7', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto', animation:'fadeUp .5s ease both' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:100, padding:'5px 14px', fontSize:12, fontWeight:700, color:'#7c3aed', marginBottom:18 }}>
            📚 Blog & Udhëzues
          </div>
          <h1 style={{ fontFamily:'Georgia,serif', fontSize:isMobile?28:isTablet?36:48, fontWeight:900, lineHeight:1.05, letterSpacing:'-.03em', marginBottom:14 }}>
            Rrit Biznesin Wellness me Dije
          </h1>
          <p style={{ fontSize:isMobile?14:17, color:'#52525b', lineHeight:1.75, marginBottom:24 }}>
            Udhëzues praktikë, strategji të provuara dhe këshilla të ekspertëve për çdo lloj biznesi wellness.
          </p>
          {/* Search */}
          <div style={{ position:'relative', maxWidth:420, margin:'0 auto' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#a1a1aa' }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Kërko artikuj..."
              style={{ width:'100%', border:'1.5px solid #e4e4e7', borderRadius:10, padding:'11px 14px 11px 40px', fontSize:15, fontFamily:'inherit', outline:'none', background:'#fff', transition:'border-color .15s' }}
              onFocus={e=>e.target.style.borderColor='#18181b'} onBlur={e=>e.target.style.borderColor='#e4e4e7'}/>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <div style={{ background:'#fff', borderBottom:'1px solid #e4e4e7', padding:`10px ${px}px`, overflowX:'auto' }}>
        <div style={{ display:'flex', gap:8, minWidth:'max-content' }}>
          {CATEGORIES.map(cat=>(
            <button key={cat.slug} onClick={()=>setActiveCat(cat.slug)}
              style={{ padding:'7px 16px', borderRadius:20, border:`1.5px solid ${activeCat===cat.slug?'#18181b':'#e4e4e7'}`, background:activeCat===cat.slug?'#18181b':'#fff', color:activeCat===cat.slug?'#fff':'#52525b', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', transition:'all .15s' }}>
              {cat.label} <span style={{ opacity:.6, fontSize:11 }}>({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLES */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:`${isMobile?24:40}px ${px}px 64px` }}>
        {filtered.length===0?(
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:48, marginBottom:16, opacity:.3 }}>🔍</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:22, marginBottom:8 }}>Asnjë artikull nuk u gjet</div>
            <button onClick={()=>{setSearch('');setActiveCat('all')}} style={{ background:'#18181b', color:'#fff', border:'none', padding:'10px 24px', borderRadius:9, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit', marginTop:16 }}>
              Pastro filtrat
            </button>
          </div>
        ):(
          <>
            {/* Featured articles */}
            {featured.length>0&&(
              <div style={{ marginBottom:32 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#7c3aed', marginBottom:16 }}>📌 Artikujt Kryesorë</div>
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':isTablet?'1fr 1fr':'repeat(2,1fr)', gap:20 }}>
                  {featured.map(a=><ArticleCard key={a.slug} article={a} featured onClick={()=>go(a.slug)}/>)}
                </div>
              </div>
            )}

            {/* Rest */}
            {rest.length>0&&(
              <div>
                {featured.length>0&&<div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#71717a', marginBottom:16 }}>Të gjithë artikujt</div>}
                <div style={{ display:'grid', gridTemplateColumns:isMobile?'1fr':isTablet?'1fr 1fr':'repeat(3,1fr)', gap:20 }}>
                  {rest.map(a=><ArticleCard key={a.slug} article={a} onClick={()=>go(a.slug)}/>)}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div style={{ marginTop:56, background:'#18181b', borderRadius:20, padding:isMobile?28:40, textAlign:'center', color:'#fff' }}>
          <div style={{ fontSize:isMobile?32:40, marginBottom:14 }}>🚀</div>
          <h3 style={{ fontFamily:'Georgia,serif', fontSize:isMobile?22:28, marginBottom:10 }}>Gati të fillosh me Vaqo?</h3>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.5)', marginBottom:24, lineHeight:1.7 }}>30 ditë falas, pa kartë krediti. Setup 30 minuta.</p>
          <button onClick={()=>window.location.href='/demo'} style={{ background:'#7c3aed', color:'#fff', border:'none', padding:'13px 32px', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            Book Demo Falas →
          </button>
        </div>
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
