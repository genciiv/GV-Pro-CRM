// src/components/DemoVideo.jsx
// Demo Video Embed — YouTube/Vimeo/Loom

import { useState } from 'react'

// ─── KONFIGURIM ───────────────────────────────────────────
// Pasi të kesh ngarkuar videon, vendos URL-në këtu:
const VIDEO_CONFIG = {
  // Zgjidh një platformë:
  platform: 'youtube',  // 'youtube' | 'vimeo' | 'loom'
  
  // YouTube: shpako https://youtu.be/XXXXX → vendos XXXXX
  youtube_id: 'YOUR_YOUTUBE_ID',
  
  // Vimeo: https://vimeo.com/XXXXX → vendos XXXXX  
  vimeo_id: 'YOUR_VIMEO_ID',
  
  // Loom: https://www.loom.com/share/XXXXX → vendos XXXXX
  loom_id: 'YOUR_LOOM_ID',
  
  title: 'Vaqo — Si funksionon platforma',
  duration: '3:00',
  thumbnail: null, // ose URL e thumbnail
}

function getEmbedUrl() {
  const { platform, youtube_id, vimeo_id, loom_id } = VIDEO_CONFIG
  if (platform === 'youtube') return `https://www.youtube.com/embed/${youtube_id}?autoplay=1&rel=0&modestbranding=1`
  if (platform === 'vimeo')   return `https://player.vimeo.com/video/${vimeo_id}?autoplay=1&color=7c3aed`
  if (platform === 'loom')    return `https://www.loom.com/embed/${loom_id}?autoplay=1`
  return null
}

const hasVideo = () => {
  const { platform, youtube_id, vimeo_id, loom_id } = VIDEO_CONFIG
  if (platform === 'youtube') return youtube_id !== 'YOUR_YOUTUBE_ID'
  if (platform === 'vimeo')   return vimeo_id !== 'YOUR_VIMEO_ID'
  if (platform === 'loom')    return loom_id !== 'YOUR_LOOM_ID'
  return false
}

// ─── VIDEO PLAYER ─────────────────────────────────────────
export function DemoVideo({ compact = false }) {
  const [playing, setPlaying] = useState(false)
  const embedUrl = getEmbedUrl()
  const ready = hasVideo()

  const H = compact ? 280 : 420

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      borderRadius: compact ? 14 : 20,
      overflow: 'hidden',
      background: '#18181b',
      aspectRatio: '16/9',
      maxHeight: H,
      boxShadow: '0 24px 64px rgba(0,0,0,.25)',
    }}>
      {/* Playing state — real embed */}
      {playing && ready && (
        <iframe
          src={embedUrl}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={VIDEO_CONFIG.title}
        />
      )}

      {/* Thumbnail / placeholder */}
      {(!playing || !ready) && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', cursor:'pointer', background:'linear-gradient(135deg,#18181b 0%,#1e1040 100%)' }}
          onClick={() => ready ? setPlaying(true) : null}>

          {/* Grid pattern */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize:'40px 40px' }}/>

          {/* Glow */}
          <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,.3) 0%,transparent 70%)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }}/>

          {/* Play button */}
          <div style={{ position:'relative', zIndex:1, width:72, height:72, borderRadius:'50%', background:'rgba(124,58,237,.9)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 32px rgba(124,58,237,.5)', marginBottom:20, transition:'transform .2s' }}
            onMouseEnter={e => e.currentTarget.style.transform='scale(1.08)'}
            onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{marginLeft:3}}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ position:'relative', zIndex:1, textAlign:'center' }}>
            {!compact && (
              <div style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:8, fontFamily:'system-ui' }}>
                {ready ? 'Kliko për të parë demonstrimin' : 'Demo Video — Së Shpejti'}
              </div>
            )}
            <div style={{ fontFamily:'Georgia,serif', fontSize:compact?16:20, fontWeight:900, color:'#fff', marginBottom:6 }}>
              {VIDEO_CONFIG.title}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontSize:12, color:'rgba(255,255,255,.4)', fontFamily:'system-ui' }}>
              <span>⏱ {VIDEO_CONFIG.duration}</span>
              {!ready && <span style={{ background:'rgba(255,255,255,.1)', padding:'2px 10px', borderRadius:20 }}>📹 Duke u përgatitur</span>}
            </div>
          </div>

          {/* Coming soon overlay */}
          {!ready && (
            <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,.6)', backdropFilter:'blur(8px)', borderRadius:50, padding:'8px 20px', display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,.6)', whiteSpace:'nowrap', fontFamily:'system-ui' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:'#c8a96e', display:'inline-block', animation:'vblink 1.5s ease-in-out infinite' }}/>
              Video do të jetë gati pas xhirimit
            </div>
          )}

          <style>{`@keyframes vblink{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
        </div>
      )}

      {/* Duration badge */}
      <div style={{ position:'absolute', top:14, right:14, background:'rgba(0,0,0,.7)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, fontFamily:'system-ui', zIndex:2 }}>
        ⏱ {VIDEO_CONFIG.duration}
      </div>
    </div>
  )
}

// ─── SECTION BLOCK për Landing Page ───────────────────────
export function VideoSection() {
  return (
    <section style={{ padding:'80px 64px', background:'#18181b' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#c8a96e', marginBottom:12, fontFamily:'system-ui' }}>
            Demo Video
          </div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(24px,3.5vw,40px)', fontWeight:900, color:'#fff', marginBottom:12 }}>
            Shiko si funksionon Vaqo<br/>
            <span style={{ color:'#a78bfa' }}>në 3 minuta</span>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.45)', maxWidth:480, margin:'0 auto', lineHeight:1.75, fontFamily:'system-ui' }}>
            Nga regjistrimi i parë deri te dashboard — shiko çdo funksion live.
          </p>
        </div>

        <DemoVideo/>

        {/* Feature highlights below video */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginTop:32 }}>
          {[
            ['00:00','Regjistrimi & Setup','30 sekonda'],
            ['00:45','Dashboard Live','Statistika real-time'],
            ['01:30','QR Check-in','Hyrje automatike'],
            ['02:15','Rezervime Online','Klienti rezervon vetë'],
          ].map(([time,label,desc])=>(
            <div key={time} style={{ background:'rgba(255,255,255,.05)', borderRadius:12, padding:16, textAlign:'center', border:'1px solid rgba(255,255,255,.07)' }}>
              <div style={{ fontSize:11, color:'#c8a96e', fontWeight:700, marginBottom:6, fontFamily:'system-ui' }}>{time}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'#fff', marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', fontFamily:'system-ui' }}>{desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginTop:32 }}>
          <button onClick={()=>window.location.href='/demo'} style={{ background:'#7c3aed', color:'#fff', border:'none', padding:'13px 36px', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'opacity .2s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Book Demo Falas →
          </button>
          <div style={{ marginTop:12, fontSize:12, color:'rgba(255,255,255,.2)', fontFamily:'system-ui' }}>
            ✅ 30 ditë falas · Pa kartë krediti
          </div>
        </div>
      </div>
    </section>
  )
}

export default DemoVideo
