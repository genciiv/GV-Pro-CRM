import { useState } from 'react'

// Data për çdo kategori
const CATEGORY_DATA = {
  gym: {
    slug: 'gym',
    icon: '🏋️',
    name: 'Palestre & Gym',
    tagline: 'Menaxho palestrën me efikasitet maksimal',
    desc: 'Platforma e plotë për menaxhim palestre — anëtarë, pagesa, check-in QR, plane stërvitjeje dhe raporte të detajuara. Gjithçka nën një dashboard.',
    color: '#18181b',
    bg: '#f4f4f5',
    features: [
      { icon:'👥', title:'Menaxhim Anëtarësh', desc:'Profil i plotë për çdo anëtar — abonime, pagesa, historiku, borxhet dhe statistikat.' },
      { icon:'💰', title:'Pagesa & Fatura', desc:'Regjistro pagesa cash ose transfertë. Fatura automatike me numër unik. Gjurmim borxhesh.' },
      { icon:'📷', title:'QR Check-in', desc:'Çdo anëtar ka QR kod personal. Skanim i menjëhershëm me çdo telefon — pa pajisje shtesë.' },
      { icon:'📋', title:'Plane Stërvitjeje', desc:'Trajneri krijon plane personale. Anëtari i sheh dhe regjistron stërvitjet nga app-i mobil.' },
      { icon:'📊', title:'Raporte & Analiza', desc:'Të ardhura mujore, prezenca, planet më të shituara, anëtarë që skadon — gjithçka live.' },
      { icon:'📱', title:'App Anëtarësh', desc:'Anëtarët regjistrohen, shohin abonimin, planet e stërvitjes dhe statistikat nga telefoni.' },
      { icon:'🥗', title:'Dietologë të Integruar', desc:'Anëtarët mund të blejnë plane dietash nga dietologët e platformës direkt nga app-i.' },
      { icon:'❄️', title:'Freeze Abonim', desc:'Ngri abonimin kur anëtari është me pushime — ditët kursehen automatikisht.' },
    ],
    plans: ['Starter — 4,900 L/muaj (deri 100 anëtarë)', 'Pro — 7,900 L/muaj (deri 500 anëtarë)', 'Business — 14,900 L/muaj (pa limit)'],
    testimonial: { text:'Nga 80 anëtarë shkuam në 340 brenda 6 muajve. Dashboard-i më tregon gjithçka — pagesa, prezenca, planet.', name:'Elona K.', biz:'PowerFit Studio, Durrës' },
    stats: [['340+','Anëtarë mesatarisht'],['3h','Kursyer çdo ditë'],['40%','Rritje e anëtarëve']],
  },
  yoga: {
    slug: 'yoga',
    icon: '🧘',
    name: 'Yoga Studio',
    tagline: 'Menaxho klasat, instruktorët dhe rezervimet me lehtësi',
    desc: 'Sistemi i dedikuar për studio yoga — orare klasash grupore, rezervime online, kapacitet automatik dhe listë pritjeje. Instruktorët menaxhojnë klasat e tyre.',
    color: '#7c3aed',
    bg: '#f5f3ff',
    features: [
      { icon:'📅', title:'Orari i Klasave', desc:'Shto klasa individuale ose të përsëritura çdo javë. 4 javë shtohen automatikisht me 1 klik.' },
      { icon:'👥', title:'Rezervime Online', desc:'Klientët rezervojnë nga telefoni pa nevojë për llogari. Konfirmim i menjëhershëm.' },
      { icon:'🔢', title:'Kapacitet Automatik', desc:'Vendos numrin maksimal të vendeve. Kur plotësohet, aktivizohet lista e pritjes automatikisht.' },
      { icon:'🧘', title:'Nivele & Kategori', desc:'Fillestar, Mesatar, Avancuar — organizoi klasat sipas nivelit dhe tipit (Yoga, Pilates, Meditim).' },
      { icon:'👤', title:'Menaxhim Instruktorësh', desc:'Profil i dedikuar për çdo instruktor me specializim, bio dhe oraret e tyre.' },
      { icon:'📊', title:'Statistika Klasash', desc:'Shih prezencën, rezervimet dhe të ardhurat për çdo klasë dhe instruktor.' },
      { icon:'💰', title:'Çmim Fleksibël', desc:'Çmim i ndryshëm për çdo klasë. Pagesa cash kur vijnë ose rezervim me paradhënie.' },
      { icon:'📱', title:'App Klientësh', desc:'Klientët shohin orarin, rezervojnë dhe marrin kujtues automatikë para klasës.' },
    ],
    plans: ['Starter — 3,900 L/muaj (deri 100 klientë)', 'Pro — 6,900 L/muaj (deri 500 klientë)', 'Business — 12,900 L/muaj (pa limit)'],
    testimonial: { text:'Rezervimet online ndryshuan gjithçka. Klasat mbushen vetë dhe ne fokusohemi te praktika.', name:'Mirela P.', biz:'Zen Yoga, Tiranë' },
    stats: [['95%','Kapacitet i mbushur'],['2h','Kursyer në admin/ditë'],['60+','Rezervime/javë']],
  },
  pilates: {
    slug: 'pilates',
    icon: '🤸',
    name: 'Pilates Studio',
    tagline: 'Klasa grupore dhe sesione individuale — të organizuara',
    desc: 'Sistemi i dedikuar për studio pilates — orare klasash, sesione individuale dhe ndjekje e progresit të çdo klienti. I përshtatshëm edhe për studio të vogla.',
    color: '#0891b2',
    bg: '#ecfeff',
    features: [
      { icon:'📅', title:'Klasa Grupore & Individuale', desc:'Menaxho si klasat grupore ashtu edhe sesionet 1-me-1 nga e njëjta platformë.' },
      { icon:'📈', title:'Progres Klientësh', desc:'Ndjek progresin e çdo klienti — ushtrimet, niveli, arritjet dhe objektivat.' },
      { icon:'👥', title:'Rezervime Online', desc:'Klientët rezervojnë klasën ose sesionin e tyre 24/7 nga telefoni.' },
      { icon:'🔢', title:'Kapacitet & Lista Pritjeje', desc:'Kontrollo numrin maksimal të vendeve dhe listën e pritjes automatike.' },
      { icon:'👤', title:'Instruktorët', desc:'Çdo instruktor ka profilin e tij me klasat, oraret dhe disponueshmërinë.' },
      { icon:'💰', title:'Pagesa Fleksibël', desc:'Abonim mujor, paketa klasash ose sesion i vetëm — çdo model funksionon.' },
      { icon:'📊', title:'Raporte Detajuara', desc:'Prezenca, të ardhurat, klasat me sukses dhe klientët më aktivë.' },
      { icon:'📱', title:'App Klientësh', desc:'Shih orarin, rezervo dhe ndjek progresin personal nga telefoni.' },
    ],
    plans: ['Starter — 3,900 L/muaj (deri 100 klientë)', 'Pro — 6,900 L/muaj (deri 500 klientë)', 'Business — 12,900 L/muaj (pa limit)'],
    testimonial: { text:'Menaxhimi i sesioneve individuale dhe klasave grupore nga e njëjta platformë na kurseu shumë kohë.', name:'Arta M.', biz:'Balance Pilates, Tiranë' },
    stats: [['85%','Klientë të kthyer'],['1.5h','Kursyer çdo ditë'],['30+','Sesione/javë']],
  },
  martial_arts: {
    slug: 'martial-arts',
    icon: '🥊',
    name: 'Arte Marciale',
    tagline: 'Menaxho gradime, klasa dhe progres — si duhet',
    desc: 'Platforma e dedikuar për shkolla të arteve marciale — gradime, klasa sipas nivelit, prezenca dhe ndjekja e progresit të çdo nxënësi. Karate, Judo, MMA dhe më shumë.',
    color: '#dc2626',
    bg: '#fef2f2',
    features: [
      { icon:'🥋', title:'Sistemi i Gradimeve', desc:'Ndjek beltat dhe gradimin e çdo nxënësi. Shëno progresin dhe datat e gradimeve.' },
      { icon:'📅', title:'Klasa sipas Nivelit', desc:'Fillestar, Intermediate, Avancuar — klasa të ndara sipas nivelit dhe moshës.' },
      { icon:'👥', title:'Menaxhim Nxënësish', desc:'Profil i plotë — gradimi aktual, prezenca, pagesa dhe progresi individual.' },
      { icon:'📷', title:'QR Check-in', desc:'Nxënësit skanojnë QR kodin kur vijnë — prezenca regjistrohet automatikisht.' },
      { icon:'💰', title:'Pagesa Mujore', desc:'Abonim mujor ose tremujor. Gjurmim borxhesh dhe njoftime automatike.' },
      { icon:'👤', title:'Instruktorët', desc:'Çdo instruktor menaxhon klasat e tija dhe sheh statistikat e nxënësve.' },
      { icon:'🏆', title:'Turneut & Evente', desc:'Regjistro nxënësit për turneut dhe evente speciale brenda platformës.' },
      { icon:'📊', title:'Raporte Prezence', desc:'Shih prezencën ditore, javore dhe mujore. Identifiko nxënësit jo aktivë.' },
    ],
    plans: ['Starter — 3,900 L/muaj (deri 100 nxënës)', 'Pro — 6,900 L/muaj (deri 500 nxënës)', 'Business — 12,900 L/muaj (pa limit)'],
    testimonial: { text:'Sistemi i gradimeve dhe prezenca automatike me QR na ndihmuan shumë. Nxënësit janë të motivuar të shohin progresin e tyre.', name:'Besnik H.', biz:'Dragon MMA, Tiranë' },
    stats: [['120+','Nxënës aktiv'],['100%','Prezencë automatike'],['3x','Kohë e kursyer']],
  },
  dance: {
    slug: 'dance',
    icon: '💃',
    name: 'Studio Vallëzimi',
    tagline: 'Menaxho kurset, recitalet dhe nxënësit me stil',
    desc: 'Platforma e dedikuar për studio vallëzimi — kurse, nivele, grupe moshash, regjistrimi online dhe ndjekja e progresit. Salsa, Bachata, Ballet, Hip-Hop dhe më shumë.',
    color: '#be185d',
    bg: '#fdf2f8',
    features: [
      { icon:'💃', title:'Kurse & Nivele', desc:'Organizo kurset sipas stilit, nivelit dhe grupmoshës. Fillestar deri Avancuar.' },
      { icon:'📅', title:'Orari i Kurseve', desc:'Orare javore të organizuara. Nxënësit shohin dhe rezervojnë online.' },
      { icon:'👶', title:'Grupe Moshe', desc:'Fëmijë, Adoleshentë, Të Rritur — menaxho grupe të ndryshme nga e njëjta platformë.' },
      { icon:'🎭', title:'Recitalet & Evente', desc:'Organizoi recitalin vjetor, evente speciale dhe shfaqjet me menaxhim të plotë.' },
      { icon:'💰', title:'Pagesa Mujore & Semestrale', desc:'Abonim mujor ose me semestër. Fatura automatike për prindërit.' },
      { icon:'📱', title:'App Prindërish', desc:'Prindërit shohin oraret, pagesat dhe progresin e fëmijëve nga telefoni.' },
      { icon:'📊', title:'Raporte Prezence', desc:'Ndjek prezencën e çdo nxënësi. Njoftime automatike për mungesa.' },
      { icon:'🏆', title:'Çertifikata & Diplome', desc:'Lëshoi çertifikata dixhitale për kurset e përfunduara.' },
    ],
    plans: ['Starter — 3,900 L/muaj (deri 100 nxënës)', 'Pro — 6,900 L/muaj (deri 500 nxënës)', 'Business — 12,900 L/muaj (pa limit)'],
    testimonial: { text:'Prindërit janë shumë të kënaqur me app-in. Shohin oraret dhe pagesat direkt — nuk thërrasin më çdo herë.', name:'Valentina K.', biz:'Dance Academy, Tiranë' },
    stats: [['200+','Nxënës aktiv'],['95%','Prindër të kënaqur'],['50%','Reduktim thirrjesh']],
  },
  fitness: {
    slug: 'fitness',
    icon: '⚡',
    name: 'Functional Fitness',
    tagline: 'HIIT, CrossFit dhe trajnim personal — i organizuar',
    desc: 'Platforma e dedikuar për studio fitness funksionale — WOD-et ditore, klasat HIIT, CrossFit dhe sesionet e trajnimit personal. Gjurmimi i performancës dhe progresit.',
    color: '#d97706',
    bg: '#fffbeb',
    features: [
      { icon:'⚡', title:'WOD & Programe', desc:'Publiko WOD-et ditore dhe programet javore. Atletët i shohin dhe regjistrojnë rezultatet.' },
      { icon:'📅', title:'Klasa HIIT & CrossFit', desc:'Orare klasash me kapacitet maksimal dhe rezervime online të thjeshta.' },
      { icon:'👤', title:'Trajnim Personal', desc:'Menaxho sesionet 1-me-1. Paketa sesionesh dhe ndjekja e progresit individual.' },
      { icon:'📈', title:'Performance Tracking', desc:'Gjurmo PRs, kohët dhe ngarkesën për çdo atlet. Grafiku i progresit personal.' },
      { icon:'💪', title:'Plane Stërvitjeje', desc:'Trajneri krijon plane të personalizuara. Atleti i ndjek nga app-i mobil.' },
      { icon:'📷', title:'QR Check-in', desc:'Check-in i shpejtë me QR kod — pa pritje, pa letër.' },
      { icon:'💰', title:'Membership & Drop-in', desc:'Abonim mujor ose drop-in për klasë të vetme. Të dy modelet funksionojnë.' },
      { icon:'📊', title:'Raporte Atletësh', desc:'Statistikat e çdo atleti — prezenca, PRs, programet dhe progresi.' },
    ],
    plans: ['Starter — 4,900 L/muaj (deri 100 atletë)', 'Pro — 7,900 L/muaj (deri 500 atletë)', 'Business — 14,900 L/muaj (pa limit)'],
    testimonial: { text:'WOD-et dhe tracking i progresit nga app-i motivoi shumë atletët tanë. Prezenca u rrit 35%.', name:'Artan B.', biz:'FitZone CrossFit, Tiranë' },
    stats: [['35%','Rritje prezence'],['PRs','Gjurmuar automatik'],['2h','Kursyer/ditë']],
  },
  barbershop: {
    slug: 'barbershop',
    icon: '💈',
    name: 'Barbershop',
    tagline: 'Rezervime online, staf dhe shërbime — gjithçka automatik',
    desc: 'Platforma e dedikuar për barbershop — rezervime online 24/7, menaxhim stafi, shërbime me çmim dhe kohëzgjatje, oraret e lira automatike dhe njoftime para takimit.',
    color: '#18181b',
    bg: '#f4f4f5',
    features: [
      { icon:'📅', title:'Rezervime Online 24/7', desc:'Klientët rezervojnë kur duan — natën, fundjavës, pa thirrje telefonike.' },
      { icon:'🕐', title:'Oraret e Lira Automatike', desc:'Sistemi llogarit vetë oraret e disponueshme sipas berberit dhe shërbimit.' },
      { icon:'✂️', title:'Shërbime & Çmime', desc:'Prerje flokësh, mjekër, ngjyrosje — çdo shërbim me çmim dhe kohëzgjatje.' },
      { icon:'👤', title:'Menaxhim Stafi', desc:'Çdo berber ka orarin e tij. Klienti zgjedh berberin e preferuar.' },
      { icon:'🔔', title:'Njoftime Automatike', desc:'Kujtues SMS/email para takimit. Pa no-shows, pa humbje kohë.' },
      { icon:'💰', title:'Pagesa & Raporte', desc:'Regjistro pagesat dhe shih të ardhurat sipas berberit dhe shërbimit.' },
      { icon:'⭐', title:'Reviews & Rating', desc:'Klientët lënë vlerësime. Shfaqen te Explore publik — tërheq klientë të rinj.' },
      { icon:'🗺️', title:'Harta & Explore', desc:'Biznesi shfaqet te harta e Vaqo. Klientët të gjejnë lehtë nga zona.' },
    ],
    plans: ['Starter — 2,900 L/muaj (deri 3 berberë)', 'Pro — 4,900 L/muaj (deri 10 berberë)', 'Business — 8,900 L/muaj (pa limit)'],
    testimonial: { text:'Rezervimet online ndryshuan gjithçka. Klientët rezervojnë vetë dhe ne fokusohemi te shërbimi. 3 orë kursyer çdo ditë.', name:'Genti N.', biz:'Elite Barber, Shkodër' },
    stats: [['3h','Kursyer çdo ditë'],['40%','Rritje klientësh'],['0','No-shows pas njoftimeve']],
  },
  salon: {
    slug: 'salon',
    icon: '💅',
    name: 'Sallon Bukurie',
    tagline: 'Takime, ngjyrosje dhe trajtimie — menaxhuar me profesionalizëm',
    desc: 'Platforma e dedikuar për sallon bukurie — rezervime online, menaxhim stilistësh, shërbime me kohëzgjatje dhe njoftime automatike. Prerje, ngjyrosje, manikyr dhe shumë më tepër.',
    color: '#be185d',
    bg: '#fdf2f8',
    features: [
      { icon:'📅', title:'Rezervime Online', desc:'Klientët rezervojnë shërbimin dhe stilisten e tyre 24/7 nga telefoni.' },
      { icon:'💇', title:'Shërbime të Shumta', desc:'Prerje, ngjyrosje, highlights, manikyr, pedikyr, makeup — çdo shërbim i konfiguruar.' },
      { icon:'👤', title:'Stilistët', desc:'Çdo stiliste ka profilin, orarin dhe shërbimet e saja. Klienti zgjedh stilisten.' },
      { icon:'🕐', title:'Kohëzgjatje Automatike', desc:'Sistemi llogarit oraret bazuar në kohëzgjatjen e çdo shërbimi.' },
      { icon:'🔔', title:'Kujtues Automatikë', desc:'SMS/email para takimit. Klientët nuk harrojnë dhe nuk vonojnë.' },
      { icon:'💰', title:'Pagesa & Fatura', desc:'Regjistro pagesat cash. Fatura automatike. Raporte sipas stilistes.' },
      { icon:'⭐', title:'Reviews & Rating', desc:'Vlerësimet e klientëve shfaqen te profili publik i sallonit.' },
      { icon:'🗺️', title:'Harta & Explore', desc:'Shfaqesh te harta e Vaqo. Klientë të rinj të gjejnë lehtë.' },
    ],
    plans: ['Starter — 2,900 L/muaj (deri 3 stiliste)', 'Pro — 4,900 L/muaj (deri 10 stiliste)', 'Business — 8,900 L/muaj (pa limit)'],
    testimonial: { text:'Klientët tanë janë shumë të kënaqur me rezervimet online. Nuk na thërrasin më për oraret — rezervojnë vetë.', name:'Elsa M.', biz:'Glam Salon, Tiranë' },
    stats: [['60%','Rezervime online'],['25%','Rritje klientësh'],['4.9⭐','Rating mesatar']],
  },
  spa: {
    slug: 'spa',
    icon: '💆',
    name: 'Spa & Masazh',
    tagline: 'Trajtimie premium — rezervime të thjeshta dhe profesionale',
    desc: 'Platforma e dedikuar për spa dhe klinika masazhi — rezervime online, menaxhim terapistësh, trajtimie me kohëzgjatje dhe paketa shërbimesh. Relaksim i garantuar.',
    color: '#0891b2',
    bg: '#ecfeff',
    features: [
      { icon:'💆', title:'Rezervime Online', desc:'Klientët rezervojnë trajtimin dhe terapisten e tyre 24/7 nga telefoni.' },
      { icon:'🛁', title:'Trajtimie & Paketa', desc:'Masazh, trajtim fytyre, hammam, aromaterapi — çdo trajtim me çmim dhe kohëzgjatje.' },
      { icon:'👤', title:'Terapistët', desc:'Çdo terapist ka profilin, specializimin dhe disponueshmërinë e tij.' },
      { icon:'🕐', title:'Menaxhim Kohës', desc:'Sistemi menaxhon oraret automatikisht — pa mbivendosje, pa konfuzion.' },
      { icon:'🔔', title:'Kujtues Automatikë', desc:'Klientët marrin kujtues para trajtimit. No-show praktikisht 0.' },
      { icon:'🎁', title:'Gift Cards & Paketa', desc:'Shes paketa trajtimesh dhe gift cards — ideal për dhurata.' },
      { icon:'⭐', title:'Reviews & Rating', desc:'Vlerësimet shfaqen te profili publik. Reputacioni ndërtohet vetë.' },
      { icon:'📊', title:'Raporte Detajuara', desc:'Të ardhurat sipas terapistit, trajtimit dhe periudhës. Analiza e plotë.' },
    ],
    plans: ['Starter — 3,900 L/muaj (deri 3 terapistë)', 'Pro — 6,900 L/muaj (deri 10 terapistë)', 'Business — 11,900 L/muaj (pa limit)'],
    testimonial: { text:'Klientët e rinj na gjejnë te harta e Vaqo. Rezervimet online i bëjnë vetë — ne fokusohemi te trajtimi.', name:'Mirela P.', biz:'Zen Spa, Vlorë' },
    stats: [['4.9⭐','Rating mesatar'],['70%','Klientë të kthyer'],['2.5h','Kursyer çdo ditë']],
  },
  wellness: {
    slug: 'wellness',
    icon: '🌿',
    name: 'Wellness Clinic',
    tagline: 'Terapi holistike dhe trajtimie — të organizuara me kujdes',
    desc: 'Platforma e dedikuar për klinika wellness dhe terapi holistike — menaxhim pacientësh, takime, histori trajtimesh dhe ndjekja e progresit. Profesional dhe konfidencial.',
    color: '#16a34a',
    bg: '#f0fdf4',
    features: [
      { icon:'🌿', title:'Menaxhim Pacientësh', desc:'Profil i plotë për çdo pacient — historiku i trajtimeve, shënime dhe progresi.' },
      { icon:'📅', title:'Takime Online', desc:'Pacientët rezervojnë takimin online. Konfirmim i menjëhershëm.' },
      { icon:'📋', title:'Histori Trajtimesh', desc:'Regjistro çdo seancë me shënime, diagnoza dhe plane trajtimi.' },
      { icon:'🔒', title:'Konfidencialitet', desc:'Të dhënat e pacientëve janë të sigurta dhe aksesibël vetëm nga stafi i autorizuar.' },
      { icon:'👤', title:'Terapistët & Specialistët', desc:'Çdo specialist menaxhon pacientët dhe oraret e tij individualisht.' },
      { icon:'🔔', title:'Kujtues Automatikë', desc:'Pacientët marrin kujtues para takimit. Reduktim drastik i no-shows.' },
      { icon:'💰', title:'Pagesa & Sigurime', desc:'Regjistro pagesat cash, transfertë ose sigurime shëndetësore.' },
      { icon:'📊', title:'Raporte Klinike', desc:'Statistikat e trajtimeve, pacientëve aktivë dhe të ardhurat mujore.' },
    ],
    plans: ['Starter — 4,900 L/muaj (deri 3 specialistë)', 'Pro — 7,900 L/muaj (deri 10 specialistë)', 'Business — 14,900 L/muaj (pa limit)'],
    testimonial: { text:'Historiku dixhital i çdo pacienti na ndihmon të ofrojmë kujdes më të personalizuar. Pacientët e vlerësojnë.', name:'Dr. Anda K.', biz:'Holistic Wellness, Tiranë' },
    stats: [['100%','Histori dixhitale'],['80%','Reduktim paperwork'],['4.8⭐','Rating pacientësh']],
  },
}

export default function CategoryPage() {
  const slug = window.location.pathname.replace('/category/','').replace('/','')
  const data = CATEGORY_DATA[slug] || CATEGORY_DATA['gym']
  const [faqOpen, setFaqOpen] = useState(null)

  const FAQS = [
    { q:`Sa kohë duhet për setup i ${data.name}?`, a:'30 minuta. Konfigurojmë bashkë — shërbime, staf, orare dhe pagesa. Gati menjëherë.' },
    { q:'A mund të shtoj staf të shumtë?', a:'Po! Paketa Pro lejon deri 10 anëtarë stafi, Business pa limit. Çdo anëtar ka rolin dhe akseset e tij.' },
    { q:'Si funksionojnë rezervimet online?', a:'Klienti hap faqen tuaj te Vaqo, zgjedh shërbimin, specialistin dhe orën. Ju merrni njoftim menjëherë.' },
    { q:'A mund ta provoj falas?', a:'Po — 30 ditë falas, pa kartë krediti, pa kontratë. Anuloni kurdo.' },
    { q:'A shfaqem te harta dhe Explore?', a:'Po! Biznesi juaj shfaqet automatikisht te /explore dhe harta interaktive e Vaqo. Klientë të rinj ju gjejnë falas.' },
  ]

  return (
    <div style={{ fontFamily:"system-ui,-apple-system,sans-serif", color:'#18181b', lineHeight:1.6, overflowX:'hidden' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#d4d4d8;border-radius:4px}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .feat-card:hover{transform:translateY(-3px)!important;box-shadow:0 16px 40px rgba(0,0,0,.08)!important}
        @media(max-width:768px){
          .g2{grid-template-columns:1fr!important}
          .g3{grid-template-columns:1fr 1fr!important}
          .hero-t{font-size:36px!important}
          .sp{padding:64px 20px!important}
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position:'sticky', top:0, zIndex:100, height:58, padding:'0 32px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,.97)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(0,0,0,.07)' }}>
        <button onClick={()=>window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:'#18181b', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>💪</div>
          <span style={{ fontSize:20, fontWeight:900, color:'#18181b', fontFamily:'Georgia,serif' }}>Vaqo</span>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>window.location.href='/explore'} style={{ background:'none', border:'1px solid #e4e4e7', color:'#18181b', padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>🔍 Explore</button>
          <button onClick={()=>window.location.href='/login'} style={{ background:'none', border:'1px solid #e4e4e7', color:'#18181b', padding:'7px 16px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>Hyr</button>
          <button onClick={()=>window.location.href='/apply'} style={{ background:'#18181b', color:'#fff', border:'none', padding:'8px 20px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Fillo Falas →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding:'80px 64px 64px', background:data.bg, position:'relative', overflow:'hidden' }} className="sp">
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.03) 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>
        <div style={{ maxWidth:900, margin:'0 auto', position:'relative', zIndex:1, animation:'fadeUp .7s ease both' }}>
          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24, fontSize:13, color:'#71717a' }}>
            <button onClick={()=>window.location.href='/'} style={{ background:'none', border:'none', cursor:'pointer', color:'#71717a', fontFamily:'inherit', fontSize:13 }}>Kryefaqja</button>
            <span>›</span>
            <span style={{ color:'#18181b', fontWeight:500 }}>{data.name}</span>
          </div>

          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#fff', border:`1px solid ${data.color}20`, borderRadius:100, padding:'6px 16px 6px 6px', marginBottom:24, boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:data.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17 }}>{data.icon}</div>
            <span style={{ fontSize:13, fontWeight:700, color:data.color }}>{data.name}</span>
          </div>

          <h1 className="hero-t" style={{ fontFamily:'Georgia,serif', fontSize:'clamp(32px,5vw,60px)', fontWeight:900, lineHeight:1.05, letterSpacing:'-.03em', marginBottom:20, color:'#18181b' }}>
            {data.tagline}
          </h1>

          <p style={{ fontSize:18, color:'#52525b', lineHeight:1.75, maxWidth:660, marginBottom:36 }}>{data.desc}</p>

          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <button onClick={()=>window.location.href='/apply'} style={{ background:'#18181b', color:'#fff', border:'none', padding:'13px 28px', borderRadius:10, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#333';e.currentTarget.style.transform='translateY(-2px)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#18181b';e.currentTarget.style.transform='translateY(0)'}}>
              Fillo 30 Ditë Falas →
            </button>
            <button onClick={()=>window.location.href='/explore'} style={{ background:'transparent', color:'#18181b', border:'1.5px solid rgba(0,0,0,.15)', padding:'13px 22px', borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
              🔍 Shfleto Bizneset
            </button>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', gap:40, marginTop:48, paddingTop:32, borderTop:'1px solid rgba(0,0,0,.08)', flexWrap:'wrap' }}>
            {data.stats.map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily:'Georgia,serif', fontSize:40, fontWeight:900, lineHeight:1, color:data.color }}>{n}</div>
                <div style={{ fontSize:13, color:'#71717a', marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:'80px 64px', background:'#fff' }} className="sp">
        <div style={{ maxWidth:1060, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:data.color, marginBottom:12 }}>Funksionet</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(26px,3.5vw,42px)', fontWeight:900, lineHeight:1.1, marginBottom:12 }}>
              Gjithçka që i duhet {data.name}
            </h2>
            <p style={{ fontSize:16, color:'#71717a', maxWidth:500, margin:'0 auto' }}>
              I dizajnuar specifikisht për {data.name.toLowerCase()} — jo zgjidhje gjenerike.
            </p>
          </div>

          <div className="g2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {data.features.map((f,i) => (
              <div key={i} className="feat-card" style={{ background:'#fafafa', border:'1px solid #e4e4e7', borderRadius:14, padding:24, transition:'all .2s', cursor:'default' }}>
                <div style={{ width:46, height:46, borderRadius:11, background:data.bg, border:`1px solid ${data.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:14 }}>{f.icon}</div>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:7, color:'#18181b' }}>{f.title}</div>
                <div style={{ fontSize:13, color:'#52525b', lineHeight:1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section style={{ padding:'64px', background:data.color, color:'#fff' }} className="sp">
        <div style={{ maxWidth:700, margin:'0 auto', textAlign:'center' }}>
          <div style={{ fontSize:32, color:'rgba(255,255,255,.3)', marginBottom:20, letterSpacing:4 }}>❝</div>
          <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(18px,2.5vw,24px)', lineHeight:1.6, marginBottom:28, fontStyle:'italic', color:'rgba(255,255,255,.9)' }}>
            {data.testimonial.text}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14 }}>
            <div style={{ width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:16 }}>
              {data.testimonial.name.split(' ').map(x=>x[0]).join('')}
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{data.testimonial.name}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,.6)' }}>{data.testimonial.biz}</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding:'80px 64px', background:'#f5f5f5' }} className="sp">
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:data.color, marginBottom:12 }}>Çmimet</div>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(24px,3.5vw,40px)', fontWeight:900, lineHeight:1.1 }}>Transparent. Pa surpriza.</h2>
          </div>
          <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {data.plans.map((plan,i) => {
              const [name, rest] = plan.split(' — ')
              const [price, limit] = rest.split(' (')
              const featured = i === 1
              return (
                <div key={i} style={{ borderRadius:16, padding:28, border:`2px solid ${featured?data.color:'#e4e4e7'}`, background:featured?'#18181b':'#fff', color:featured?'#fff':'#18181b', position:'relative', boxShadow:featured?'0 16px 48px rgba(0,0,0,.12)':'none' }}>
                  {featured && <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', background:data.color, color:'#fff', fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:100, whiteSpace:'nowrap', textTransform:'uppercase' }}>⭐ Më i Popullar</div>}
                  <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', color:featured?'rgba(255,255,255,.4)':'#a1a1aa', marginBottom:8 }}>{name}</div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:36, fontWeight:900, lineHeight:1, marginBottom:6 }}>{price}</div>
                  <div style={{ fontSize:12, color:featured?'rgba(255,255,255,.4)':'#71717a', marginBottom:20 }}>{limit?.replace(')','')}</div>
                  <button onClick={()=>window.location.href='/apply'} style={{ display:'block', width:'100%', padding:'11px', borderRadius:9, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit', border:featured?'none':'1.5px solid #e4e4e7', background:featured?'#fff':'transparent', color:'#18181b' }}>
                    {i===2?'Na Kontaktoni':'Fillo Falas →'}
                  </button>
                </div>
              )
            })}
          </div>
          <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#71717a' }}>
            ✅ 30 ditë falas · 💵 Pa kartë krediti · 🔒 Anulo kurdo
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding:'80px 64px', background:'#fff' }} className="sp">
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(24px,3.5vw,40px)', fontWeight:900, lineHeight:1.1 }}>Pyetje të Shpeshta</h2>
          </div>
          {FAQS.map((f,i) => (
            <div key={i} style={{ borderBottom:'1px solid #e4e4e7' }}>
              <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%', background:'none', border:'none', padding:'18px 0', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', fontFamily:'inherit', textAlign:'left', gap:14 }}>
                <span style={{ fontSize:15, fontWeight:600, color:'#18181b' }}>{f.q}</span>
                <span style={{ fontSize:20, color:'#a1a1aa', transition:'transform .25s', transform:faqOpen===i?'rotate(45deg)':'none', flexShrink:0 }}>+</span>
              </button>
              <div style={{ overflow:'hidden', maxHeight:faqOpen===i?160:0, opacity:faqOpen===i?1:0, transition:'max-height .3s ease,opacity .25s ease' }}>
                <p style={{ fontSize:14, color:'#52525b', lineHeight:1.8, paddingBottom:18 }}>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 64px', background:'#18181b', color:'#fff', textAlign:'center' }} className="sp">
        <div style={{ maxWidth:560, margin:'0 auto' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>{data.icon}</div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(28px,4vw,48px)', fontWeight:900, lineHeight:1.05, marginBottom:16 }}>
            Gati të fillosh me {data.name}?
          </h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,.45)', marginBottom:36, lineHeight:1.75 }}>
            30 ditë falas. Pa kartë krediti. Setup 30 minuta.
          </p>
          <button onClick={()=>window.location.href='/apply'} style={{ background:data.color, color:'#fff', border:'none', padding:'14px 40px', borderRadius:11, fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .2s', display:'inline-block' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.9'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            Fillo 30 Ditë Falas →
          </button>
          <div style={{ marginTop:16, fontSize:12, color:'rgba(255,255,255,.2)' }}>
            ✅ 30 ditë falas · 💵 Pa kartë krediti · 🔒 Anulo kurdo
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background:'#0a0a0a', padding:'24px 64px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <button onClick={()=>window.location.href='/'} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', padding:0 }}>
          <span style={{ fontSize:18, color:'#fff', fontWeight:900, fontFamily:'Georgia,serif' }}>Vaqo</span>
        </button>
        <div style={{ fontSize:11, color:'rgba(255,255,255,.2)' }}>© 2026 Vaqo · Platforma Wellness #1 në Shqipëri 🇦🇱</div>
        <div style={{ display:'flex', gap:16 }}>
          {[['Explore','/explore'],['Apliko','/apply'],['Hyr','/login']].map(([l,h]) => (
            <a key={l} href={h} style={{ color:'rgba(255,255,255,.25)', fontSize:12, textDecoration:'none' }}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  )
}
