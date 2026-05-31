import { useState, useEffect } from 'react'

function useW() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return {isMobile:w<640,isTablet:w>=640&&w<1024}
}

const PLANS = [
  {
    name:'Starter', price:4900, period:'muaj', color:'#18181b', featured:false,
    desc:'Perfekt për biznese të reja dhe të vogla',
    limit:'Deri 100 klientë',
    features:[
      {cat:'Dashboard & Raporte', items:['Dashboard live me statistika','Raporte mujore bazike','Eksport të dhënash (CSV)']},
      {cat:'Klientë & Staf', items:['Deri 100 klientë/anëtarë','1 account stafi (owner)','Profil i plotë klientësh']},
      {cat:'Pagesa & Fatura', items:['Pagesa cash & transfertë','Fatura automatike PDF','Gjurmim borxhesh']},
      {cat:'Check-in & QR', items:['QR Check-in','Histori hyrjesh','Check-in manual']},
      {cat:'Rezervime', items:['Rezervime online (klientët)','Orare të lira automatike','Njoftime email bazike']},
      {cat:'Support', items:['Support me email','Dokumentacion i plotë','Setup 30 min me ekipin']},
    ],
    cta:'Fillo 30 Ditë Falas',
    badge: null,
  },
  {
    name:'Pro', price:7900, period:'muaj', color:'#7c3aed', featured:true,
    desc:'Për biznese në rritje me nevoja të avancuara',
    limit:'Deri 500 klientë',
    features:[
      {cat:'Gjithçka nga Starter, plus:', items:['']},
      {cat:'Klientë & Staf', items:['Deri 500 klientë/anëtarë','5 accounts stafi','Role të ndryshme (admin, recepsion, trajner)']},
      {cat:'Klasa & Rezervime', items:['Klasa grupore me kapacitet','Listë pritjeje automatike','Rezervime të përsëritura javore','Kujtues SMS/email automatikë']},
      {cat:'Marketing & Rritje', items:['Profil publik te Explore','Shfaqje te harta interaktive','Reviews & Rating publik','Faqe dedikate /b/slug']},
      {cat:'Raporte të Avancuara', items:['Raporte të detajuara','Analiza klientësh','Grafik të ardhurash','Forecast mujor']},
      {cat:'Support', items:['Support prioritar (24h)','Onboarding personal','Chat support']},
    ],
    cta:'Fillo Pro →',
    badge:'⭐ Më i Popullar',
  },
  {
    name:'Business', price:14900, period:'muaj', color:'#16a34a', featured:false,
    desc:'Për zinxhirë, shumë degë dhe volume të lartë',
    limit:'Klientë të pakufizuar',
    features:[
      {cat:'Gjithçka nga Pro, plus:', items:['']},
      {cat:'Multi-lokacion', items:['Degë të pakufizuara','Dashboard i konsoliduar','Raporte ndër-lokacione','Check-in në çdo degë']},
      {cat:'Staf & Akses', items:['Staf i pakufizuar','Akses i personalizuar','Log i aktiviteteve stafi','API akses i plotë']},
      {cat:'Integrtime', items:['Webhook integrations','API dokumentacion','Eksport i avancuar','Backup automatik']},
      {cat:'Support Premium', items:['Manager i dedikuar','SLA 99.9% uptime','Support 24/7','Onboarding premium']},
      {cat:'Çmime Speciale', items:['Negocim çmimi për volume','Kontratë vjetore me zbritje','Faturim i personalizuar']},
    ],
    cta:'Na Kontaktoni',
    badge: null,
  },
]

const BIZ_PLANS = [
  { biz:'🏋️ Palestre & Studio Fitness',   s:4900, p:7900, b:14900 },
  { biz:'🧘 Yoga, Pilates, Arte Marciale', s:3900, p:6900, b:12900 },
  { biz:'💈 Barbershop',                   s:2900, p:4900, b:8900  },
  { biz:'💅 Sallon Bukurie',               s:2900, p:4900, b:8900  },
  { biz:'💆 Spa & Masazh',                 s:3900, p:6900, b:11900 },
  { biz:'🌿 Wellness Clinic',              s:4900, p:7900, b:14900 },
  { biz:'💃 Studio Vallëzimi',             s:3900, p:6900, b:12900 },
]

const FAQS = [
  {q:'A ka kontratë afatgjatë?', a:'Jo. Pagesa bëhet muaj pas muaji. Anuloni kurdo pa penalitete.'},
  {q:'Si paguhet abonimi i platformës?', a:'Cash ose transfertë bankare çdo muaj. Nuk kërkohet kartë krediti.'},
  {q:'A mund të ndryshoj planin?', a:'Po, kurdo. Upgrade ose downgrade — efektiv nga muaji i ardhshëm.'},
  {q:'Çfarë ndodh pas 30 ditëve falas?', a:'Nëse nuk dëshironi të vazhdoni, nuk ju ngarkohet asgjë. Të dhënat ruhen 30 ditë shtesë.'},
  {q:'A përfshihen pagesat e klientëve?', a:'Klientët tuaj paguajnë direkt te ju (cash). Vaqo nuk merkon transaksionet e klientëve.'},
  {q:'A ka kosto shtesë?', a:'Jo. Çmimi i listuar është gjithçka — pa tarifa setup, pa kosto hidden.'},
  {q:'Si funksionon 30 ditët falas?', a:'Akses i plotë i planit Pro falas. Pas 30 ditësh zgjedhni planin ose anuloni.'},
  {q:'A ka zbritje vjetore?', a:'Po! Pagesa vjetore sjell 2 muaj falas (ekuivalente me 17% zbritje). Kontaktoni për detaje.'},
]

export default function Pricing() {
  const {isMobile, isTablet} = useW()
  const [period, setPeriod] = useState('monthly') // monthly | yearly
  const [openFaq, setOpenFaq] = useState(null)
  const [activeBiz, setActiveBiz] = useState(null)
  const px = isMobile?16:isTablet?32:64

  const discount = period==='yearly' ? 0.83 : 1 // 17% off yearly
  const fmt = n => Math.round(n*discount).toLocaleString('sq-AL')

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif',color:'#18181b',lineHeight:1.6,overflowX:'hidden',background:'#fff'}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .plan-card:hover{transform:translateY(-4px);box-shadow:0 20px 60px rgba(0,0,0,.1)}
        .feat-check{color:#16a34a;font-weight:700;flex-shrink:0;margin-top:1px}
        .biz-row:hover{background:#fafafa!important}
        a{color:inherit;text-decoration:none}
      `}</style>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,zIndex:100,height:56,padding:`0 ${px}px`,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,.07)'}}>
        <button onClick={()=>window.location.href='/'} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:0}}>
          <div style={{width:30,height:30,borderRadius:8,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>💪</div>
          <span style={{fontSize:19,fontWeight:900,color:'#18181b',fontFamily:'Georgia,serif'}}>Vaqo</span>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {!isMobile&&<button onClick={()=>window.location.href='/explore'} style={{background:'none',border:'1px solid #e4e4e7',color:'#18181b',padding:'6px 14px',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>🔍 Explore</button>}
          <button onClick={()=>window.location.href='/login'} style={{background:'none',border:'1px solid #e4e4e7',color:'#18181b',padding:'6px 14px',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>Hyr</button>
          <button onClick={()=>window.location.href='/demo'} style={{background:'#18181b',color:'#fff',border:'none',padding:'8px 18px',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Book Demo</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{padding:`${isMobile?48:72}px ${px}px ${isMobile?32:48}px`,background:'#fafafa',textAlign:'center',borderBottom:'1px solid #e4e4e7'}}>
        <div style={{maxWidth:640,margin:'0 auto',animation:'fadeUp .6s ease both'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:7,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:100,padding:'5px 14px',fontSize:12,fontWeight:700,color:'#16a34a',marginBottom:20}}>
            ✅ 30 Ditë Falas · Pa Kartë Krediti
          </div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:isMobile?28:isTablet?36:52,fontWeight:900,lineHeight:1.05,letterSpacing:'-.03em',marginBottom:14}}>
            Çmime transparente.<br/><span style={{color:'#7c3aed'}}>Pa surpriza.</span>
          </h1>
          <p style={{fontSize:isMobile?14:17,color:'#52525b',lineHeight:1.75,marginBottom:28}}>
            Një çmim fiks çdo muaj — pa tarifa setup, pa kosto hidden, pa kontratë. Paguani vetëm për ato muaj që përdorni.
          </p>

          {/* Period toggle */}
          <div style={{display:'inline-flex',background:'#f4f4f5',borderRadius:12,padding:4,gap:4}}>
            <button onClick={()=>setPeriod('monthly')} style={{padding:'8px 20px',borderRadius:9,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit',transition:'all .2s',background:period==='monthly'?'#fff':'transparent',color:period==='monthly'?'#18181b':'#71717a',boxShadow:period==='monthly'?'0 1px 4px rgba(0,0,0,.08)':'none'}}>
              Mujor
            </button>
            <button onClick={()=>setPeriod('yearly')} style={{padding:'8px 20px',borderRadius:9,border:'none',cursor:'pointer',fontSize:14,fontWeight:600,fontFamily:'inherit',transition:'all .2s',background:period==='yearly'?'#fff':'transparent',color:period==='yearly'?'#18181b':'#71717a',boxShadow:period==='yearly'?'0 1px 4px rgba(0,0,0,.08)':'none',display:'flex',alignItems:'center',gap:6}}>
              Vjetor
              <span style={{background:'#16a34a',color:'#fff',fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:20}}>-17%</span>
            </button>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section style={{padding:`${isMobile?32:56}px ${px}px`,background:'#fff'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':isTablet?'1fr 1fr':'repeat(3,1fr)',gap:20}}>
            {PLANS.map((p,i)=>(
              <div key={i} className="plan-card" style={{position:'relative',borderRadius:18,border:`2px solid ${p.featured?p.color:'#e4e4e7'}`,background:p.featured?'#18181b':'#fff',color:p.featured?'#fff':'#18181b',padding:isMobile?24:32,transition:'all .25s',boxShadow:p.featured?'0 20px 60px rgba(0,0,0,.15)':'0 2px 8px rgba(0,0,0,.04)'}}>
                {p.badge&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:p.color,color:'#fff',fontSize:10,fontWeight:700,padding:'4px 14px',borderRadius:100,whiteSpace:'nowrap',textTransform:'uppercase',letterSpacing:'.06em'}}>{p.badge}</div>}

                <div style={{marginBottom:20}}>
                  <div style={{display:'inline-flex',background:p.featured?'rgba(255,255,255,.1)':'#f4f4f5',borderRadius:100,padding:'3px 12px',fontSize:11,fontWeight:700,color:p.featured?'rgba(255,255,255,.6)':'#52525b',marginBottom:12}}>👥 {p.limit}</div>
                  <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:p.featured?'rgba(255,255,255,.4)':'#a1a1aa',marginBottom:8}}>{p.name}</div>
                  <div style={{display:'flex',alignItems:'flex-end',gap:4,marginBottom:6}}>
                    <span style={{fontFamily:'Georgia,serif',fontSize:isMobile?44:52,fontWeight:900,lineHeight:1}}>{fmt(p.price)}</span>
                    <span style={{fontSize:14,color:p.featured?'rgba(255,255,255,.5)':'#71717a',marginBottom:8}}> L/{p.period}</span>
                  </div>
                  {period==='yearly'&&<div style={{fontSize:12,color:p.featured?'rgba(255,255,255,.4)':'#71717a',marginBottom:4}}>
                    <span style={{textDecoration:'line-through',opacity:.6}}>{p.price.toLocaleString('sq-AL')} L</span>
                    <span style={{color:'#16a34a',fontWeight:700,marginLeft:6}}>Kurseni {Math.round(p.price*0.17*12).toLocaleString('sq-AL')} L/vit</span>
                  </div>}
                  <div style={{fontSize:13,color:p.featured?'rgba(255,255,255,.45)':'#71717a',marginBottom:20}}>{p.desc}</div>
                </div>

                {/* Features */}
                <div style={{marginBottom:24}}>
                  {p.features.map((cat,ci)=>(
                    <div key={ci} style={{marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:p.featured?'rgba(255,255,255,.35)':'#a1a1aa',marginBottom:6,paddingBottom:4,borderBottom:`1px solid ${p.featured?'rgba(255,255,255,.08)':'rgba(0,0,0,.05)'}`}}>{cat.cat}</div>
                      {cat.items.filter(x=>x).map((item,ii)=>(
                        <div key={ii} style={{display:'flex',gap:8,padding:'4px 0',fontSize:13,color:p.featured?'rgba(255,255,255,.75)':'#52525b'}}>
                          <span className="feat-check" style={{color:p.featured?'#c8a96e':'#16a34a'}}>✓</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <button onClick={()=>p.name==='Business'?window.location.href='tel:+3556922910410':window.location.href='/demo'}
                  style={{display:'block',width:'100%',padding:'13px',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .2s',border:p.featured?'none':'1.5px solid #e4e4e7',background:p.featured?'#fff':'transparent',color:p.featured?'#18181b':'#18181b'}}
                  onMouseEnter={e=>{e.currentTarget.style.background=p.featured?'#f5f5f5':'#18181b';e.currentTarget.style.color=p.featured?'#18181b':'#fff'}}
                  onMouseLeave={e=>{e.currentTarget.style.background=p.featured?'#fff':'transparent';e.currentTarget.style.color='#18181b'}}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>

          <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#71717a'}}>
            💵 Pagesa cash ose transfertë &nbsp;·&nbsp; ✅ 30 ditë provë falas &nbsp;·&nbsp; 🔒 Anulo kurdo &nbsp;·&nbsp; ⚡ Setup 30 minuta
          </div>
        </div>
      </section>

      {/* ÇMIMET SIPAS LLOJIT BIZNESI */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#f5f5f5'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#7c3aed',marginBottom:10}}>Çmimet sipas Llojit</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?24:isTablet?30:40,fontWeight:900,lineHeight:1.1,marginBottom:10}}>
              Çmim i përshtatshëm për çdo biznes
            </h2>
            <p style={{fontSize:14,color:'#71717a'}}>Lloje të ndryshme biznesesh kanë nevoja dhe çmime të ndryshme.</p>
          </div>

          <div style={{background:'#fff',borderRadius:16,border:'1px solid #e4e4e7',overflow:'hidden'}}>
            {/* Header */}
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:0,background:'#18181b',padding:'12px 20px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.06em'}}>Lloji i Biznesit</div>
              {['Starter','Pro','Business'].map(n=>(
                <div key={n} style={{fontSize:11,fontWeight:700,color:n==='Pro'?'#c8a96e':'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'.06em',textAlign:'center'}}>{n}</div>
              ))}
            </div>

            {BIZ_PLANS.map((b,i)=>(
              <div key={i} className="biz-row" onClick={()=>setActiveBiz(activeBiz===i?null:i)}
                style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:0,padding:'14px 20px',borderBottom:i<BIZ_PLANS.length-1?'1px solid #f4f4f5':'none',cursor:'pointer',transition:'background .15s',background:activeBiz===i?'#f5f3ff':'#fff'}}>
                <div style={{fontSize:14,fontWeight:600,color:'#18181b',display:'flex',alignItems:'center',gap:8}}>{b.biz}</div>
                <div style={{textAlign:'center',fontSize:13,fontWeight:600,color:'#52525b'}}>{fmt(b.s).toLocaleString('sq-AL')} L</div>
                <div style={{textAlign:'center',fontSize:13,fontWeight:700,color:'#7c3aed'}}>{fmt(b.p).toLocaleString('sq-AL')} L</div>
                <div style={{textAlign:'center',fontSize:13,fontWeight:600,color:'#52525b'}}>{fmt(b.b).toLocaleString('sq-AL')} L</div>
              </div>
            ))}

            <div style={{padding:'12px 20px',background:'#fafafa',borderTop:'1px solid #e4e4e7',fontSize:12,color:'#a1a1aa',textAlign:'center'}}>
              Të gjitha çmimet janë L/muaj · {period==='yearly'?'-17% me pagesë vjetore':'Kliko "Vjetor" për -17%'}
            </div>
          </div>
        </div>
      </section>

      {/* KRAHASIM I PLOTË */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#fff'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#7c3aed',marginBottom:10}}>Krahasimi i Plotë</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?24:isTablet?30:40,fontWeight:900,lineHeight:1.1}}>Çfarë përfshihet në çdo plan</h2>
          </div>

          {[
            {cat:'📊 Dashboard & Raporte', rows:[
              ['Dashboard live','✅','✅','✅'],
              ['Raporte mujore bazike','✅','✅','✅'],
              ['Raporte të detajuara','—','✅','✅'],
              ['Analiza klientësh','—','✅','✅'],
              ['Raporte ndër-degë','—','—','✅'],
            ]},
            {cat:'👥 Klientë & Staf', rows:[
              ['Klientë/Anëtarë','Deri 100','Deri 500','Pa limit'],
              ['Accounts stafi','1 (owner)','5','Pa limit'],
              ['Role të ndryshme','—','✅','✅'],
              ['Multi-lokacion','—','—','✅'],
            ]},
            {cat:'📅 Rezervime & Klasa', rows:[
              ['Rezervime online','✅','✅','✅'],
              ['Orare të lira automatike','✅','✅','✅'],
              ['Klasa grupore','—','✅','✅'],
              ['Listë pritjeje','—','✅','✅'],
              ['Rezervime të përsëritura','—','✅','✅'],
            ]},
            {cat:'💰 Pagesa', rows:[
              ['Pagesa cash & transfertë','✅','✅','✅'],
              ['Fatura automatike PDF','✅','✅','✅'],
              ['Gjurmim borxhesh','✅','✅','✅'],
              ['Faturim i personalizuar','—','—','✅'],
            ]},
            {cat:'🔔 Njoftime & Email', rows:[
              ['Email konfirmimi rezervimi','✅','✅','✅'],
              ['Kujtues 24h para takimit','—','✅','✅'],
              ['Njoftim skadimi abonimi','—','✅','✅'],
              ['SMS njoftime','—','—','✅'],
            ]},
            {cat:'🌐 Explore & Marketing', rows:[
              ['Profil publik te Explore','—','✅','✅'],
              ['Shfaqje te harta','—','✅','✅'],
              ['Reviews & Rating','—','✅','✅'],
              ['SEO i optimizuar','—','✅','✅'],
            ]},
            {cat:'🔧 Teknik & Support', rows:[
              ['QR Check-in','✅','✅','✅'],
              ['App anëtarësh','✅','✅','✅'],
              ['API akses','—','—','✅'],
              ['Support email','✅','✅','✅'],
              ['Support prioritar','—','✅','✅'],
              ['Manager i dedikuar','—','—','✅'],
              ['SLA 99.9%','—','—','✅'],
            ]},
          ].map((section,si)=>(
            <div key={si} style={{marginBottom:24}}>
              <div style={{background:'#f4f4f5',padding:'10px 16px',borderRadius:'10px 10px 0 0',fontSize:13,fontWeight:700,color:'#18181b'}}>
                {section.cat}
              </div>
              <div style={{border:'1px solid #e4e4e7',borderTop:'none',borderRadius:'0 0 10px 10px',overflow:'hidden'}}>
                {/* Column headers on first section */}
                {si===0&&(
                  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',background:'#fafafa',borderBottom:'1px solid #e4e4e7'}}>
                    <div style={{padding:'8px 16px',fontSize:11,fontWeight:700,color:'#a1a1aa',textTransform:'uppercase'}}></div>
                    {['Starter','Pro','Business'].map(n=>(
                      <div key={n} style={{padding:'8px 8px',fontSize:11,fontWeight:700,color:n==='Pro'?'#7c3aed':'#52525b',textTransform:'uppercase',textAlign:'center',letterSpacing:'.06em'}}>{n}</div>
                    ))}
                  </div>
                )}
                {section.rows.map(([label,...vals],ri)=>(
                  <div key={ri} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',borderBottom:ri<section.rows.length-1?'1px solid #f5f5f5':'none'}}>
                    <div style={{padding:'10px 16px',fontSize:13,color:'#52525b'}}>{label}</div>
                    {vals.map((v,vi)=>(
                      <div key={vi} style={{padding:'10px 8px',textAlign:'center',fontSize:v==='✅'?16:12,fontWeight:v!=='✅'&&v!=='—'?600:400,color:v==='✅'?'#16a34a':v==='—'?'#d4d4d8':vi===1?'#7c3aed':'#52525b'}}>
                        {v}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#f5f5f5'}}>
        <div style={{maxWidth:680,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#7c3aed',marginBottom:10}}>FAQ</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?24:isTablet?28:38,fontWeight:900,lineHeight:1.1}}>Pyetje mbi Çmimet</h2>
          </div>
          <div style={{background:'#fff',borderRadius:16,border:'1px solid #e4e4e7',overflow:'hidden'}}>
            {FAQS.map((f,i)=>(
              <div key={i} style={{borderBottom:i<FAQS.length-1?'1px solid #f0f0f0':'none'}}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:'100%',background:'none',border:'none',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',fontFamily:'inherit',textAlign:'left',gap:12}}>
                  <span style={{fontSize:isMobile?14:15,fontWeight:600,color:'#18181b'}}>{f.q}</span>
                  <span style={{fontSize:20,color:'#a1a1aa',transition:'transform .25s',transform:openFaq===i?'rotate(45deg)':'none',flexShrink:0}}>+</span>
                </button>
                <div style={{overflow:'hidden',maxHeight:openFaq===i?160:0,opacity:openFaq===i?1:0,transition:'max-height .3s ease,opacity .25s ease'}}>
                  <p style={{fontSize:13,color:'#52525b',lineHeight:1.8,padding:'0 20px 16px'}}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#18181b',color:'#fff',textAlign:'center'}}>
        <div style={{maxWidth:520,margin:'0 auto'}}>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?26:isTablet?32:48,fontWeight:900,lineHeight:1.05,letterSpacing:'-.02em',marginBottom:14}}>
            Fillo 30 ditë falas
          </h2>
          <p style={{fontSize:isMobile?14:16,color:'rgba(255,255,255,.45)',marginBottom:32,lineHeight:1.75}}>
            Pa kartë krediti. Pa kontratë. Setup 30 minuta. Anulo kurdo.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <button onClick={()=>window.location.href='/demo'} style={{background:'#7c3aed',color:'#fff',border:'none',padding:`${isMobile?12:14}px ${isMobile?24:36}px`,borderRadius:11,fontSize:isMobile?14:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'opacity .2s'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Book Demo Falas →
            </button>
            <button onClick={()=>window.location.href='/apply'} style={{background:'transparent',color:'#fff',border:'1.5px solid rgba(255,255,255,.3)',padding:`${isMobile?12:14}px ${isMobile?20:28}px`,borderRadius:11,fontSize:isMobile?13:15,fontWeight:500,cursor:'pointer',fontFamily:'inherit',transition:'border-color .2s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.7)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,.3)'}>
              Apliko Direkt
            </button>
          </div>
          <div style={{marginTop:20,fontSize:12,color:'rgba(255,255,255,.2)'}}>
            ✅ 30 ditë falas &nbsp;·&nbsp; 💵 Pa kartë krediti &nbsp;·&nbsp; 🔒 Anulo kurdo
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#0a0a0a',padding:`20px ${px}px`,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <button onClick={()=>window.location.href='/'} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer'}}>
          <span style={{fontSize:17,color:'#fff',fontWeight:900,fontFamily:'Georgia,serif'}}>Vaqo</span>
        </button>
        {!isMobile&&<div style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>© 2026 Vaqo · Platforma Wellness #1 në Shqipëri 🇦🇱</div>}
        <div style={{display:'flex',gap:14}}>
          {[['Kryefaqja','/'],['Explore','/explore'],['Book Demo','/demo'],['Hyr','/login']].map(([l,h])=>(
            <a key={l} href={h} style={{color:'rgba(255,255,255,.25)',fontSize:12}}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
