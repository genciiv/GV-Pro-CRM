import { useState, useEffect, useRef } from "react";

const CATEGORIES = [
  {
    group: "Fitness & Wellness", icon: "🏋️",
    items: [
      { icon:"🏋️", slug:"gym",          name:"Palestre & Gym",     desc:"Menaxhim i plotë anëtarësh dhe pagesa" },
      { icon:"🧘", slug:"yoga",          name:"Yoga Studio",        desc:"Orare klasash dhe rezervime" },
      { icon:"🤸", slug:"pilates",       name:"Pilates",            desc:"Klasa grupore dhe progres" },
      { icon:"🥊", slug:"martial-arts",  name:"Arte Marciale",      desc:"Nivele, gradime dhe klasa" },
      { icon:"💃", slug:"dance",         name:"Studio Vallëzimi",   desc:"Kurse dhe menaxhim nxënësish" },
      { icon:"⚡", slug:"fitness",       name:"Functional Fitness", desc:"HIIT, CrossFit dhe trajnim" },
    ]
  },
  {
    group: "Health & Beauty", icon: "💆",
    items: [
      { icon:"💈", slug:"barbershop", name:"Barbershop",      desc:"Rezervime, staf dhe shërbime" },
      { icon:"💅", slug:"salon",      name:"Sallon Bukurie",  desc:"Takime, ngjyrosje dhe trajtimie" },
      { icon:"💆", slug:"spa",        name:"Spa & Masazh",    desc:"Trajtimie dhe rezervime" },
      { icon:"🌿", slug:"wellness",   name:"Wellness Clinic", desc:"Terapi holistike" },
    ]
  },
];

const FEATURES = [
  {
    category: "Booking & Scheduling", icon: "📅", color: "#2563eb", bg: "#eff6ff",
    items: [
      { icon:"🖱️", title:"Rezervim Online", desc:"Klientët rezervojnë 24/7 nga çdo pajisje" },
      { icon:"📆", title:"Orari i Klasave", desc:"Menaxho orare komplekse me lehtësi" },
      { icon:"⏳", title:"Listë Pritjeje", desc:"Automatikisht plotëson vendet e lira" },
      { icon:"🔔", title:"Kujtues Automatikë", desc:"SMS dhe email para çdo takimi" },
    ]
  },
  {
    category: "Run Your Business", icon: "💼", color: "#7c3aed", bg: "#f5f3ff",
    items: [
      { icon:"👥", title:"Menaxhim Stafi", desc:"Role, orare, pagesa dhe leje" },
      { icon:"👤", title:"Menaxhim Klientësh", desc:"Profil i plotë, historiku, borxhet" },
      { icon:"💰", title:"Pagesa & POS", desc:"Cash, transfertë, fatura automatike" },
      { icon:"📊", title:"Raporte", desc:"Të ardhura, prezenca, analiza" },
    ]
  },
  {
    category: "Rrit Biznesin", icon: "🚀", color: "#16a34a", bg: "#f0fdf4",
    items: [
      { icon:"⭐", title:"Reviews & Rating", desc:"Vlerësimet shfaqen te Explore" },
      { icon:"🗺️", title:"Harta Interaktive", desc:"Klientët te gjejnë lehtë" },
      { icon:"🥗", title:"Dietologë 70/30", desc:"Shes dieta, merr komision 70%" },
      { icon:"📱", title:"App Anëtarësh", desc:"Abonime, stërvitje, statistika" },
    ]
  },
];

const PLANS = [
  { name:"Starter", price:"4,900", limit:"100 klientë", featured:false, color:"#18181b",
    features:["Deri 100 klientë","Dashboard live","QR Check-in","Rezervime online","Fatura automatike","1 staf account"], cta:"Fillo 30 Ditë Falas" },
  { name:"Pro", price:"7,900", limit:"500 klientë", featured:true, color:"#7c3aed",
    features:["Deri 500 klientë","Gjithçka nga Starter","Klasa grupore","Email + SMS automatik","5 staf accounts","Explore + Business Profile"], cta:"Fillo Pro →" },
  { name:"Business", price:"14,900", limit:"Pa limit", featured:false, color:"#16a34a",
    features:["Klientë të pakufizuar","Gjithçka nga Pro","Shumë degë","Staf të pakufizuar","API akses","Manager i dedikuar"], cta:"Na Kontaktoni" },
];

const FAQS = [
  { q:"Sa kohë duhet për setup?", a:"30 minuta. Konfigurojmë bashkë pa ekspertizë teknike." },
  { q:"A funksionon për barbershop dhe sallon?", a:"Po! Vaqo funksionon për çdo biznes wellness — palestra, yoga, barbershop, sallon, spa dhe shumë të tjera." },
  { q:"A mund të menaxhoj shumë degë?", a:"Po, paketa Business mbështet shumë degë me raporte të konsoliduara." },
  { q:"Si funksionon pagesa?", a:"Cash ose transfertë bankare. Pa kartë krediti, pa kontratë afatgjatë." },
  { q:"A kanë klientët app mobil?", a:"Po! Rezervojnë klasa, shohin abonimin dhe statistikat nga telefoni." },
];

const GYMS = ["FitZone","PowerFit","Iron Club","EliteFit","SportMax","ProGym","FitLife","ActiveZone","BodyPower","ZenSpa","TopCuts","YogaFlow","KickFit","PureBalance","CoreFit"];

// Hook for responsive
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, w };
}

export default function VaqoLanding({ onApply, onLogin }) {
  // Fallbacks nëse nuk jepen props
  if (!onApply) onApply = () => window.location.href = '/apply';
  if (!onLogin) onLogin = () => window.location.href = '/login';
  const { isMobile, isTablet, isDesktop, w } = useBreakpoint();
  const [activeCat, setActiveCat] = useState(0);
  const [activeFeat, setActiveFeat] = useState(0);
  const [faqOpen, setFaqOpen] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [featOpen, setFeatOpen] = useState(false);
  
  // Close menus on outside click
  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest('.mega-menu-wrap')) {
        setMegaOpen(false);
        setFeatOpen(false);
      }
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  const [calc, setCalc] = useState({ clients:200, bookings:5, admin:2 });
  const [count, setCount] = useState({ gyms:0, members:0, rating:0 });
  const [scrolled, setScrolled] = useState(false);
  const started = useRef(false);

  const savedHours = Math.round((calc.clients*calc.bookings*.5 + calc.admin*60)/60*10)/10;
  const savedMoney = Math.round(savedHours*800);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const anim = (k, target, ms) => {
      const s = Date.now();
      const tick = () => {
        const p = Math.min((Date.now()-s)/ms, 1);
        setCount(c => ({...c, [k]: Math.round((1-Math.pow(1-p,3))*target)}));
        if (p<1) requestAnimationFrame(tick);
      };
      setTimeout(() => requestAnimationFrame(tick), 400);
    };
    anim("gyms", 150, 1600); anim("members", 28000, 2000); anim("rating", 98, 1200);
  }, []);

  // Responsive values
  const px = isMobile ? 20 : isTablet ? 32 : 64;
  const py = isMobile ? 64 : isTablet ? 80 : 100;
  const h1Size = isMobile ? 38 : isTablet ? 52 : 76;

  const btn = (bg="#18181b", c="#fff", extra={}) => ({
    background:bg, color:c, border:"none", borderRadius:10, fontWeight:700,
    cursor:"pointer", fontFamily:"inherit", transition:"all .2s", ...extra
  });

  return (
    <div style={{ fontFamily:"Georgia,serif", color:"#18181b", lineHeight:1.6, overflowX:"hidden" }}>
      <style>{`
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        .ticker{animation:scroll 30s linear infinite}
        .lift:hover{transform:translateY(-3px)!important;box-shadow:0 16px 40px rgba(0,0,0,.1)!important}
        .nav-btn:hover{background:rgba(0,0,0,.05)!important}
        input[type=range]{-webkit-appearance:none;height:3px;border-radius:2px;cursor:pointer;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#fff;border:2.5px solid #c8a96e;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15)}
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position:"sticky", top:0, zIndex:200, height:60, padding:`0 ${px}px`, display:"flex", alignItems:"center", justifyContent:"space-between", background:scrolled||menuOpen?"rgba(255,255,255,.97)":"transparent", backdropFilter:scrolled||menuOpen?"blur(20px)":"none", borderBottom:scrolled||menuOpen?"1px solid rgba(0,0,0,.07)":"none", transition:"all .3s" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:9, cursor:"pointer" }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"#18181b", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💪</div>
          <span style={{ fontSize:22, fontWeight:900, letterSpacing:"-.3px" }}>Vaqo</span>
        </div>

        {/* Desktop nav */}
        {isDesktop && (
          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
            {/* Bizneset mega */}
            <div className="mega-menu-wrap" style={{ position:"relative" }}>
              <button className="nav-btn" onClick={()=>{setMegaOpen(o=>!o);setFeatOpen(false)}} style={{ ...btn("none","#18181b"), padding:"7px 13px", fontSize:14, fontWeight:500, borderRadius:8 }}>
                Bizneset <span style={{ fontSize:10, display:"inline-block", transition:"transform .2s", transform:megaOpen?"rotate(180deg)":"none" }}>▾</span>
              </button>
              {megaOpen && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", width:580, background:"#fff", borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,.12)", border:"1px solid rgba(0,0,0,.06)", padding:22, zIndex:300, animation:"slideDown .2s ease" }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat.group} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#a1a1aa", marginBottom:8, fontFamily:"system-ui" }}>{cat.group}</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:3 }}>
                        {cat.items.map(item => (
                          <button key={item.name} onClick={()=>{setMegaOpen(false);window.location.href=`/category/${item.slug}`}} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 11px", borderRadius:9, border:"none", background:"none", cursor:"pointer", textAlign:"left", fontFamily:"inherit", transition:"background .15s" }}
                            onMouseEnter={e=>e.currentTarget.style.background="#f8f8f8"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                            <span style={{ fontSize:18, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600 }}>{item.name}</div>
                              <div style={{ fontSize:11, color:"#71717a", lineHeight:1.4, fontFamily:"system-ui" }}>{item.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:12, display:"flex", gap:8 }}>
                    <button onClick={()=>setMegaOpen(false)} style={{ flex:1, padding:"9px", borderRadius:8, border:"1px solid #e4e4e7", background:"none", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"system-ui" }}>🔍 Explore</button>
                    <button onClick={()=>setMegaOpen(false)} style={{ flex:1, padding:"9px", borderRadius:8, border:"none", background:"#18181b", color:"#fff", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"system-ui" }}>Regjistro Biznesin →</button>
                  </div>
                </div>
              )}
            </div>

            {/* Funksionet mega */}
            <div className="mega-menu-wrap" style={{ position:"relative" }}>
              <button className="nav-btn" onClick={()=>{setFeatOpen(o=>!o);setMegaOpen(false)}} style={{ ...btn("none","#18181b"), padding:"7px 13px", fontSize:14, fontWeight:500, borderRadius:8 }}>
                Funksionet <span style={{ fontSize:10, display:"inline-block", transition:"transform .2s", transform:featOpen?"rotate(180deg)":"none" }}>▾</span>
              </button>
              {featOpen && (
                <div style={{ position:"absolute", top:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)", width:640, background:"#fff", borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,.12)", border:"1px solid rgba(0,0,0,.06)", padding:22, zIndex:300, animation:"slideDown .2s ease" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                    {FEATURES.map(feat => (
                      <div key={feat.category} style={{ background:feat.bg, borderRadius:12, padding:14 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                          <div style={{ width:26, height:26, borderRadius:7, background:feat.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>{feat.icon}</div>
                          <div style={{ fontSize:11, fontWeight:700, color:feat.color, fontFamily:"system-ui" }}>{feat.category}</div>
                        </div>
                        {feat.items.map(item => (
                          <button key={item.title} onClick={()=>{setFeatOpen(false);document.getElementById('features')?.scrollIntoView({behavior:'smooth'})}} style={{ display:"flex", gap:7, padding:"5px 0", borderBottom:"1px solid rgba(0,0,0,.05)", background:"none", border:"none", cursor:"pointer", textAlign:"left", width:"100%", fontFamily:"inherit", borderRadius:6, transition:"background .15s" }}
                            onMouseEnter={e=>e.currentTarget.style.background="rgba(0,0,0,.03)"} onMouseLeave={e=>e.currentTarget.style.background="none"}>
                            <span style={{ fontSize:13 }}>{item.icon}</span>
                            <div>
                              <div style={{ fontSize:11, fontWeight:600, fontFamily:"system-ui" }}>{item.title}</div>
                              <div style={{ fontSize:10, color:"#71717a", lineHeight:1.3, fontFamily:"system-ui" }}>{item.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="nav-btn" onClick={()=>{const el=document.getElementById('pricing');if(el)el.scrollIntoView({behavior:'smooth'});else{window.location.href='/#pricing'}}} style={{ ...btn("none","#18181b"), padding:"7px 13px", fontSize:14, fontWeight:500, borderRadius:8 }}>Çmimet</button>
            <button className="nav-btn" onClick={()=>window.location.href='/nutritionist/apply'} style={{ ...btn("none","#18181b"), padding:"7px 13px", fontSize:14, fontWeight:500, borderRadius:8 }}>Dietologë</button>
            <button className="nav-btn" onClick={()=>window.location.href='/explore'} style={{ ...btn("none","#18181b"), padding:"7px 13px", fontSize:14, fontWeight:500, borderRadius:8 }}>🔍 Explore</button>
            <div style={{ width:1, height:18, background:"rgba(0,0,0,.1)", margin:"0 4px" }}/>
            <button className="nav-btn" onClick={()=>window.location.href='/login'} style={{ ...btn("none","#18181b"), padding:"7px 13px", fontSize:14, fontWeight:500, borderRadius:8 }}>Hyr</button>
            <button onClick={()=>window.location.href='/demo'} style={{ ...btn(), padding:"8px 18px", fontSize:13, borderRadius:8 }}>Book Demo</button>
          </div>
        )}

        {/* Tablet nav */}
        {isTablet && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button className="nav-btn" style={{ ...btn("none","#18181b"), padding:"7px 13px", fontSize:13, fontWeight:500, borderRadius:8 }}>Hyr</button>
            <button style={{ ...btn(), padding:"8px 16px", fontSize:13, borderRadius:8 }}>Book Demo</button>
            <button onClick={()=>setMenuOpen(m=>!m)} style={{ ...btn("none","#18181b"), padding:"7px 10px", fontSize:20, borderRadius:8 }}>☰</button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={()=>setMenuOpen(m=>!m)} style={{ background:"none", border:"none", cursor:"pointer", padding:6, display:"flex", flexDirection:"column", gap:5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ display:"block", width:22, height:2, background:"#18181b", borderRadius:2, transition:"all .3s",
                transform: menuOpen ? (i===0?"translateY(7px) rotate(45deg)":i===2?"translateY(-7px) rotate(-45deg)":"scaleX(0)") : "none" }}/>
            ))}
          </button>
        )}
      </nav>

      {/* Mobile/Tablet menu */}
      {menuOpen && !isDesktop && (
        <div style={{ position:"fixed", top:60, left:0, right:0, background:"#fff", borderBottom:"1px solid #e4e4e7", padding:"16px 20px 24px", zIndex:190, boxShadow:"0 8px 32px rgba(0,0,0,.08)", animation:"slideDown .2s ease" }}>
          {[
            ["🏋️ Bizneset",()=>onApply()],
            ["⚡ Funksionet",()=>document.getElementById('features')?.scrollIntoView({behavior:'smooth'})],
            ["💰 Çmimet",()=>document.getElementById('pricing')?.scrollIntoView({behavior:'smooth'})],
            ["🥗 Dietologë",()=>window.location.href='/nutritionist/apply'],
            ["🔍 Explore",()=>window.location.href='/explore'],
          ].map(([l,fn]) => (
            <button key={l} onClick={()=>{setMenuOpen(false);fn()}} style={{ display:"block", width:"100%", background:"none", border:"none", cursor:"pointer", padding:"13px 8px", borderRadius:8, fontSize:15, fontWeight:500, color:"#18181b", fontFamily:"inherit", textAlign:"left", borderBottom:"1px solid #f4f4f5" }}>{l}</button>
          ))}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:16 }}>
            <button onClick={()=>{setMenuOpen(false);window.location.href='/login'}} style={{ padding:"12px", borderRadius:9, border:"1px solid #e4e4e7", background:"none", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit" }}>Hyr</button>
            <button onClick={()=>{setMenuOpen(false);onApply()}} style={{ ...btn(), padding:"12px", fontSize:14, borderRadius:9 }}>Book Demo</button>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ minHeight:"100vh", padding:`${isMobile?100:120}px ${px}px ${py/2}px`, background:"#fafafa", position:"relative", overflow:"hidden", display:"flex", alignItems:"center" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.04) 1px,transparent 1px)", backgroundSize:"48px 48px" }}/>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 80% 50%,rgba(124,58,237,.06) 0%,transparent 70%)" }}/>

        <div style={{ maxWidth:1100, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:isMobile?0:isTablet?48:80, flexDirection:isDesktop?"row":"column" }}>

            {/* Left */}
            <div style={{ flex:1, animation:"fadeUp .8s ease both", textAlign:isMobile?"center":"left" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid rgba(0,0,0,.08)", borderRadius:100, padding:"4px 14px 4px 5px", fontSize:isMobile?11:12, fontWeight:600, color:"#52525b", marginBottom:isMobile?20:28, boxShadow:"0 2px 8px rgba(0,0,0,.04)", fontFamily:"system-ui" }}>
                <div style={{ background:"#18181b", borderRadius:100, padding:"3px 10px", fontSize:10, fontWeight:700, color:"#fff" }}>RISI</div>
                Rezervim Online + Harta 🗺️
              </div>

              <h1 style={{ fontSize:h1Size, lineHeight:1.0, fontWeight:900, letterSpacing:"-.04em", marginBottom:isMobile?16:22, color:"#18181b" }}>
                Software Wellness<br/>
                <span style={{ fontStyle:"italic", color:"#7c3aed" }}>All-in-One</span><br/>
                për Shqipërinë
              </h1>

              <p style={{ fontSize:isMobile?15:18, color:"#52525b", lineHeight:1.75, maxWidth:isMobile?"100%":480, marginBottom:isMobile?24:36, fontFamily:"system-ui", marginLeft:isMobile?"auto":"0", marginRight:isMobile?"auto":"0" }}>
                Palestra, barbershop, sallon, spa, yoga — menaxho gjithçka nga një dashboard. Rezervime online, pagesa dhe check-in QR.
              </p>

              <div style={{ display:"flex", gap:10, marginBottom:isMobile?32:48, flexWrap:"wrap", justifyContent:isMobile?"center":"flex-start" }}>
                <button onClick={()=>window.location.href='/demo'} style={{ ...btn(), padding:`${isMobile?12:13}px ${isMobile?22:28}px`, fontSize:isMobile?14:15 }}>Book Demo Falas →</button>
                <button style={{ background:"transparent", color:"#18181b", border:"1.5px solid rgba(0,0,0,.12)", padding:`${isMobile?12:13}px ${isMobile?18:22}px`, borderRadius:10, fontSize:isMobile?13:14, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}>🔍 Shfleto</button>
              </div>

              {/* Stats */}
              <div style={{ display:"flex", gap:isMobile?24:44, paddingTop:24, borderTop:"1px solid rgba(0,0,0,.08)", flexWrap:"wrap", justifyContent:isMobile?"center":"flex-start" }}>
                {[[count.gyms+"+","Biznese"],[count.members.toLocaleString("sq-AL")+"+","Klientë"],[count.rating+"%","Të kënaqur"]].map(([n,l]) => (
                  <div key={l} style={{ textAlign:isMobile?"center":"left" }}>
                    <div style={{ fontSize:isMobile?34:44, fontWeight:900, lineHeight:1 }}>{n}</div>
                    <div style={{ fontSize:12, color:"#71717a", marginTop:4, fontFamily:"system-ui" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Dashboard (hidden on mobile, shown on tablet+) */}
            {!isMobile && (
              <div style={{ flex:"0 0 auto", width:isTablet?340:400, position:"relative", marginTop:isTablet?40:0 }}>
                <div style={{ background:"#fff", borderRadius:18, boxShadow:"0 24px 64px rgba(0,0,0,.12)", overflow:"hidden", animation:"float 8s ease-in-out infinite" }}>
                  <div style={{ background:"#18181b", padding:"10px 16px", display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ display:"flex", gap:5 }}>{["#ff5f57","#febc2e","#28c840"].map(c=><div key={c} style={{ width:9,height:9,borderRadius:"50%",background:c }}/>)}</div>
                    <div style={{ flex:1, textAlign:"center", fontSize:10, color:"rgba(255,255,255,.3)", fontFamily:"system-ui" }}>Vaqo Dashboard</div>
                  </div>
                  <div style={{ padding:16 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                      {[["🚪","47","Hyrje"],["💰","385K","Ardhura"],["📅","12","Rezervime"]].map(([ico,v,l]) => (
                        <div key={l} style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:10, padding:"10px 6px", textAlign:"center" }}>
                          <div style={{ fontSize:16, marginBottom:3 }}>{ico}</div>
                          <div style={{ fontSize:17, fontWeight:900 }}>{v}</div>
                          <div style={{ fontSize:9, color:"#a1a1aa", fontFamily:"system-ui" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:"#fafafa", border:"1px solid #f0f0f0", borderRadius:10, padding:"10px 12px", marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7, fontFamily:"system-ui" }}>
                        <div style={{ fontSize:10, fontWeight:700, color:"#52525b" }}>Rezervimet / javë</div>
                        <div style={{ fontSize:10, color:"#16a34a", fontWeight:600 }}>↑ 23%</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:44 }}>
                        {[45,70,55,90,75,100,80].map((h,i) => (
                          <div key={i} style={{ flex:1, height:`${h}%`, background:i===5?"#7c3aed":i===6?"#c4b5fd":"#18181b", borderRadius:"3px 3px 0 0", opacity:i===5||i===6?1:.7 }}/>
                        ))}
                      </div>
                    </div>
                    {[["MH","Mira H.","Yoga","#7c3aed"],["AK","Ardit K.","Prerje","#18181b"],["EJ","Era J.","Masazh","#be185d"]].map(([ini,nm,svc,c]) => (
                      <div key={nm} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px solid #f8f8f8" }}>
                        <div style={{ width:22, height:22, borderRadius:"50%", background:c, color:"#fff", fontSize:8, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, flexShrink:0 }}>{ini}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:11, fontWeight:600 }}>{nm}</div>
                          <div style={{ fontSize:9, color:"#71717a", fontFamily:"system-ui" }}>{svc}</div>
                        </div>
                        <div style={{ fontSize:11, color:"#16a34a" }}>✅</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating badges */}
                <div style={{ position:"absolute", top:-14, right:-16, background:"#fff", borderRadius:11, padding:"7px 13px", boxShadow:"0 6px 20px rgba(0,0,0,.1)", border:"1px solid rgba(0,0,0,.06)", animation:"float 6s ease-in-out infinite .5s", whiteSpace:"nowrap", fontFamily:"system-ui" }}>
                  <div style={{ fontSize:9, fontWeight:700, color:"#16a34a" }}>✅ Rezervim i Ri</div>
                  <div style={{ fontSize:11, fontWeight:600 }}>Arta K. — Yoga</div>
                </div>
                <div style={{ position:"absolute", bottom:-12, left:-16, background:"#18181b", borderRadius:11, padding:"7px 13px", boxShadow:"0 6px 20px rgba(0,0,0,.2)", animation:"float 7s ease-in-out infinite 1s", whiteSpace:"nowrap" }}>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,.5)", fontFamily:"system-ui" }}>💰 Sot</div>
                  <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>385,000 L</div>
                </div>
                {!isTablet && <div style={{ position:"absolute", top:"38%", left:-20, background:"#7c3aed", borderRadius:11, padding:"7px 13px", boxShadow:"0 6px 20px rgba(124,58,237,.3)", animation:"float 5s ease-in-out infinite 1.5s", whiteSpace:"nowrap", fontFamily:"system-ui" }}>
                  <div style={{ fontSize:9, color:"rgba(255,255,255,.7)" }}>QR Check-in</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#fff" }}>🚪 Besnik N.</div>
                </div>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background:"#18181b", padding:"10px 0", overflow:"hidden" }}>
        <div style={{ display:"flex" }}>
          <div className="ticker" style={{ display:"flex", whiteSpace:"nowrap", flexShrink:0 }}>
            {[...GYMS,...GYMS].map((g,i) => (
              <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"0 20px", fontSize:12, color:"rgba(255,255,255,.3)", fontFamily:"system-ui" }}>
                <span style={{ color:"rgba(255,255,255,.1)" }}>◆</span> {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section style={{ padding:`${py}px ${px}px`, background:"#fff" }}>
        <div style={{ maxWidth:1060, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:isMobile?0:48, alignItems:"flex-start", flexDirection:isMobile||isTablet?"column":"row" }}>
            <div style={{ width:isMobile||isTablet?"100%":260, marginBottom:isMobile||isTablet?32:0 }}>
              <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#7c3aed", marginBottom:10, fontFamily:"system-ui" }}>Kategoritë</div>
              <h2 style={{ fontSize:isMobile?26:isTablet?32:38, fontWeight:900, lineHeight:1.1, letterSpacing:"-.02em", marginBottom:12 }}>Çdo biznes wellness ka zgjidhjen e tij</h2>
              <p style={{ fontSize:14, color:"#52525b", lineHeight:1.75, marginBottom:20, fontFamily:"system-ui" }}>Vaqo adaptohet me funksione të dedikuara.</p>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {CATEGORIES.map((cat,i) => (
                  <button key={i} onClick={()=>setActiveCat(i)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 14px", borderRadius:10, border:"none", cursor:"pointer", fontFamily:"inherit", transition:"all .15s", background:activeCat===i?"#18181b":"#f4f4f5", color:activeCat===i?"#fff":"#52525b", fontSize:13, fontWeight:600 }}>
                    <span>{cat.icon}</span> {cat.group}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12 }}>
                {CATEGORIES[activeCat].items.map((item,i) => (
                  <div key={i} className="lift" style={{ background:"#fafafa", border:"1px solid #e4e4e7", borderRadius:14, padding:isMobile?16:20, cursor:"pointer", transition:"all .2s" }}
                    onClick={()=>window.location.href=`/category/${item.slug}`}>
                    <div style={{ fontSize:28, marginBottom:10 }}>{item.icon}</div>
                    <div style={{ fontWeight:700, fontSize:14, marginBottom:5 }}>{item.name}</div>
                    <div style={{ fontSize:12, color:"#71717a", lineHeight:1.6, marginBottom:10, fontFamily:"system-ui" }}>{item.desc}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:"#7c3aed", fontFamily:"system-ui" }}>Mëso më shumë →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:`${py}px ${px}px`, background:"#f5f5f5" }}>
        <div style={{ maxWidth:1060, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#7c3aed", marginBottom:10, fontFamily:"system-ui" }}>Funksionet</div>
            <h2 style={{ fontSize:isMobile?26:isTablet?32:44, fontWeight:900, lineHeight:1.1, marginBottom:10 }}>Gjithçka nën një çati</h2>
            <p style={{ fontSize:14, color:"#71717a", fontFamily:"system-ui" }}>Nuk ka nevojë për 5 aplikacione — Vaqo i mbledh të gjitha.</p>
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:28, flexWrap:"wrap" }}>
            {FEATURES.map((f,i) => (
              <button key={i} onClick={()=>setActiveFeat(i)} style={{ display:"flex", alignItems:"center", gap:6, padding:`${isMobile?8:9}px ${isMobile?14:18}px`, borderRadius:100, border:"none", cursor:"pointer", fontSize:isMobile?12:13, fontWeight:600, fontFamily:"inherit", transition:"all .2s", background:activeFeat===i?f.color:"#fff", color:activeFeat===i?"#fff":"#52525b", boxShadow:activeFeat===i?`0 4px 16px ${f.color}40`:"0 1px 4px rgba(0,0,0,.06)" }}>
                {f.icon} {isMobile?f.category.split(" ")[0]:f.category}
              </button>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12 }}>
            {FEATURES[activeFeat].items.map((item,i) => (
              <div key={i} className="lift" style={{ background:"#fff", borderRadius:14, padding:isMobile?20:24, border:"1px solid #e4e4e7", transition:"all .2s", cursor:"pointer" }}
                onClick={()=>onApply()}>
                <div style={{ width:44, height:44, borderRadius:11, background:FEATURES[activeFeat].bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, marginBottom:12 }}>{item.icon}</div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{item.title}</div>
                <div style={{ fontSize:13, color:"#52525b", lineHeight:1.7, fontFamily:"system-ui" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:`${py}px ${px}px`, background:"#18181b", color:"#fff" }}>
        <div style={{ maxWidth:1060, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#c8a96e", marginBottom:10, fontFamily:"system-ui" }}>Si Funksionon</div>
          <h2 style={{ fontSize:isMobile?26:isTablet?32:44, fontWeight:900, lineHeight:1.1, marginBottom:40 }}>Gati në 4 hapa</h2>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr 1fr":"repeat(4,1fr)", gap:isMobile?2:2, background:"rgba(255,255,255,.06)", borderRadius:18, overflow:"hidden", marginBottom:32 }}>
            {[["01","📝","Apliko","5 min formulari, pa pagesë."],["02","🤝","Book Demo","30 min me ekipin tonë."],["03","📥","Importo","Ngarko klientët ekzistues."],["04","🚀","Fillo!","Dashboard gati menjëherë."]].map(([n,ico,t,d],i) => (
              <div key={i} style={{ padding:isMobile?"20px 14px":"28px 20px", textAlign:"center", background:i%2===0?"transparent":"rgba(255,255,255,.03)" }}>
                <div style={{ fontSize:isMobile?32:44, fontWeight:900, color:"rgba(255,255,255,.07)", lineHeight:1, marginBottom:8 }}>{n}</div>
                <div style={{ fontSize:isMobile?24:28, marginBottom:8 }}>{ico}</div>
                <div style={{ fontWeight:700, fontSize:isMobile?13:14, color:"#fff", marginBottom:5 }}>{t}</div>
                <div style={{ fontSize:isMobile?11:12, color:"rgba(255,255,255,.4)", lineHeight:1.7, fontFamily:"system-ui" }}>{d}</div>
              </div>
            ))}
          </div>
          <button style={{ ...btn("#c8a96e"), padding:`${isMobile?12:13}px ${isMobile?28:36}px`, fontSize:isMobile?14:15 }}>Book Demo Falas →</button>
        </div>
      </section>

      {/* CALCULATOR */}
      <section style={{ padding:`${py}px ${px}px`, background:"#fff" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#7c3aed", marginBottom:10, fontFamily:"system-ui" }}>Kalkulatori</div>
            <h2 style={{ fontSize:isMobile?24:isTablet?30:40, fontWeight:900, lineHeight:1.1 }}>Sa kohë kursen çdo muaj?</h2>
          </div>
          <div style={{ background:"#18181b", borderRadius:20, padding:isMobile?24:40 }}>
            <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:isMobile?28:48 }}>
              <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
                {[{k:"clients",label:"Klientë aktivë",min:10,max:500,step:10,unit:"klientë"},{k:"bookings",label:"Min/klient rezervim",min:1,max:15,step:1,unit:"min"},{k:"admin",label:"Orë admin / ditë",min:1,max:8,step:1,unit:"orë"}].map(s => (
                  <div key={s.k}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10, fontFamily:"system-ui" }}>
                      <label style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>{s.label}</label>
                      <span style={{ fontWeight:700, color:"#c8a96e", fontSize:14 }}>{calc[s.k]} {s.unit}</span>
                    </div>
                    <input type="range" min={s.min} max={s.max} step={s.step} value={calc[s.k]} onChange={e=>setCalc(c=>({...c,[s.k]:Number(e.target.value)}))} style={{ width:"100%", background:"rgba(255,255,255,.15)" }}/>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:12, justifyContent:"center" }}>
                <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:isMobile?18:24, textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", marginBottom:5, letterSpacing:".07em", textTransform:"uppercase", fontFamily:"system-ui" }}>Kohë e kursyer / muaj</div>
                  <div style={{ fontSize:isMobile?44:56, fontWeight:900, color:"#c8a96e", lineHeight:1 }}>{savedHours}</div>
                  <div style={{ fontSize:13, color:"rgba(255,255,255,.4)", marginTop:5, fontFamily:"system-ui" }}>orë pune</div>
                </div>
                <div style={{ background:"rgba(200,169,110,.12)", border:"1px solid rgba(200,169,110,.25)", borderRadius:14, padding:isMobile?16:22, textAlign:"center" }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,.3)", marginBottom:5, letterSpacing:".07em", textTransform:"uppercase", fontFamily:"system-ui" }}>Vlerë e kursyer</div>
                  <div style={{ fontSize:isMobile?36:42, fontWeight:900, color:"#c8a96e", lineHeight:1 }}>{savedMoney.toLocaleString("sq-AL")}</div>
                  <div style={{ fontSize:12, color:"rgba(255,255,255,.4)", marginTop:5, fontFamily:"system-ui" }}>L / muaj</div>
                </div>
                <div style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,.3)", lineHeight:1.8, fontFamily:"system-ui" }}>
                  Vaqo Pro: <strong style={{ color:"#c8a96e" }}>7,900 L/muaj</strong><br/>
                  ROI: <strong style={{ color:"#4ade80" }}>{Math.max(0,savedMoney-7900).toLocaleString("sq-AL")} L/muaj</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding:`${py}px ${px}px`, background:"#f5f5f5" }}>
        <div style={{ maxWidth:1060, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#7c3aed", marginBottom:10, fontFamily:"system-ui" }}>Çmimet</div>
            <h2 style={{ fontSize:isMobile?26:isTablet?32:44, fontWeight:900, lineHeight:1.1, marginBottom:10 }}>Transparent. Pa surpriza.</h2>
            <p style={{ fontSize:14, color:"#71717a", fontFamily:"system-ui" }}>30 ditë falas · Pa kontratë · Upgrade kurdo</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":isTablet?"1fr 1fr":"repeat(3,1fr)", gap:16, maxWidth:isMobile?400:isTablet?600:"100%", margin:"0 auto" }}>
            {PLANS.map((p,i) => (
              <div key={i} className="lift" style={{ position:"relative", borderRadius:18, padding:isMobile?24:28, border:`2px solid ${p.featured?p.color:"#e4e4e7"}`, background:p.featured?"#18181b":"#fff", color:p.featured?"#fff":"#18181b", boxShadow:p.featured?"0 20px 60px rgba(0,0,0,.15)":"none", transition:"all .2s" }}>
                {p.featured && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:p.color, color:"#fff", fontSize:10, fontWeight:700, padding:"3px 12px", borderRadius:100, whiteSpace:"nowrap", textTransform:"uppercase", fontFamily:"system-ui" }}>⭐ Më i Popullar</div>}
                <div style={{ display:"inline-flex", background:p.featured?"rgba(255,255,255,.1)":"#f4f4f5", borderRadius:100, padding:"2px 10px", fontSize:11, fontWeight:600, color:p.featured?"rgba(255,255,255,.6)":"#52525b", marginBottom:12, fontFamily:"system-ui" }}>👥 {p.limit}</div>
                <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:p.featured?"rgba(255,255,255,.4)":"#a1a1aa", marginBottom:6, fontFamily:"system-ui" }}>{p.name}</div>
                <div style={{ fontSize:isMobile?46:52, fontWeight:900, lineHeight:1, marginBottom:4 }}>{p.price}<span style={{ fontSize:15 }}> L</span></div>
                <div style={{ fontSize:11, color:p.featured?"rgba(255,255,255,.35)":"#71717a", marginBottom:20, fontFamily:"system-ui" }}>/ muaj</div>
                <ul style={{ listStyle:"none", marginBottom:24, display:"flex", flexDirection:"column" }}>
                  {p.features.map((f,j) => (
                    <li key={j} style={{ fontSize:13, padding:"8px 0", borderBottom:`1px solid ${p.featured?"rgba(255,255,255,.07)":"rgba(0,0,0,.05)"}`, display:"flex", alignItems:"center", gap:9, fontFamily:"system-ui" }}>
                      <span style={{ color:p.featured?"#c8a96e":"#16a34a", fontWeight:700 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={()=>p.name==='Business'?window.location.href='tel:+35569000000':onApply()} style={{ display:"block", width:"100%", padding:12, borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", border:p.featured?"none":"1.5px solid #e4e4e7", background:p.featured?"#fff":"transparent", color:"#18181b" }}>{p.cta}</button>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:20, fontSize:12, color:"#71717a", fontFamily:"system-ui" }}>💵 Cash ose transfertë · ✅ 30 ditë falas · 🔒 Anulo kurdo</div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:`${py}px ${px}px`, background:"#fff" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:40 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#7c3aed", marginBottom:10, fontFamily:"system-ui" }}>FAQ</div>
            <h2 style={{ fontSize:isMobile?24:isTablet?30:40, fontWeight:900, lineHeight:1.1 }}>Pyetje të Shpeshta</h2>
          </div>
          {FAQS.map((f,i) => (
            <div key={i} style={{ borderBottom:"1px solid #e4e4e7" }}>
              <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ width:"100%", background:"none", border:"none", padding:"16px 0", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"inherit", textAlign:"left", gap:12 }}>
                <span style={{ fontSize:isMobile?14:15, fontWeight:600 }}>{f.q}</span>
                <span style={{ fontSize:20, color:"#a1a1aa", transition:"transform .2s", transform:faqOpen===i?"rotate(45deg)":"none", flexShrink:0 }}>+</span>
              </button>
              <div style={{ overflow:"hidden", maxHeight:faqOpen===i?160:0, opacity:faqOpen===i?1:0, transition:"max-height .3s ease,opacity .25s ease" }}>
                <p style={{ fontSize:13, color:"#52525b", lineHeight:1.8, paddingBottom:16, fontFamily:"system-ui" }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="nutritionists" style={{ padding:`${py}px ${px}px`, background:"#18181b", color:"#fff", textAlign:"center" }}>
        <div style={{ maxWidth:560, margin:"0 auto" }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:"#c8a96e", marginBottom:14, fontFamily:"system-ui" }}>Fillo Sot</div>
          <h2 style={{ fontSize:isMobile?28:isTablet?36:52, fontWeight:900, lineHeight:1.05, letterSpacing:"-.03em", marginBottom:16 }}>Gati të modernizosh biznesin tënd?</h2>
          <p style={{ fontSize:isMobile?14:16, color:"rgba(255,255,255,.4)", marginBottom:40, lineHeight:1.75, fontFamily:"system-ui" }}>Book demo falas dhe shiko si Vaqo ndryshon gjithçka.</p>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:12, maxWidth:480, margin:"0 auto" }}>
            <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:16, padding:isMobile?24:28, textAlign:"center" }}>
              <div style={{ fontSize:isMobile?32:36, marginBottom:10 }}>🏢</div>
              <div style={{ fontSize:isMobile?17:18, marginBottom:6 }}>Për Bizneset</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginBottom:16, lineHeight:1.7, fontFamily:"system-ui" }}>Palestra, barbershop, spa dhe shumë të tjera</div>
              <button onClick={onApply} onClick={()=>window.location.href='/demo'} style={{ ...btn("#fff","#18181b"), display:"block", width:"100%", padding:"12px", fontSize:13, borderRadius:9 }}>Book Demo →</button>
            </div>
            <div style={{ background:"rgba(22,163,74,.12)", border:"1px solid rgba(22,163,74,.25)", borderRadius:16, padding:isMobile?24:28, textAlign:"center" }}>
              <div style={{ fontSize:isMobile?32:36, marginBottom:10 }}>🥗</div>
              <div style={{ fontSize:isMobile?17:18, marginBottom:6 }}>Për Dietologët</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginBottom:16, lineHeight:1.7, fontFamily:"system-ui" }}>Shes dietat tua, merr 70% nga çdo shitje</div>
              <button onClick={()=>window.location.href='/nutritionist/apply'} style={{ ...btn("#16a34a"), display:"block", width:"100%", padding:"12px", fontSize:13, borderRadius:9 }}>Apliko si Dietolog →</button>
            </div>
          </div>
          <div style={{ marginTop:22, fontSize:11, color:"rgba(255,255,255,.2)", fontFamily:"system-ui" }}>✅ 30 ditë falas · 💵 Pa kartë krediti · 🔒 Anulo kurdo</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:"#0a0a0a", padding:`24px ${px}px`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:28, height:28, borderRadius:7, background:"#18181b", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💪</div>
          <span style={{ fontSize:17, color:"#fff", fontWeight:900 }}>Vaqo</span>
        </div>
        {!isMobile && <div style={{ fontSize:11, color:"rgba(255,255,255,.2)", fontFamily:"system-ui" }}>© 2026 Vaqo · Platforma Wellness #1 në Shqipëri 🇦🇱</div>}
        <div style={{ display:"flex", gap:16 }}>
          {["Explore","Apliko","Dietologë","Hyr"].map(l => (
            <span key={l} style={{ color:"rgba(255,255,255,.25)", fontSize:12, cursor:"pointer", fontFamily:"system-ui" }}>{l}</span>
          ))}
        </div>
        {isMobile && <div style={{ width:"100%", fontSize:11, color:"rgba(255,255,255,.2)", fontFamily:"system-ui", textAlign:"center" }}>© 2026 Vaqo · Platforma Wellness #1 🇦🇱</div>}
      </footer>
    </div>
  );
}
