import { useState, useEffect, useRef } from 'react'

const FEATURES = [
  { icon:'📊', title:'Dashboard Live', desc:'Statistika në kohë reale — anëtarë aktivë, të ardhura, check-ins dhe borxhe. Gjithçka me një shikim.' },
  { icon:'📷', title:'QR Check-in', desc:'Çdo anëtar ka QR kod personal. Skanon me telefon ose tablet dhe hyrja regjistrohet automatikisht.' },
  { icon:'👥', title:'Menaxhim Anëtarësh', desc:'Profil i plotë — kontakt, historik pagesash, check-ins. Shto, edito, freeze abonim me 1 klik.' },
  { icon:'🎫', title:'8 Plane Abonoimi', desc:'Ditor, Javor, Mujor, 3M, 6M, Vjetor, Student, Couple. Freeze dhe rinovim automatik.' },
  { icon:'🧾', title:'Fatura Automatike', desc:'Numër fature unik për çdo pagesë. Gjenerohet automatikisht — pa punë shtesë.' },
  { icon:'🔔', title:'Kujtime Automatike', desc:'Email automatik para skadimit të abonoimit. Klientët nuk harrojnë, ti nuk humbet të ardhura.' },
]

const PLANS = [
  { name:'Starter', price:'4,900', period:'L / muaj', desc:'Për palestra të vogla', limit:'100 anëtarë', features:['Deri 100 anëtarë','Dashboard live','QR Check-in','3 plane abonoimi','Fatura automatike','1 staf account','Support email'], cta:'Apliko Tani', featured:false },
  { name:'Pro', price:'7,900', period:'L / muaj', desc:'Për palestra në rritje', limit:'500 anëtarë', features:['Deri 500 anëtarë','Gjithçka nga Starter','Të 8 planet','Email automatik','3 staf accounts','Raporte të detajuara','Export CSV & PDF','Support prioritar'], cta:'Apliko Pro →', featured:true },
  { name:'Business', price:'14,900', period:'L / muaj', desc:'Për zinxhirë palestrash', limit:'Pa limit', features:['Anëtarë të pakufizuar','Gjithçka nga Pro','Shumë degë / palestra','Staf të pakufizuar','API access','WhatsApp reminders','Onboarding personal','Support 24/7'], cta:'Na Kontaktoni', featured:false },
]

const TESTIMONIALS = [
  { text:'Më parë mbaja gjithçka në letër. Tani recepsioni skanon QR dhe unë shoh statistikat nga telefoni kudo.', name:'Artan Brahimi', gym:'FitZone Gym, Tiranë', c:'#18181b', i:'AB' },
  { text:'Sistemi i kujtimeve na shpëtoi shumë të ardhura. Klientët marrin email para skadimit dhe vijnë vetë.', name:'Elona Koshi', gym:'PowerFit, Durrës', c:'#2563eb', i:'EK' },
  { text:'Faturat gjenerohen automatikisht pas çdo pagese. Klientëve u duket shumë profesionale.', name:'Genti Nushi', gym:'Iron Club, Shkodër', c:'#16a34a', i:'GN' },
]

const FAQS_GYM = [
  { q:'Si e filloj? A ka kontratë?', a:'Asnjë kontratë. Aplikon online, kontaktojmë, pagesa cash, fillon menjëherë. Anulo kurdo.' },
  { q:'Çfarë ndodh nëse kaloj limitin e anëtarëve?', a:'Do të njoftoheni automatikisht. Mund të upgradoni planin kurdo pa humbur asnjë të dhënë.' },
  { q:'Si funksionon QR Check-in?', a:'Çdo anëtar merr QR unik. Recepsioni skanon me tablet ose telefon — hyrja regjistrohet automatikisht.' },
  { q:'A janë të sigurta të dhënat?', a:'Po. Çdo palestre ka të dhëna plotësisht të izoluara. Askush tjetër nuk mund t\'i aksesojë.' },
  { q:'30 ditë provë falas?', a:'Nëse nuk jeni të kënaqur brenda 30 ditëve, kthejmë pagesën plotësisht pa pyetje.' },
]

const FAQS_NUTR = [
  { q:'Sa fitoj si dietolog?', a:'Ti merr 70% nga çdo shitje. Nëse shet një dietë me 3,000L — ti merr 2,100L. Platforma merr 900L.' },
  { q:'Si i vendos çmimet?', a:'Ti vendos çmimin që dëshiron — nuk ka minimum apo maksimum. Platforma nuk ndërhyn.' },
  { q:'Kur marr pagesën?', a:'Pagesa bëhet cash te palestra. Pas çdo shitjeje konfirmohet dhe të ardhurat regjistrohen në panel.' },
  { q:'A duhet të kem shumë klientë?', a:'Jo. Fillon me 1 plan dhe e rrit me kohën. Platforma të jep akses te mijëra anëtarë palestrash.' },
  { q:'Çfarë duhet për të aplikuar?', a:'Emrin, emailin, telefoni, specializimin dhe një bio të shkurtër. Aprovimi bëhet brenda 24-48 orësh.' },
]

const GYMS = ['FitZone','PowerFit','Iron Club','EliteFit','SportMax','ProGym','FitLife','ActiveZone','BodyPower','FitCenter','MegaGym','TopFit']

export default function LandingPage({ onApply, onLogin }) {
  const [faqOpen,   setFaqOpen]   = useState(null)
  const [faqType,   setFaqType]   = useState('gym')
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const [count,     setCount]     = useState({ gyms:0, members:0, pct:0 })
  const [calc,      setCalc]      = useState({ members:150, checkin:3, admin:2 })
  const started = useRef(false)

  // Kalkulatori
  const savedMin = calc.members * calc.checkin + calc.admin * 60
  const savedHours = Math.round(savedMin / 60 * 10) / 10
  const savedMoney = Math.round(savedHours * 800)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const el = document.getElementById('hero-stats')
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        anim('gyms', 50, 1400); anim('members', 12000, 1800); anim('pct', 98, 1200)
      }
    }, { threshold:0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const anim = (k, target, ms) => {
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now()-start)/ms, 1)
      const e = 1-Math.pow(1-p,3)
      setCount(c => ({...c, [k]: Math.floor(e*target)}))
      if (p<1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMenuOpen(false) }

  const S = { serif:{fontFamily:"'Instrument Serif',Georgia,serif"} }
  const tag = (label, center=false) => (
    <div style={{fontSize:11,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#a8894e',marginBottom:14,display:'flex',alignItems:'center',gap:8,justifyContent:center?'center':'flex-start'}}>
      <span style={{width:24,height:1.5,background:'#c8a96e',display:'inline-block'}}/>{label}
    </div>
  )
  const h2 = (text, white=false) => (
    <h2 style={{...S.serif,fontSize:'clamp(30px,4vw,48px)',fontWeight:900,lineHeight:1.1,letterSpacing:'-.02em',marginBottom:14,color:white?'#fff':'#18181b'}}>{text}</h2>
  )

  return (
    <div style={{fontFamily:"'Geist',-apple-system,sans-serif",color:'#18181b',lineHeight:1.6,overflowX:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:3px}
        @keyframes float{0%,100%{transform:perspective(1000px) rotateY(-5deg) rotateX(2deg) translateY(0)}50%{transform:perspective(1000px) rotateY(-5deg) rotateX(2deg) translateY(-10px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        .ticker{animation:scroll 30s linear infinite}
        .ticker:hover{animation-play-state:paused}
        .feat-card{transition:all .2s}.feat-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.08)}
        .plan-card{transition:all .2s}.plan-card:hover{transform:translateY(-4px)}
        .role-card{transition:all .2s;cursor:default}.role-card:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,.06)}
        .btn-main{background:#18181b;color:#fff;border:none;padding:14px 30px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;box-shadow:0 4px 20px rgba(0,0,0,.15)}
        .btn-main:hover{background:#333;transform:translateY(-2px)}
        .btn-out{background:transparent;color:#18181b;border:1.5px solid rgba(0,0,0,.18);padding:14px 30px;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s}
        .btn-out:hover{border-color:#18181b}
        .btn-green{background:#16a34a;color:#fff;border:none;padding:14px 30px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .btn-green:hover{background:#15803d;transform:translateY(-2px)}
        .btn-gold{background:#c8a96e;color:#fff;border:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s}
        .btn-gold:hover{background:#a8894e;transform:translateY(-2px)}
        .btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.25);padding:14px 36px;border-radius:10px;font-size:15px;font-weight:500;cursor:pointer;font-family:inherit;transition:all .2s}
        .btn-ghost:hover{border-color:rgba(255,255,255,.6)}
        .nav-link{background:none;border:none;cursor:pointer;font-size:14px;color:#52525b;font-weight:500;font-family:inherit;transition:color .15s;padding:0}
        .nav-link:hover{color:#18181b}
        .faq-ans{overflow:hidden;transition:max-height .35s ease,opacity .3s ease}
        .hamburger{display:none;background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;flex-direction:column;gap:5px;align-items:center;justify-content:center}
        .hamburger span{display:block;width:22px;height:2px;background:#18181b;border-radius:2px;transition:all .3s}
        .hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
        .hamburger.open span:nth-child(2){opacity:0;transform:scaleX(0)}
        .hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
        .mobile-menu{display:none;position:fixed;top:62px;left:0;right:0;background:#fff;border-bottom:1px solid #e4e4e7;padding:16px 24px 20px;flex-direction:column;gap:4px;z-index:99;box-shadow:0 8px 24px rgba(0,0,0,.08);animation:slideDown .2s ease}
        .mobile-menu.open{display:flex}
        .mobile-menu .nav-link{font-size:15px;padding:10px 8px;border-radius:8px;text-align:left;color:#18181b}
        .calc-slider{-webkit-appearance:none;appearance:none;width:100%;height:5px;border-radius:3px;background:var(--track,#e4e4e7);outline:none;cursor:pointer}
        .calc-slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#18181b;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.2)}
        @media(max-width:900px){
          .features-grid{grid-template-columns:1fr 1fr!important}
          .plans-grid{grid-template-columns:1fr!important;max-width:420px;margin-left:auto!important;margin-right:auto!important}
          .testi-grid{grid-template-columns:1fr!important}
          .roles-grid{grid-template-columns:1fr!important}
          .nutr-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr 1fr!important}
        }
        @media(max-width:768px){
          .hamburger{display:flex!important}
          .desktop-nav{display:none!important}
          .hero-visual{display:none!important}
          .features-grid{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr!important}
          .hero-title{font-size:38px!important}
          .sp{padding:60px 20px!important}
          .footer-inner{flex-direction:column!important;text-align:center!important;gap:20px!important}
          .cta-btns{flex-direction:column!important;align-items:center!important}
          .calc-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,padding:'0 40px',height:62,display:'flex',alignItems:'center',justifyContent:'space-between',background:scrolled||menuOpen?'rgba(255,255,255,.95)':'transparent',backdropFilter:scrolled||menuOpen?'blur(16px)':'none',borderBottom:scrolled||menuOpen?'1px solid rgba(0,0,0,.07)':'none',transition:'all .3s'}}>
        <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{display:'flex',alignItems:'center',gap:10,background:'none',border:'none',cursor:'pointer',padding:0}}>
          <div style={{width:34,height:34,borderRadius:8,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>💪</div>
          <span style={{fontWeight:700,fontSize:17,color:'#18181b'}}>FitPro CRM</span>
        </button>
        <div className="desktop-nav" style={{display:'flex',alignItems:'center',gap:32}}>
          {[['Funksionet','features'],['Dietologë','nutritionists'],['Çmimet','pricing'],['FAQ','faq']].map(([l,id])=>(
            <button key={id} className="nav-link" onClick={()=>scrollTo(id)}>{l}</button>
          ))}
          <button className="nav-link" onClick={onLogin}>Hyr</button>
          <button className="btn-main" style={{padding:'9px 22px',fontSize:13}} onClick={onApply}>Apliko Tani →</button>
        </div>
        <button className={`hamburger ${menuOpen?'open':''}`} onClick={()=>setMenuOpen(m=>!m)}><span/><span/><span/></button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen?'open':''}`}>
        {[['Funksionet','features'],['Dietologë','nutritionists'],['Çmimet','pricing'],['FAQ','faq']].map(([l,id])=>(
          <button key={id} className="nav-link" onClick={()=>scrollTo(id)}>{l}</button>
        ))}
        <button className="nav-link" onClick={()=>{setMenuOpen(false);onLogin()}}>Hyr →</button>
        <button className="btn-main" style={{marginTop:8,width:'100%',justifyContent:'center',padding:12}} onClick={()=>{setMenuOpen(false);onApply()}}>Apliko Tani →</button>
      </div>

      {/* HERO */}
      <section className="sp" style={{minHeight:'100vh',display:'flex',alignItems:'center',padding:'100px 60px 80px',background:'linear-gradient(135deg,#f5f0e8 0%,#fafafa 50%,#f0f0f5 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)',backgroundSize:'48px 48px'}}/>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 70% 60% at 80% 40%,rgba(200,169,110,.1) 0%,transparent 70%)'}}/>
        <div style={{maxWidth:1200,margin:'0 auto',width:'100%',display:'flex',alignItems:'center',gap:60,position:'relative',zIndex:1}}>
          <div style={{flex:1,maxWidth:600,animation:'fadeUp .7s ease both'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#fff',border:'1px solid rgba(0,0,0,.08)',borderRadius:100,padding:'6px 16px',fontSize:12,fontWeight:600,color:'#52525b',letterSpacing:'.05em',textTransform:'uppercase',marginBottom:28}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#16a34a',animation:'pulse 2s ease infinite',display:'inline-block'}}/>
              Sistemi #1 CRM për palestra në Shqipëri
            </div>
            <h1 className="hero-title" style={{...S.serif,fontSize:'clamp(42px,5.5vw,74px)',lineHeight:1.05,fontWeight:900,letterSpacing:'-.03em',marginBottom:24}}>
              Menaxho palestrën<br/>
              <em style={{fontStyle:'italic',color:'#a8894e'}}>me elegancë</em> dhe<br/>
              <span style={{color:'#2d5a3d'}}>efikasitet</span>
            </h1>
            <p style={{fontSize:17,color:'#71717a',lineHeight:1.75,maxWidth:500,marginBottom:36}}>
              Nga check-in me QR deri te fatura automatike — FitPro i mban të gjitha nën kontroll. I dizajnuar posaçërisht për palestrën shqiptare.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:52}}>
              <button className="btn-main" onClick={onApply}>Fillo Sot →</button>
              <button className="btn-out" onClick={()=>scrollTo('features')}>Shiko Demo</button>
            </div>
            <div id="hero-stats" style={{display:'flex',gap:44,paddingTop:32,borderTop:'1px solid rgba(0,0,0,.1)',flexWrap:'wrap'}}>
              {[[count.gyms+'+','Palestra aktive'],[count.members.toLocaleString('sq-AL')+'+','Anëtarë të menaxhuar'],[count.pct+'%','Klientë të kënaqur']].map(([n,l])=>(
                <div key={l}><div style={{...S.serif,fontSize:36,fontWeight:900,lineHeight:1}}>{n}</div><div style={{fontSize:13,color:'#71717a',marginTop:4}}>{l}</div></div>
              ))}
            </div>
          </div>
          {/* Dashboard preview */}
          <div className="hero-visual" style={{flex:1,display:'flex',justifyContent:'center'}}>
            <div style={{width:'100%',maxWidth:460,background:'#fff',borderRadius:16,boxShadow:'0 32px 80px rgba(0,0,0,.12)',overflow:'hidden',animation:'float 6s ease-in-out infinite'}}>
              <div style={{background:'#fafafa',padding:'10px 14px',borderBottom:'1px solid #f0f0f0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',gap:5}}>{['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}}/>)}</div>
                <div style={{fontSize:11,color:'#999',fontWeight:500}}>FitPro CRM — Dashboard</div>
                <div style={{width:56}}/>
              </div>
              <div style={{display:'flex'}}>
                <div style={{width:120,background:'#fafafa',borderRight:'1px solid #f0f0f0',padding:'10px 8px'}}>
                  {[['◻️','Dashboard',true],['📷','Check-in',false],['👥','Anëtarët',false],['🎫','Abonimet',false],['💰','Pagesat',false],['🥗','Dieta',false]].map(([ico,lbl,a])=>(
                    <div key={lbl} style={{display:'flex',alignItems:'center',gap:6,padding:'5px 8px',borderRadius:6,background:a?'#f0f0f0':'none',marginBottom:2,fontSize:9,color:a?'#333':'#999',fontWeight:a?600:400}}>
                      <span style={{fontSize:10}}>{ico}</span>{lbl}
                    </div>
                  ))}
                </div>
                <div style={{flex:1,padding:10}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:8}}>
                    {[['247','Anëtarë','#16a34a'],['485K','Të Ardhura','#18181b'],['34','Check-ins','#2563eb'],['8','Dieta Shitura','#d97706']].map(([v,l,c])=>(
                      <div key={l} style={{background:'#fafafa',border:'1px solid #f0f0f0',borderRadius:6,padding:7}}>
                        <div style={{fontSize:7,color:'#999',marginBottom:1}}>{l}</div>
                        <div style={{fontFamily:'serif',fontSize:15,fontWeight:700,color:c}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:'#fafafa',border:'1px solid #f0f0f0',borderRadius:6,padding:8,marginBottom:6}}>
                    <div style={{fontSize:8,fontWeight:600,marginBottom:5}}>Të Ardhurat 2026</div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:3,height:40}}>
                      {[35,48,55,62,72,85,100,90,0,0,0,0].map((h,i)=>(
                        <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2,height:'100%',justifyContent:'flex-end'}}>
                          <div style={{width:'100%',height:h?`${h}%`:'3px',background:h?'#18181b':'#e4e4e7',borderRadius:'2px 2px 0 0'}}/>
                          <div style={{fontSize:5,color:'#ccc'}}>{'JFMAMJKGSTND'[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{background:'#fafafa',border:'1px solid #f0f0f0',borderRadius:6,padding:7}}>
                    <div style={{fontSize:8,fontWeight:600,marginBottom:4}}>Anëtarët Aktivë</div>
                    {[['MH','Mira H.','#18181b'],['AK','Ardit K.','#2563eb'],['EH','Erjon H.','#16a34a']].map(([ini,nm,c])=>(
                      <div key={nm} style={{display:'flex',alignItems:'center',gap:4,padding:'2px 0',borderBottom:'1px solid #f5f5f5'}}>
                        <div style={{width:14,height:14,borderRadius:'50%',background:c,color:'#fff',fontSize:5,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,flexShrink:0}}>{ini}</div>
                        <div style={{fontSize:8,flex:1,fontWeight:500}}>{nm}</div>
                        <div style={{fontSize:6,padding:'1px 4px',borderRadius:8,background:'#f0fdf4',color:'#16a34a'}}>Aktiv</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GYMS TICKER */}
      <div style={{background:'#18181b',padding:'16px 0',overflow:'hidden',borderTop:'1px solid #27272a'}}>
        <div style={{display:'flex',gap:0}}>
          <div className="ticker" style={{display:'flex',gap:0,whiteSpace:'nowrap',flexShrink:0}}>
            {[...GYMS,...GYMS].map((g,i)=>(
              <span key={i} style={{display:'inline-flex',alignItems:'center',gap:12,padding:'0 24px',fontSize:13,color:'rgba(255,255,255,.5)',fontWeight:500}}>
                💪 {g} Gym
                <span style={{width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'inline-block'}}/>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FOR WHO */}
      <section className="sp" style={{padding:'100px 60px',background:'#fff'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:60}}>
            {tag('Për Kë është FitPro', true)}
            {h2('Dizajnuar për çdo rol në palestre')}
            <p style={{fontSize:16,color:'#71717a',maxWidth:500,margin:'0 auto',lineHeight:1.7}}>Nga pronari te recepsioni — secili ka aksesin dhe funksionet që i duhen.</p>
          </div>
          <div className="roles-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {[
              { emoji:'👑', role:'Pronari', color:'#18181b', bg:'#f5f5f5',
                desc:'Kontrollo biznesin nga kudo — nga telefoni, tableti ose kompjuteri.',
                features:['Dashboard me statistika live','Të ardhurat dhe borxhet','Raporte mujore','Menaxhim stafi','Konfigurime dhe çmime'] },
              { emoji:'🖥️', role:'Recepsioni', color:'#2563eb', bg:'#eff6ff',
                desc:'Pune e shpejtë — çdo veprim maksimumi 2 klikime.',
                features:['QR Check-in i menjëhershëm','Shto anëtarë të rinj','Regjistro pagesa cash','Shih borxhet e klientëve','Printo fatura'] },
              { emoji:'💪', role:'Trajneri', color:'#16a34a', bg:'#f0fdf4',
                desc:'Fokusohu te stërvitja — lër sistemin të menaxhojë listën.',
                features:['Shih listën e anëtarëve','Kontrollo prezencën','Planet e stërvitjes','Historiku i klientëve','Komunikim i drejtpërdrejtë'] },
            ].map((r,i)=>(
              <div key={i} className="role-card" style={{background:r.bg,border:`1.5px solid ${r.color}20`,borderRadius:16,padding:32,transition:'all .2s'}}>
                <div style={{width:56,height:56,borderRadius:14,background:r.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,marginBottom:20}}>{r.emoji}</div>
                <div style={{...S.serif,fontSize:22,fontWeight:700,marginBottom:8,color:r.color}}>{r.role}</div>
                <div style={{fontSize:14,color:'#52525b',lineHeight:1.7,marginBottom:20}}>{r.desc}</div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {r.features.map((f,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#3f3f46'}}>
                      <span style={{color:r.color,fontWeight:700,fontSize:15}}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="sp" style={{padding:'100px 60px',background:'#f5f0e8'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{marginBottom:60}}>
            {tag('Funksionet')}
            {h2('Gjithçka që nevojit palestra jote')}
            <p style={{fontSize:16,color:'#71717a',maxWidth:500,lineHeight:1.7}}>Nga recepsioni te pronari — secili sheh çfarë i duhet, kur i duhet.</p>
          </div>
          <div className="features-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'rgba(0,0,0,.07)',border:'1px solid rgba(0,0,0,.07)',borderRadius:16,overflow:'hidden'}}>
            {FEATURES.map((f,i)=>(
              <div key={i} className="feat-card" style={{background:'#fff',padding:'36px 32px'}}>
                <div style={{width:48,height:48,borderRadius:12,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:20}}>{f.icon}</div>
                <div style={{...S.serif,fontSize:20,fontWeight:700,marginBottom:10}}>{f.title}</div>
                <div style={{fontSize:14,color:'#71717a',lineHeight:1.7}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="sp" style={{padding:'100px 60px',background:'#fff'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            {tag('Kalkulatori i Kursimeve', true)}
            {h2('Sa kohë kursen çdo muaj?')}
            <p style={{fontSize:16,color:'#71717a',lineHeight:1.7}}>Llogarit sa orë dhe lekë kursen duke përdorur FitPro.</p>
          </div>
          <div style={{background:'linear-gradient(135deg,#18181b 0%,#27272a 100%)',borderRadius:20,padding:40,color:'#fff'}}>
            <div className="calc-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40}}>
              {/* Sliders */}
              <div style={{display:'flex',flexDirection:'column',gap:32}}>
                {[
                  {k:'members',label:'Anëtarë aktualë',min:10,max:500,step:10,unit:'anëtarë'},
                  {k:'checkin',label:'Kohë check-in manual (min/anëtar)',min:1,max:10,step:1,unit:'min'},
                  {k:'admin',label:'Orë admin/ditë (pagesa, regjistrime)',min:1,max:8,step:1,unit:'orë'},
                ].map(s=>(
                  <div key={s.k}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                      <label style={{fontSize:13,color:'rgba(255,255,255,.7)'}}>{s.label}</label>
                      <span style={{fontWeight:700,color:'#c8a96e'}}>{calc[s.k]} {s.unit}</span>
                    </div>
                    <input type="range" className="calc-slider" min={s.min} max={s.max} step={s.step}
                      value={calc[s.k]}
                      onChange={e=>setCalc(c=>({...c,[s.k]:Number(e.target.value)}))}
                      style={{'--track':'rgba(255,255,255,.15)'}}/>
                  </div>
                ))}
              </div>
              {/* Results */}
              <div style={{display:'flex',flexDirection:'column',justifyContent:'center',gap:20}}>
                <div style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:14,padding:24,textAlign:'center'}}>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:8}}>Kohë e kursyer / muaj</div>
                  <div style={{...S.serif,fontSize:52,fontWeight:900,color:'#c8a96e',lineHeight:1}}>{savedHours}</div>
                  <div style={{fontSize:16,color:'rgba(255,255,255,.6)',marginTop:4}}>orë pune</div>
                </div>
                <div style={{background:'rgba(200,169,110,.15)',border:'1px solid rgba(200,169,110,.3)',borderRadius:14,padding:24,textAlign:'center'}}>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:8}}>Vlerë e kursyer (800L/orë)</div>
                  <div style={{...S.serif,fontSize:40,fontWeight:900,color:'#c8a96e',lineHeight:1}}>{savedMoney.toLocaleString('sq-AL')}</div>
                  <div style={{fontSize:16,color:'rgba(255,255,255,.6)',marginTop:4}}>L / muaj</div>
                </div>
                <div style={{textAlign:'center',fontSize:13,color:'rgba(255,255,255,.4)',lineHeight:1.6}}>
                  FitPro Pro kushton <strong style={{color:'#c8a96e'}}>7,900 L/muaj</strong><br/>
                  Kurseni <strong style={{color:'#16a34a'}}>{Math.max(0,savedMoney-7900).toLocaleString('sq-AL')} L</strong> neto çdo muaj
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NUTRITIONISTS SECTION */}
      <section id="nutritionists" className="sp" style={{padding:'100px 60px',background:'#f0fdf4'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'flex',gap:60,alignItems:'center',flexWrap:'wrap'}}>
            {/* Left */}
            <div style={{flex:1,minWidth:300}}>
              {tag('Dietologë')}
              {h2('Bashkohu si Dietolog — Fitoni duke ndihmuar të tjerët')}
              <p style={{fontSize:16,color:'#52525b',lineHeight:1.75,marginBottom:32}}>
                Shes dietat tua te mijëra anëtarë të palestrëve. Ti vendos çmimin, ti vendos orarin — ne e menaxhojmë pjesën tjetër.
              </p>
              {/* Commission box */}
              <div style={{background:'#18181b',borderRadius:14,padding:24,marginBottom:28,display:'flex',alignItems:'center',gap:24}}>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{...S.serif,fontSize:44,fontWeight:900,color:'#c8a96e',lineHeight:1}}>70%</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginTop:4}}>Ty (dietologut)</div>
                </div>
                <div style={{width:1,height:60,background:'rgba(255,255,255,.1)'}}/>
                <div style={{textAlign:'center',flex:1}}>
                  <div style={{...S.serif,fontSize:44,fontWeight:900,color:'#fff',lineHeight:1}}>30%</div>
                  <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginTop:4}}>Platformës</div>
                </div>
              </div>
              <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                <button className="btn-green" onClick={()=>window.location.href='/nutritionist/apply'}>🥗 Apliko si Dietolog →</button>
                <button className="btn-out" onClick={onLogin}>Hyr si Dietolog</button>
              </div>
            </div>
            {/* Right — benefits */}
            <div style={{flex:1,minWidth:280}}>
              <div className="nutr-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                {[
                  {ico:'💰',t:'Ti vendos çmimin',d:'Nuk ka limit minimum ose maksimum'},
                  {ico:'📱',t:'Panel i plotë',d:'Shih porositë dhe të ardhurat live'},
                  {ico:'👥',t:'Klientë të sigurt',d:'Akses te anëtarët e palestrëve'},
                  {ico:'📊',t:'Statistika live',d:'Sa shitje, sa të ardhura çdo ditë'},
                  {ico:'🎯',t:'Marketing falas',d:'Promovohu te mijëra klientë'},
                  {ico:'⚡',t:'Setup i shpejtë',d:'Aprovim brenda 24-48 orësh'},
                ].map((b,i)=>(
                  <div key={i} style={{background:'#fff',borderRadius:12,padding:18,border:'1px solid #bbf7d0'}}>
                    <div style={{fontSize:24,marginBottom:8}}>{b.ico}</div>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{b.t}</div>
                    <div style={{fontSize:12,color:'#52525b',lineHeight:1.5}}>{b.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How it works for nutritionist */}
          <div style={{marginTop:64,background:'#fff',borderRadius:16,padding:36}}>
            <div style={{...S.serif,fontSize:22,marginBottom:28,textAlign:'center'}}>Si funksionon për dietologun</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24}} className="steps-grid">
              {[
                ['1','Apliko Online','Plotëso formularin me bio dhe specializimin tënd'],
                ['2','Aprovohu','Brenda 24-48h merr email me kredencialet e hyrjes'],
                ['3','Shto Dieta','Krijo planet e dietave me çmimet tuaja'],
                ['4','Fito','Klientët blejnë, ti merr 70% automatikisht'],
              ].map(([n,t,d])=>(
                <div key={n} style={{textAlign:'center'}}>
                  <div style={{width:48,height:48,borderRadius:'50%',background:'#16a34a',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',...S.serif,fontSize:20,fontWeight:900,margin:'0 auto 16px'}}>{n}</div>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>{t}</div>
                  <div style={{fontSize:12,color:'#71717a',lineHeight:1.6}}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sp" style={{padding:'100px 60px',background:'#fff'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:60}}>
            {tag('Klientët Tanë', true)}
            {h2('Çfarë thonë pronarët')}
          </div>
          <div className="testi-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{background:'#fafafa',borderRadius:14,padding:28,border:'1px solid #f0f0f0',boxShadow:'0 2px 12px rgba(0,0,0,.04)',transition:'all .2s'}}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,.08)';e.currentTarget.style.transform='translateY(-3px)'}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.04)';e.currentTarget.style.transform='translateY(0)'}}>
                <div style={{color:'#c8a96e',fontSize:15,letterSpacing:3,marginBottom:16}}>★★★★★</div>
                <p style={{fontSize:15,lineHeight:1.7,color:'#18181b',marginBottom:20,fontStyle:'italic'}}>"{t.text}"</p>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:t.c,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,flexShrink:0}}>{t.i}</div>
                  <div><div style={{fontWeight:600,fontSize:14}}>{t.name}</div><div style={{fontSize:12,color:'#71717a'}}>{t.gym}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sp" style={{padding:'100px 60px',background:'#f5f0e8'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:60}}>
            {tag('Çmimet', true)}
            {h2('Transparent. Pa surpriza.')}
            <p style={{fontSize:16,color:'#71717a'}}>Zgjidh planin që i përshtatet madhësisë së palestrës tënde.</p>
          </div>
          <div className="plans-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {PLANS.map((p,i)=>(
              <div key={i} className="plan-card" style={{position:'relative',borderRadius:16,padding:36,border:`1.5px solid ${p.featured?'#18181b':'rgba(0,0,0,.1)'}`,background:p.featured?'#18181b':'#fff',color:p.featured?'#fff':'#18181b',boxShadow:p.featured?'0 20px 60px rgba(0,0,0,.15)':'none'}}>
                {p.featured&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:'#c8a96e',color:'#fff',fontSize:11,fontWeight:700,padding:'4px 14px',borderRadius:20,textTransform:'uppercase',letterSpacing:'.05em',whiteSpace:'nowrap'}}>Më Popullar</div>}
                <div style={{display:'inline-flex',alignItems:'center',gap:6,background:p.featured?'rgba(255,255,255,.1)':'#f0f0f0',borderRadius:20,padding:'4px 12px',fontSize:11,fontWeight:600,marginBottom:16,color:p.featured?'rgba(255,255,255,.7)':'#52525b'}}>
                  👥 {p.limit}
                </div>
                <div style={{fontSize:12,fontWeight:600,textTransform:'uppercase',letterSpacing:'.06em',color:p.featured?'rgba(255,255,255,.5)':'#71717a',marginBottom:8}}>{p.name}</div>
                <div style={{...S.serif,fontSize:46,fontWeight:900,lineHeight:1,marginBottom:4}}>{p.price}<span style={{fontSize:18}}> L</span></div>
                <div style={{fontSize:13,color:p.featured?'rgba(255,255,255,.5)':'#71717a',marginBottom:6}}>{p.period}</div>
                <div style={{fontSize:13,color:p.featured?'rgba(255,255,255,.6)':'#52525b',marginBottom:24,fontStyle:'italic'}}>{p.desc}</div>
                <ul style={{listStyle:'none',marginBottom:32}}>
                  {p.features.map((f,j)=>(
                    <li key={j} style={{fontSize:14,padding:'8px 0',borderBottom:`1px solid ${p.featured?'rgba(255,255,255,.1)':'rgba(0,0,0,.06)'}`,display:'flex',alignItems:'center',gap:10}}>
                      <span style={{color:p.featured?'#c8a96e':'#16a34a',fontWeight:700,flexShrink:0}}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={p.name==='Business'?()=>window.location.href='tel:+35569000000':onApply}
                  style={{display:'block',width:'100%',padding:13,borderRadius:9,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit',transition:'all .2s',border:p.featured?'none':`1.5px solid rgba(0,0,0,.2)`,background:p.featured?'#fff':'transparent',color:'#18181b'}}
                  onMouseEnter={e=>e.currentTarget.style.background=p.featured?'#f5f5f5':'rgba(0,0,0,.04)'}
                  onMouseLeave={e=>e.currentTarget.style.background=p.featured?'#fff':'transparent'}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:36,fontSize:13,color:'#71717a'}}>
            💵 Pagesa vetëm cash &nbsp;•&nbsp; ✅ 30 ditë provë falas &nbsp;•&nbsp; 🔒 Anulo kurdo &nbsp;•&nbsp; 📈 Upgrade kurdo
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="sp" style={{padding:'100px 60px',background:'#fff'}}>
        <div style={{maxWidth:720,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            {tag('Pyetje të Shpeshta', true)}
            {h2('Keni pyetje?')}
          </div>
          {/* Tab switcher */}
          <div style={{display:'flex',background:'#f4f4f5',borderRadius:12,padding:4,marginBottom:32,gap:4}}>
            {[['gym','🏋️ Për Palestra'],['nutr','🥗 Për Dietologë']].map(([k,l])=>(
              <button key={k} onClick={()=>{setFaqType(k);setFaqOpen(null)}} style={{flex:1,padding:'10px 16px',borderRadius:9,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit',transition:'all .2s',background:faqType===k?'#fff':'transparent',color:faqType===k?'#18181b':'#71717a',boxShadow:faqType===k?'0 1px 4px rgba(0,0,0,.08)':'none'}}>{l}</button>
            ))}
          </div>
          {(faqType==='gym'?FAQS_GYM:FAQS_NUTR).map((f,i)=>(
            <div key={i} style={{borderBottom:'1px solid #e4e4e7'}}>
              <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{width:'100%',background:'none',border:'none',padding:'20px 0',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',fontFamily:'inherit',textAlign:'left'}}>
                <span style={{fontSize:15,fontWeight:600}}>{f.q}</span>
                <span style={{fontSize:22,color:'#71717a',transition:'transform .3s',transform:faqOpen===i?'rotate(45deg)':'none',flexShrink:0,marginLeft:16}}>+</span>
              </button>
              <div className="faq-ans" style={{maxHeight:faqOpen===i?200:0,opacity:faqOpen===i?1:0}}>
                <p style={{fontSize:14,color:'#52525b',lineHeight:1.7,paddingBottom:20}}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="sp" style={{padding:'100px 60px',background:'#18181b',color:'#fff',textAlign:'center'}}>
        <div style={{maxWidth:680,margin:'0 auto'}}>
          {tag('Fillo Tani', true)}
          {h2('Gati për të modernizuar palestrën tënde?', true)}
          <p style={{fontSize:16,color:'rgba(255,255,255,.5)',marginBottom:48,lineHeight:1.7}}>
            5 minuta aplikim. Pa kartë krediti. 30 ditë provë falas.
          </p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,maxWidth:600,margin:'0 auto'}} className="calc-grid">
            <div style={{background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:16,padding:28,textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:12}}>🏋️</div>
              <div style={{...S.serif,fontSize:20,marginBottom:8}}>Palestre</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:20,lineHeight:1.6}}>Aprovo aplikimin dhe fillo menjëherë</div>
              <button className="btn-main" style={{width:'100%',justifyContent:'center',background:'#fff',color:'#18181b'}} onClick={onApply}>Apliko Palestrën →</button>
            </div>
            <div style={{background:'rgba(22,163,74,.15)',border:'1px solid rgba(22,163,74,.3)',borderRadius:16,padding:28,textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:12}}>🥗</div>
              <div style={{...S.serif,fontSize:20,marginBottom:8,color:'#fff'}}>Dietolog</div>
              <div style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:20,lineHeight:1.6}}>Fillo të shesësh dietat tua sot</div>
              <button className="btn-green" style={{width:'100%'}} onClick={()=>window.location.href='/nutritionist/apply'}>Apliko si Dietolog →</button>
            </div>
          </div>
          <div style={{marginTop:32,fontSize:13,color:'rgba(255,255,255,.3)'}}>
            ✅ Aprovim brenda 24 orësh &nbsp;•&nbsp; 🔒 Pa kontratë afatgjatë &nbsp;•&nbsp; 💵 Pagesa cash
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#0c0c0c',color:'rgba(255,255,255,.4)',padding:'40px 60px'}}>
        <div className="footer-inner" style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
          <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{display:'flex',alignItems:'center',gap:10,background:'none',border:'none',cursor:'pointer',padding:0}}>
            <div style={{width:30,height:30,borderRadius:7,background:'#18181b',border:'1px solid rgba(255,255,255,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>💪</div>
            <span style={{...S.serif,fontSize:17,color:'#fff'}}>FitPro CRM</span>
          </button>
          <div style={{fontSize:12}}>© 2026 FitPro CRM — Bërë me ❤️ për Shqipërinë 🇦🇱</div>
          <div style={{display:'flex',gap:20,fontSize:13,flexWrap:'wrap'}}>
            {[['Funksionet','features'],['Dietologë','nutritionists'],['Çmimet','pricing'],['FAQ','faq']].map(([l,id])=>(
              <button key={l} onClick={()=>scrollTo(id)} style={{color:'rgba(255,255,255,.4)',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:13,transition:'color .15s'}}
                onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.4)'}>{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
