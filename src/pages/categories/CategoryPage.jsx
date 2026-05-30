import { useState, useEffect } from 'react'

const CATEGORY_DATA = {
  gym:          { slug:'gym',          icon:'🏋️', name:'Palestre & Gym',     color:'#18181b', bg:'#f4f4f5', tagline:'Menaxho palestrën me efikasitet maksimal', desc:'Platforma e plotë për palestra — anëtarë, pagesa, check-in QR, plane stërvitjeje dhe raporte të detajuara.', stats:[['340+','Anëtarë mesatarisht'],['3h','Kursyer/ditë'],['40%','Rritje anëtarësh']], testimonial:{text:'Nga 80 anëtarë shkuam në 340 brenda 6 muajve. Dashboard-i më tregon gjithçka.',name:'Elona K.',biz:'PowerFit Studio, Durrës'},
    features:[{icon:'👥',t:'Menaxhim Anëtarësh',d:'Profil i plotë, abonime, pagesa, historiku dhe statistikat.'},{icon:'💰',t:'Pagesa & Fatura',d:'Cash ose transfertë. Fatura automatike me numër unik.'},{icon:'📷',t:'QR Check-in',d:'Çdo anëtar ka QR kod. Skanim i menjëhershëm.'},{icon:'📋',t:'Plane Stërvitjeje',d:'Trajneri krijon plane. Anëtari i sheh nga app-i mobil.'},{icon:'📊',t:'Raporte Live',d:'Të ardhura, prezenca, planet më të shituara — live.'},{icon:'📱',t:'App Anëtarësh',d:'Shohin abonimin, stërvitjet dhe statistikat.'},{icon:'🥗',t:'Dietologë',d:'Anëtarët blejnë plane dietash direkt nga app-i.'},{icon:'❄️',t:'Freeze Abonim',d:'Ngri abonimin kur anëtari është me pushime.'}],
    plans:['Starter — 4,900 L/muaj · deri 100 anëtarë','Pro — 7,900 L/muaj · deri 500 anëtarë','Business — 14,900 L/muaj · pa limit']},

  yoga:         { slug:'yoga',         icon:'🧘', name:'Yoga Studio',        color:'#7c3aed', bg:'#f5f3ff', tagline:'Klasa, instruktorë dhe rezervime — të organizuara', desc:'Sistemi i dedikuar për studio yoga — orare klasash, rezervime online, kapacitet automatik dhe listë pritjeje.', stats:[['95%','Kapacitet i mbushur'],['2h','Kursyer/ditë'],['60+','Rezervime/javë']], testimonial:{text:'Klasat mbushen vetë dhe ne fokusohemi te praktika.',name:'Mirela P.',biz:'Zen Yoga, Tiranë'},
    features:[{icon:'📅',t:'Orari i Klasave',d:'Klasa individuale ose të përsëritura çdo javë.'},{icon:'👥',t:'Rezervime Online',d:'Klientët rezervojnë 24/7 pa nevojë për llogari.'},{icon:'🔢',t:'Kapacitet Automatik',d:'Kur plotësohet, aktivizohet lista e pritjes.'},{icon:'🧘',t:'Nivele & Kategori',d:'Fillestar, Mesatar, Avancuar — Yoga, Pilates, Meditim.'},{icon:'👤',t:'Instruktorët',d:'Profil i dedikuar me specializim dhe orare.'},{icon:'📊',t:'Statistika',d:'Prezenca, rezervimet dhe të ardhurat për çdo klasë.'},{icon:'💰',t:'Çmim Fleksibël',d:'Çmim i ndryshëm për çdo klasë.'},{icon:'📱',t:'App Klientësh',d:'Shohin orarin, rezervojnë dhe marrin kujtues.'}],
    plans:['Starter — 3,900 L/muaj · deri 100 klientë','Pro — 6,900 L/muaj · deri 500 klientë','Business — 12,900 L/muaj · pa limit']},

  pilates:      { slug:'pilates',      icon:'🤸', name:'Pilates Studio',     color:'#0891b2', bg:'#ecfeff', tagline:'Klasa grupore dhe sesione individuale — të organizuara', desc:'Platforma e dedikuar për studio pilates — orare klasash, sesione individuale dhe ndjekja e progresit.', stats:[['85%','Klientë të kthyer'],['1.5h','Kursyer/ditë'],['30+','Sesione/javë']], testimonial:{text:'Menaxhimi i sesioneve individuale dhe klasave grupore nga e njëjta platformë.',name:'Arta M.',biz:'Balance Pilates, Tiranë'},
    features:[{icon:'📅',t:'Klasa & Sesione',d:'Grupore dhe 1-me-1 nga e njëjta platformë.'},{icon:'📈',t:'Progres Klientësh',d:'Ndjek ushtrimet, nivelin dhe objektivat.'},{icon:'👥',t:'Rezervime Online',d:'Klientët rezervojnë 24/7 nga telefoni.'},{icon:'🔢',t:'Kapacitet',d:'Kontroll i numrit maksimal dhe listës së pritjes.'},{icon:'👤',t:'Instruktorët',d:'Profil me klasat, oraret dhe disponueshmërinë.'},{icon:'💰',t:'Modele Pagese',d:'Abonim mujor, paketa klasash ose sesion i vetëm.'},{icon:'📊',t:'Raporte',d:'Prezenca, të ardhurat dhe klientët më aktivë.'},{icon:'📱',t:'App Klientësh',d:'Rezervo dhe ndjek progresin nga telefoni.'}],
    plans:['Starter — 3,900 L/muaj · deri 100 klientë','Pro — 6,900 L/muaj · deri 500 klientë','Business — 12,900 L/muaj · pa limit']},

  'martial-arts':{ slug:'martial-arts',icon:'🥊', name:'Arte Marciale',      color:'#dc2626', bg:'#fef2f2', tagline:'Gradime, klasa dhe progres — si duhet', desc:'Platforma për shkolla artesh marciale — gradime, klasa sipas nivelit, prezenca dhe progres individual.', stats:[['120+','Nxënës aktivë'],['100%','Prezencë QR'],['3x','Kohë kursyer']], testimonial:{text:'Sistemi i gradimeve dhe prezenca automatike me QR na ndihmuan shumë.',name:'Besnik H.',biz:'Dragon MMA, Tiranë'},
    features:[{icon:'🥋',t:'Sistemi i Gradimeve',d:'Ndjek beltat dhe gradimin e çdo nxënësi.'},{icon:'📅',t:'Klasa sipas Nivelit',d:'Fillestar, Intermediate, Avancuar.'},{icon:'👥',t:'Menaxhim Nxënësish',d:'Profil i plotë — gradimi, prezenca, pagesa.'},{icon:'📷',t:'QR Check-in',d:'Prezenca regjistrohet automatikisht.'},{icon:'💰',t:'Pagesa Mujore',d:'Abonim mujor ose tremujor me gjurmim borxhesh.'},{icon:'👤',t:'Instruktorët',d:'Menaxhon klasat dhe sheh statistikat e nxënësve.'},{icon:'🏆',t:'Turneut & Evente',d:'Regjistro nxënësit për turneut.'},{icon:'📊',t:'Raporte Prezence',d:'Ditore, javore dhe mujore. Nxënës jo aktivë.'}],
    plans:['Starter — 3,900 L/muaj · deri 100 nxënës','Pro — 6,900 L/muaj · deri 500 nxënës','Business — 12,900 L/muaj · pa limit']},

  dance:        { slug:'dance',        icon:'💃', name:'Studio Vallëzimi',   color:'#be185d', bg:'#fdf2f8', tagline:'Kurse, recitale dhe nxënës — menaxhuar me stil', desc:'Platforma për studio vallëzimi — kurse, nivele, grupe moshash dhe regjistrimi online.', stats:[['200+','Nxënës aktivë'],['95%','Prindër të kënaqur'],['50%','Reduktim thirrjesh']], testimonial:{text:'Prindërit shohin oraret dhe pagesat direkt — nuk thërrasin më çdo herë.',name:'Valentina K.',biz:'Dance Academy, Tiranë'},
    features:[{icon:'💃',t:'Kurse & Nivele',d:'Sipas stilit, nivelit dhe grupmoshës.'},{icon:'📅',t:'Orari i Kurseve',d:'Orare javore. Nxënësit shohin dhe rezervojnë online.'},{icon:'👶',t:'Grupe Moshe',d:'Fëmijë, Adoleshentë, Të Rritur — njëkohësisht.'},{icon:'🎭',t:'Recitalet & Evente',d:'Organizoi recitalet dhe shfaqjet speciale.'},{icon:'💰',t:'Pagesa & Fatura',d:'Mujore ose semestrale. Fatura automatike.'},{icon:'📱',t:'App Prindërish',d:'Shohin oraret, pagesat dhe progresin e fëmijëve.'},{icon:'📊',t:'Raporte Prezence',d:'Prezenca e çdo nxënësi. Njoftime mungese.'},{icon:'🏆',t:'Çertifikata Dixhitale',d:'Lëshoi çertifikata për kurset e përfunduara.'}],
    plans:['Starter — 3,900 L/muaj · deri 100 nxënës','Pro — 6,900 L/muaj · deri 500 nxënës','Business — 12,900 L/muaj · pa limit']},

  fitness:      { slug:'fitness',      icon:'⚡', name:'Functional Fitness', color:'#d97706', bg:'#fffbeb', tagline:'HIIT, CrossFit dhe trajnim personal — i organizuar', desc:'Platforma për studio fitness funksionale — WOD-et ditore, klasat HIIT dhe trajnimi personal.', stats:[['35%','Rritje prezence'],['PRs','Gjurmuar auto'],['2h','Kursyer/ditë']], testimonial:{text:'WOD-et dhe tracking i progresit motivoi shumë atletët tanë. Prezenca u rrit 35%.',name:'Artan B.',biz:'FitZone CrossFit, Tiranë'},
    features:[{icon:'⚡',t:'WOD & Programe',d:'Publiko WOD-et ditore. Atletët regjistrojnë rezultatet.'},{icon:'📅',t:'Klasa HIIT & CrossFit',d:'Kapacitet dhe rezervime online.'},{icon:'👤',t:'Trajnim Personal',d:'Sesione 1-me-1. Paketa dhe progres individual.'},{icon:'📈',t:'Performance Tracking',d:'PRs, kohët dhe ngarkesa për çdo atlet.'},{icon:'💪',t:'Plane Stërvitjeje',d:'Trajneri krijon plane. Atleti ndjek nga app-i.'},{icon:'📷',t:'QR Check-in',d:'Check-in i shpejtë — pa pritje.'},{icon:'💰',t:'Membership & Drop-in',d:'Abonim mujor ose drop-in. Të dy modelet.'},{icon:'📊',t:'Raporte Atletësh',d:'Prezenca, PRs, programet dhe progresi.'}],
    plans:['Starter — 4,900 L/muaj · deri 100 atletë','Pro — 7,900 L/muaj · deri 500 atletë','Business — 14,900 L/muaj · pa limit']},

  barbershop:   { slug:'barbershop',   icon:'💈', name:'Barbershop',         color:'#18181b', bg:'#f4f4f5', tagline:'Rezervime online, staf dhe shërbime — automatik', desc:'Platforma për barbershop — rezervime 24/7, menaxhim stafi, shërbime me çmim dhe njoftime automatike.', stats:[['3h','Kursyer/ditë'],['40%','Rritje klientësh'],['0','No-shows']], testimonial:{text:'Klientët rezervojnë vetë dhe ne fokusohemi te shërbimi. 3 orë kursyer çdo ditë.',name:'Genti N.',biz:'Elite Barber, Shkodër'},
    features:[{icon:'📅',t:'Rezervime 24/7',d:'Klientët rezervojnë kur duan — pa thirrje.'},{icon:'🕐',t:'Oraret e Lira',d:'Sistemi llogarit vetë oraret sipas berberit.'},{icon:'✂️',t:'Shërbime & Çmime',d:'Prerje, mjekër, ngjyrosje — me çmim dhe kohë.'},{icon:'👤',t:'Menaxhim Stafi',d:'Çdo berber ka orarin e tij. Klienti zgjedh.'},{icon:'🔔',t:'Njoftime Automatike',d:'Kujtues para takimit. Pa no-shows.'},{icon:'💰',t:'Pagesa & Raporte',d:'Të ardhurat sipas berberit dhe shërbimit.'},{icon:'⭐',t:'Reviews & Rating',d:'Vlerësimet shfaqen te Explore publik.'},{icon:'🗺️',t:'Harta & Explore',d:'Shfaqesh te harta. Klientë të rinj falas.'}],
    plans:['Starter — 2,900 L/muaj · deri 3 berberë','Pro — 4,900 L/muaj · deri 10 berberë','Business — 8,900 L/muaj · pa limit']},

  salon:        { slug:'salon',        icon:'💅', name:'Sallon Bukurie',     color:'#be185d', bg:'#fdf2f8', tagline:'Takime, ngjyrosje dhe trajtimie — me profesionalizëm', desc:'Platforma për sallon bukurie — rezervime, menaxhim stilistësh dhe shërbime me kohëzgjatje.', stats:[['60%','Rezervime online'],['25%','Rritje klientësh'],['4.9⭐','Rating mesatar']], testimonial:{text:'Klientët rezervojnë vetë — nuk na thërrasin më për oraret.',name:'Elsa M.',biz:'Glam Salon, Tiranë'},
    features:[{icon:'📅',t:'Rezervime Online',d:'Klientët rezervojnë shërbimin dhe stilisten 24/7.'},{icon:'💇',t:'Shërbime të Shumta',d:'Prerje, ngjyrosje, manikyr, pedikyr, makeup.'},{icon:'👤',t:'Stilistët',d:'Çdo stiliste ka profilin dhe shërbimet e saja.'},{icon:'🕐',t:'Kohëzgjatje Auto',d:'Sistemi llogarit oraret bazuar në shërbim.'},{icon:'🔔',t:'Kujtues Automatikë',d:'SMS/email para takimit.'},{icon:'💰',t:'Pagesa & Fatura',d:'Regjistro pagesat. Raporte sipas stilistes.'},{icon:'⭐',t:'Reviews & Rating',d:'Vlerësimet te profili publik.'},{icon:'🗺️',t:'Harta & Explore',d:'Klientë të rinj të gjejnë lehtë.'}],
    plans:['Starter — 2,900 L/muaj · deri 3 stiliste','Pro — 4,900 L/muaj · deri 10 stiliste','Business — 8,900 L/muaj · pa limit']},

  spa:          { slug:'spa',          icon:'💆', name:'Spa & Masazh',       color:'#0891b2', bg:'#ecfeff', tagline:'Trajtimie premium — rezervime profesionale', desc:'Platforma për spa dhe masazh — rezervime, menaxhim terapistësh dhe trajtimie me kohëzgjatje.', stats:[['4.9⭐','Rating mesatar'],['70%','Klientë të kthyer'],['2.5h','Kursyer/ditë']], testimonial:{text:'Klientët e rinj na gjejnë te harta. Rezervimet i bëjnë vetë.',name:'Mirela P.',biz:'Zen Spa, Vlorë'},
    features:[{icon:'💆',t:'Rezervime Online',d:'Klientët rezervojnë trajtimin 24/7.'},{icon:'🛁',t:'Trajtimie & Paketa',d:'Masazh, trajtim fytyre, hammam, aromaterapi.'},{icon:'👤',t:'Terapistët',d:'Profil, specializim dhe disponueshmëri.'},{icon:'🕐',t:'Menaxhim Kohës',d:'Sistemi menaxhon oraret automatikisht.'},{icon:'🔔',t:'Kujtues Automatikë',d:'No-show praktikisht 0.'},{icon:'🎁',t:'Gift Cards',d:'Shes paketa dhe gift cards — ideal për dhurata.'},{icon:'⭐',t:'Reviews & Rating',d:'Reputacioni ndërtohet automatikisht.'},{icon:'📊',t:'Raporte',d:'Të ardhurat sipas terapistit dhe trajtimit.'}],
    plans:['Starter — 3,900 L/muaj · deri 3 terapistë','Pro — 6,900 L/muaj · deri 10 terapistë','Business — 11,900 L/muaj · pa limit']},

  wellness:     { slug:'wellness',     icon:'🌿', name:'Wellness Clinic',    color:'#16a34a', bg:'#f0fdf4', tagline:'Terapi holistike — të organizuara me kujdes', desc:'Platforma për klinika wellness — menaxhim pacientësh, takime dhe histori trajtimesh.', stats:[['100%','Histori dixhitale'],['80%','Reduktim paperwork'],['4.8⭐','Rating pacientësh']], testimonial:{text:'Historiku dixhital na ndihmon të ofrojmë kujdes të personalizuar.',name:'Dr. Anda K.',biz:'Holistic Wellness, Tiranë'},
    features:[{icon:'🌿',t:'Menaxhim Pacientësh',d:'Profil i plotë — historiku, shënime dhe progresi.'},{icon:'📅',t:'Takime Online',d:'Pacientët rezervojnë online.'},{icon:'📋',t:'Histori Trajtimesh',d:'Regjistro çdo seancë me shënime.'},{icon:'🔒',t:'Konfidencialitet',d:'Të dhënat aksesibël vetëm nga stafi i autorizuar.'},{icon:'👤',t:'Specialistët',d:'Çdo specialist menaxhon pacientët e tij.'},{icon:'🔔',t:'Kujtues Automatikë',d:'Reduktim drastik i no-shows.'},{icon:'💰',t:'Pagesa',d:'Cash, transfertë ose sigurime shëndetësore.'},{icon:'📊',t:'Raporte Klinike',d:'Statistikat e trajtimeve dhe të ardhurat mujore.'}],
    plans:['Starter — 4,900 L/muaj · deri 3 specialistë','Pro — 7,900 L/muaj · deri 10 specialistë','Business — 14,900 L/muaj · pa limit']},
}

function useW() {
  const [w,setW]=useState(typeof window!=='undefined'?window.innerWidth:1200)
  useEffect(()=>{const fn=()=>setW(window.innerWidth);window.addEventListener('resize',fn);return()=>window.removeEventListener('resize',fn)},[])
  return {isMobile:w<640,isTablet:w>=640&&w<1024}
}

export default function CategoryPage() {
  const {isMobile,isTablet} = useW()
  const slug = window.location.pathname.replace('/category/','').replace(/\/$/,'')
  const data = CATEGORY_DATA[slug] || CATEGORY_DATA['gym']
  const [faqOpen, setFaqOpen] = useState(null)
  const px = isMobile?16:isTablet?32:64

  const FAQS = [
    {q:`Sa kohë duhet setup i ${data.name}?`,a:'30 minuta. Konfigurojmë bashkë — shërbime, staf dhe orare. Gati menjëherë.'},
    {q:'A mund të shtoj staf të shumtë?',a:'Po! Paketa Pro lejon deri 10 anëtarë stafi, Business pa limit.'},
    {q:'Si funksionojnë rezervimet online?',a:'Klienti zgjedh shërbimin, specialistin dhe orën. Ju merrni njoftim menjëherë.'},
    {q:'A mund ta provoj falas?',a:'Po — 30 ditë falas, pa kartë krediti, pa kontratë. Anuloni kurdo.'},
    {q:'A shfaqem te harta dhe Explore?',a:'Po! Shfaqeni automatikisht te /explore dhe harta interaktive e Vaqo.'},
  ]

  return (
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif',color:'#18181b',lineHeight:1.6,overflowX:'hidden'}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:4px}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.fc:hover{transform:translateY(-2px)!important;box-shadow:0 12px 32px rgba(0,0,0,.08)!important}`}</style>

      {/* Nav */}
      <nav style={{position:'sticky',top:0,zIndex:100,height:56,padding:`0 ${px}px`,display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(255,255,255,.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(0,0,0,.07)'}}>
        <button onClick={()=>window.location.href='/'} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:0}}>
          <div style={{width:30,height:30,borderRadius:8,background:'#18181b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>💪</div>
          <span style={{fontSize:19,fontWeight:900,color:'#18181b',fontFamily:'Georgia,serif'}}>Vaqo</span>
        </button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {!isMobile&&<button onClick={()=>window.location.href='/explore'} style={{background:'none',border:'1px solid #e4e4e7',color:'#18181b',padding:'6px 14px',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>🔍 Explore</button>}
          <button onClick={()=>window.location.href='/demo'} style={{background:'#18181b',color:'#fff',border:'none',padding:'8px 18px',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Book Demo</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{padding:`${isMobile?60:80}px ${px}px ${isMobile?40:56}px`,background:data.bg,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.03) 1px,transparent 1px)',backgroundSize:'48px 48px'}}/>
        <div style={{maxWidth:900,margin:'0 auto',position:'relative',zIndex:1,animation:'fadeUp .6s ease both'}}>
          {/* Breadcrumb */}
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:20,fontSize:12,color:'#71717a'}}>
            <button onClick={()=>window.location.href='/'} style={{background:'none',border:'none',cursor:'pointer',color:'#71717a',fontFamily:'inherit',fontSize:12}}>Kryefaqja</button>
            <span>›</span><span style={{color:'#18181b',fontWeight:500}}>{data.name}</span>
          </div>

          <div style={{display:'inline-flex',alignItems:'center',gap:9,background:'#fff',border:`1px solid ${data.color}20`,borderRadius:100,padding:'5px 16px 5px 5px',marginBottom:20,boxShadow:'0 2px 8px rgba(0,0,0,.06)'}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:data.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>{data.icon}</div>
            <span style={{fontSize:13,fontWeight:700,color:data.color}}>{data.name}</span>
          </div>

          <h1 style={{fontFamily:'Georgia,serif',fontSize:isMobile?'clamp(26px,7vw,36px)':isTablet?40:56,fontWeight:900,lineHeight:1.05,letterSpacing:'-.03em',marginBottom:16,color:'#18181b'}}>
            {data.tagline}
          </h1>
          <p style={{fontSize:isMobile?14:17,color:'#52525b',lineHeight:1.75,maxWidth:620,marginBottom:28}}>{data.desc}</p>

          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:40}}>
            <button onClick={()=>window.location.href='/demo'} style={{background:'#18181b',color:'#fff',border:'none',padding:`${isMobile?11:13}px ${isMobile?20:28}px`,borderRadius:10,fontSize:isMobile?14:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='#333';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#18181b';e.currentTarget.style.transform='translateY(0)'}}>
              Fillo 30 Ditë Falas →
            </button>
            <button onClick={()=>window.location.href='/explore'} style={{background:'transparent',color:'#18181b',border:'1.5px solid rgba(0,0,0,.15)',padding:`${isMobile?11:13}px ${isMobile?16:22}px`,borderRadius:10,fontSize:isMobile?13:14,fontWeight:500,cursor:'pointer',fontFamily:'inherit'}}>
              🔍 Shfleto Bizneset
            </button>
          </div>

          {/* Stats */}
          <div style={{display:'flex',gap:isMobile?24:44,paddingTop:24,borderTop:'1px solid rgba(0,0,0,.08)',flexWrap:'wrap'}}>
            {data.stats.map(([n,l])=>(
              <div key={l}>
                <div style={{fontFamily:'Georgia,serif',fontSize:isMobile?32:42,fontWeight:900,lineHeight:1,color:data.color}}>{n}</div>
                <div style={{fontSize:12,color:'#71717a',marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#fff'}}>
        <div style={{maxWidth:1060,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:data.color,marginBottom:10}}>Funksionet</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?24:isTablet?30:40,fontWeight:900,lineHeight:1.1,marginBottom:10}}>Gjithçka që i duhet {data.name}</h2>
            <p style={{fontSize:14,color:'#71717a',maxWidth:440,margin:'0 auto'}}>I dizajnuar specifikisht — jo zgjidhje gjenerike.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:12}}>
            {data.features.map((f,i)=>(
              <div key={i} className="fc" style={{background:'#fafafa',border:'1px solid #e4e4e7',borderRadius:14,padding:isMobile?16:22,transition:'all .2s'}}>
                <div style={{width:44,height:44,borderRadius:11,background:data.bg,border:`1px solid ${data.color}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,marginBottom:12}}>{f.icon}</div>
                <div style={{fontWeight:700,fontSize:15,marginBottom:6}}>{f.t}</div>
                <div style={{fontSize:13,color:'#52525b',lineHeight:1.7}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section style={{padding:`${isMobile?48:64}px ${px}px`,background:data.color,color:'#fff'}}>
        <div style={{maxWidth:680,margin:'0 auto',textAlign:'center'}}>
          <div style={{fontSize:28,color:'rgba(255,255,255,.25)',marginBottom:16,letterSpacing:4}}>❝</div>
          <p style={{fontFamily:'Georgia,serif',fontSize:isMobile?16:22,lineHeight:1.65,marginBottom:24,fontStyle:'italic',color:'rgba(255,255,255,.9)'}}>
            "{data.testimonial.text}"
          </p>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14}}>
              {data.testimonial.name.split(' ').map(x=>x[0]).join('')}
            </div>
            <div style={{textAlign:'left'}}>
              <div style={{fontWeight:700,fontSize:14}}>{data.testimonial.name}</div>
              <div style={{fontSize:12,color:'rgba(255,255,255,.6)'}}>{data.testimonial.biz}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#f5f5f5'}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:data.color,marginBottom:10}}>Çmimet</div>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?24:isTablet?30:40,fontWeight:900,lineHeight:1.1}}>Transparent. Pa surpriza.</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:14,maxWidth:isMobile?360:'100%',margin:'0 auto'}}>
            {data.plans.map((plan,i)=>{
              const [name,...rest]=plan.split(' — ')
              const featured=i===1
              return (
                <div key={i} style={{borderRadius:16,padding:isMobile?22:26,border:`2px solid ${featured?data.color:'#e4e4e7'}`,background:featured?'#18181b':'#fff',color:featured?'#fff':'#18181b',position:'relative',boxShadow:featured?'0 12px 40px rgba(0,0,0,.12)':'none',transition:'all .2s'}}
                  onMouseEnter={e=>{if(!featured)e.currentTarget.style.borderColor='#18181b'}}
                  onMouseLeave={e=>{if(!featured)e.currentTarget.style.borderColor='#e4e4e7'}}>
                  {featured&&<div style={{position:'absolute',top:-11,left:'50%',transform:'translateX(-50%)',background:data.color,color:'#fff',fontSize:10,fontWeight:700,padding:'3px 12px',borderRadius:100,whiteSpace:'nowrap',textTransform:'uppercase'}}>⭐ Më i Popullar</div>}
                  <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:featured?'rgba(255,255,255,.4)':'#a1a1aa',marginBottom:6}}>{name}</div>
                  <div style={{fontFamily:'Georgia,serif',fontSize:isMobile?28:34,fontWeight:900,lineHeight:1,marginBottom:8}}>{rest[0]?.split(' · ')[0]}</div>
                  <div style={{fontSize:12,color:featured?'rgba(255,255,255,.4)':'#71717a',marginBottom:18}}>{rest[0]?.split(' · ')[1]}</div>
                  <button onClick={()=>window.location.href='/demo'} style={{display:'block',width:'100%',padding:'11px',borderRadius:9,fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'inherit',border:featured?'none':'1.5px solid #e4e4e7',background:featured?'#fff':'transparent',color:'#18181b',transition:'all .15s'}}>
                    {i===2?'Na Kontaktoni':'Fillo Falas →'}
                  </button>
                </div>
              )
            })}
          </div>
          <div style={{textAlign:'center',marginTop:16,fontSize:12,color:'#71717a'}}>✅ 30 ditë falas · 💵 Pa kartë krediti · 🔒 Anulo kurdo</div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#fff'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?24:isTablet?30:38,fontWeight:900}}>Pyetje të Shpeshta</h2>
          </div>
          {FAQS.map((f,i)=>(
            <div key={i} style={{borderBottom:'1px solid #e4e4e7'}}>
              <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{width:'100%',background:'none',border:'none',padding:'16px 0',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',fontFamily:'inherit',textAlign:'left',gap:12}}>
                <span style={{fontSize:isMobile?14:15,fontWeight:600,color:'#18181b'}}>{f.q}</span>
                <span style={{fontSize:20,color:'#a1a1aa',transition:'transform .25s',transform:faqOpen===i?'rotate(45deg)':'none',flexShrink:0}}>+</span>
              </button>
              <div style={{overflow:'hidden',maxHeight:faqOpen===i?160:0,opacity:faqOpen===i?1:0,transition:'max-height .3s ease,opacity .25s ease'}}>
                <p style={{fontSize:13,color:'#52525b',lineHeight:1.8,paddingBottom:16}}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:`${isMobile?48:72}px ${px}px`,background:'#18181b',color:'#fff',textAlign:'center'}}>
        <div style={{maxWidth:520,margin:'0 auto'}}>
          <div style={{fontSize:isMobile?36:44,marginBottom:14}}>{data.icon}</div>
          <h2 style={{fontFamily:'Georgia,serif',fontSize:isMobile?26:isTablet?32:46,fontWeight:900,lineHeight:1.05,marginBottom:14}}>
            Gati të fillosh me {data.name}?
          </h2>
          <p style={{fontSize:isMobile?14:16,color:'rgba(255,255,255,.45)',marginBottom:32,lineHeight:1.75}}>
            30 ditë falas. Pa kartë krediti. Setup 30 min.
          </p>
          <button onClick={()=>window.location.href='/demo'} style={{background:data.color,color:'#fff',border:'none',padding:`${isMobile?12:14}px ${isMobile?28:40}px`,borderRadius:11,fontSize:isMobile?14:16,fontWeight:700,cursor:'pointer',fontFamily:'inherit',display:'inline-block',transition:'opacity .2s'}}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Fillo 30 Ditë Falas →
          </button>
          <div style={{marginTop:14,fontSize:12,color:'rgba(255,255,255,.2)'}}>✅ Falas · 💵 Pa kartë · 🔒 Anulo kurdo</div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#0a0a0a',padding:`20px ${px}px`,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <button onClick={()=>window.location.href='/'} style={{display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',padding:0}}>
          <span style={{fontSize:17,color:'#fff',fontWeight:900,fontFamily:'Georgia,serif'}}>Vaqo</span>
        </button>
        {!isMobile&&<div style={{fontSize:11,color:'rgba(255,255,255,.2)'}}>© 2026 Vaqo · Platforma Wellness #1 në Shqipëri 🇦🇱</div>}
        <div style={{display:'flex',gap:14}}>
          {[['Explore','/explore'],['Apliko','/apply'],['Hyr','/login']].map(([l,h])=>(
            <a key={l} href={h} style={{color:'rgba(255,255,255,.25)',fontSize:12,textDecoration:'none'}}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
