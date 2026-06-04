// src/lib/i18n.js — Translations for Vaqo (Albanian + English)

export const TRANSLATIONS = {
  sq: {
    // NAV
    nav: {
      businesses: 'Bizneset',
      features: 'Funksionet',
      pricing: 'Çmimet',
      nutritionists: 'Dietologë',
      explore: 'Explore',
      login: 'Hyr',
      bookDemo: 'Book Demo',
    },
    // HERO
    hero: {
      badge: 'Platforma #1 e Rezervimeve në Shqipëri',
      title1: 'Menaxho gjithë biznesin',
      title2: 'nga një platformë',
      title3: 'e vetme.',
      desc: 'Rezervime • Pagesa • Klientë • Staf • Raporte — gjithçka automatike, gjithçka në shqip.',
      cta1: 'Book Demo Falas →',
      cta2: '🔍 Shfleto Bizneset',
      stat1: 'Ditë falas',
      stat2: 'Setup',
      stat3: 'Support Shqip',
    },
    // CATEGORIES
    categories: {
      label: 'Kategoritë',
      title: 'Çdo biznes wellness ka zgjidhjen e tij',
      desc: 'Vaqo adaptohet me funksione të dedikuara.',
      learnMore: 'Mëso më shumë →',
      groups: [
        { group: 'Fitness & Wellness', icon: '🏋️', items: [
          { icon:'🏋️', slug:'gym',         name:'Palestre & Gym',     desc:'Menaxhim i plotë anëtarësh dhe pagesa' },
          { icon:'🧘', slug:'yoga',         name:'Yoga Studio',        desc:'Orare klasash dhe rezervime' },
          { icon:'🤸', slug:'pilates',      name:'Pilates',            desc:'Klasa grupore dhe progres' },
          { icon:'🥊', slug:'martial-arts', name:'Arte Marciale',      desc:'Nivele, gradime dhe klasa' },
          { icon:'💃', slug:'dance',        name:'Studio Vallëzimi',   desc:'Kurse dhe menaxhim nxënësish' },
          { icon:'⚡', slug:'fitness',      name:'Functional Fitness', desc:'HIIT, CrossFit dhe trajnim' },
        ]},
        { group: 'Health & Beauty', icon: '💆', items: [
          { icon:'💈', slug:'barbershop', name:'Barbershop',      desc:'Rezervime, staf dhe shërbime' },
          { icon:'💅', slug:'salon',      name:'Sallon Bukurie',  desc:'Takime, ngjyrosje dhe trajtimie' },
          { icon:'💆', slug:'spa',        name:'Spa & Masazh',    desc:'Trajtimie dhe rezervime' },
          { icon:'🌿', slug:'wellness',   name:'Wellness Clinic', desc:'Terapi holistike' },
        ]},
      ],
    },
    // FEATURES
    features: {
      label: 'Funksionet',
      title: 'Gjithçka nën një çati',
      desc: 'Nuk ka nevojë për 5 aplikacione — Vaqo i mbledh të gjitha.',
      tabs: ['📅 Booking', '💼 Run Business', '🚀 Rrit'],
      groups: [
        { category:'Booking & Scheduling', icon:'📅', color:'#2563eb', bg:'#eff6ff', items:[
          { icon:'🖱️', title:'Rezervim Online',    desc:'Klientët rezervojnë 24/7 nga çdo pajisje' },
          { icon:'📆', title:'Orari i Klasave',    desc:'Menaxho orare komplekse me lehtësi' },
          { icon:'⏳', title:'Listë Pritjeje',     desc:'Automatikisht plotëson vendet e lira' },
          { icon:'🔔', title:'Kujtues Automatikë', desc:'SMS dhe email para çdo takimi' },
        ]},
        { category:'Run Your Business', icon:'💼', color:'#7c3aed', bg:'#f5f3ff', items:[
          { icon:'👥', title:'Menaxhim Stafi',     desc:'Role, orare, pagesa dhe leje' },
          { icon:'👤', title:'Menaxhim Klientësh', desc:'Profil i plotë, historiku, borxhet' },
          { icon:'💰', title:'Pagesa & POS',       desc:'Cash, transfertë, fatura automatike' },
          { icon:'📊', title:'Raporte',            desc:'Të ardhura, prezenca, analiza' },
        ]},
        { category:'Rrit Biznesin', icon:'🚀', color:'#16a34a', bg:'#f0fdf4', items:[
          { icon:'⭐', title:'Reviews & Rating',   desc:'Vlerësimet shfaqen te Explore' },
          { icon:'🗺️', title:'Harta Interaktive', desc:'Klientët te gjejnë lehtë' },
          { icon:'🔗', title:'Booking Link',       desc:'Klientët rezervojnë direkt nga interneti' },
          { icon:'📱', title:'App Anëtarësh',     desc:'Abonime, stërvitje, statistika' },
        ]},
      ],
    },
    // HOW IT WORKS
    howItWorks: {
      label: 'Si Funksionon',
      title: 'Gati në 4 hapa',
      steps: [
        { n:'01', ico:'📝', t:'Apliko Online',   d:'5 min formulari, pa pagesë.' },
        { n:'02', ico:'🤝', t:'Book Demo',       d:'30 min me ekipin tonë.' },
        { n:'03', ico:'📥', t:'Importo',         d:'Ngarko klientët ekzistues.' },
        { n:'04', ico:'🚀', t:'Fillo!',          d:'Dashboard gati menjëherë.' },
      ],
      cta: 'Book Demo Falas →',
    },
    // CALC
    calc: {
      label: 'Kalkulatori',
      title: 'Sa kohë kursen çdo muaj?',
      clients: 'Klientë aktivë', bookings: 'Min/klient rezervim', admin: 'Orë admin / ditë',
      unit1:'klientë', unit2:'min', unit3:'orë',
      saved1:'Kohë e kursyer / muaj', saved2:'Vlerë e kursyer',
      unit4:'orë pune', unit5:'L / muaj',
      pro:'Vaqo Pro:', roi:'ROI:',
    },
    // PRICING
    pricing: {
      label: 'Çmimet', title: 'Transparent. Pa surpriza.',
      sub: '30 ditë falas · Pa kontratë · Upgrade kurdo',
      popular: '⭐ Më i Popullar',
      perMonth: '/ muaj',
      cta1:'Fillo 30 Ditë Falas', cta2:'Fillo Pro →', cta3:'Na Kontaktoni',
      note:'💵 Cash ose transfertë · ✅ 30 ditë falas · 🔒 Anulo kurdo',
      plans: [
        { name:'Starter', price:'4,900', limit:'100 klientë', desc:'Për biznese të reja',
          features:['Deri 100 klientë','Dashboard live','QR Check-in','Rezervime online','Fatura automatike','1 staf account'], featured:false },
        { name:'Pro',     price:'7,900', limit:'500 klientë', desc:'Për biznese në rritje',
          features:['Deri 500 klientë','Gjithçka nga Starter','Klasa grupore','Email + SMS automatik','5 staf accounts','Explore + Business Profile'], featured:true },
        { name:'Business',price:'14,900',limit:'Pa limit',    desc:'Për zinxhirë & shumë degë',
          features:['Klientë të pakufizuar','Gjithçka nga Pro','Shumë degë','Staf të pakufizuar','API akses','Manager i dedikuar'], featured:false },
      ],
    },
    // FAQ
    faq: {
      label: 'FAQ', title: 'Pyetje të Shpeshta',
      items: [
        { q:'Sa kohë duhet për setup?',               a:'30 minuta. Konfigurojmë bashkë pa ekspertizë teknike.' },
        { q:'A funksionon për barbershop dhe sallon?', a:'Po! Vaqo funksionon për çdo biznes wellness.' },
        { q:'A mund të menaxhoj shumë degë?',         a:'Po, paketa Business mbështet shumë degë.' },
        { q:'Si funksionon pagesa?',                  a:'Cash ose transfertë bankare. Pa kartë krediti.' },
        { q:'A kanë klientët app mobil?',             a:'Po! Rezervojnë klasa dhe shohin statistikat.' },
      ],
    },
    // CTA
    cta: {
      label: 'Fillo Sot',
      title: 'Gati të modernizosh biznesin tënd?',
      desc: 'Book demo falas dhe shiko si Vaqo ndryshon gjithçka.',
      forBusiness: 'Për Bizneset',
      bizDesc: 'Palestra, barbershop, spa dhe shumë të tjera',
      bookDemo: 'Book Demo →',
      forNutri: 'Për Dietologët',
      nutriDesc: 'Shes dietat tua, merr 70% nga çdo shitje',
      applyNutri: 'Apliko si Dietolog →',
      note: '✅ 30 ditë falas · 💵 Pa kartë krediti · 🔒 Anulo kurdo',
    },
    // FOOTER
    footer: { copy: '© 2026 Vaqo · Platforma Wellness #1 në Shqipëri 🇦🇱' },
    // LANG SWITCH
    lang: { sq:'🇦🇱 Shqip', en:'🇬🇧 English' },
  },

  en: {
    nav: {
      businesses: 'Businesses',
      features: 'Features',
      pricing: 'Pricing',
      nutritionists: 'Nutritionists',
      explore: 'Explore',
      login: 'Log In',
      bookDemo: 'Book Demo',
    },
    hero: {
      badge: '#1 Booking Platform in Albania',
      title1: 'Manage your entire business',
      title2: 'from one platform',
      title3: '— beautifully.',
      desc: 'Gym, barbershop, salon, spa, yoga — manage everything from one dashboard. Online bookings, payments and QR check-in.',
      cta1: 'Book Free Demo →',
      cta2: '🔍 Explore Businesses',
      stat1: 'Active businesses',
      stat2: 'Clients managed',
      stat3: 'Satisfied',
    },
    categories: {
      label: 'Categories',
      title: 'Every wellness business has its solution',
      desc: 'Vaqo adapts with dedicated features.',
      learnMore: 'Learn more →',
      groups: [
        { group: 'Fitness & Wellness', icon: '🏋️', items: [
          { icon:'🏋️', slug:'gym',         name:'Gym & Fitness',       desc:'Full member management & payments' },
          { icon:'🧘', slug:'yoga',         name:'Yoga Studio',         desc:'Class schedules & bookings' },
          { icon:'🤸', slug:'pilates',      name:'Pilates',             desc:'Group classes & individual progress' },
          { icon:'🥊', slug:'martial-arts', name:'Martial Arts',        desc:'Levels, gradings & classes' },
          { icon:'💃', slug:'dance',        name:'Dance Studio',        desc:'Courses & student management' },
          { icon:'⚡', slug:'fitness',      name:'Functional Fitness',  desc:'HIIT, CrossFit & personal training' },
        ]},
        { group: 'Health & Beauty', icon: '💆', items: [
          { icon:'💈', slug:'barbershop', name:'Barbershop',      desc:'Bookings, staff & services' },
          { icon:'💅', slug:'salon',      name:'Beauty Salon',    desc:'Appointments, coloring & treatments' },
          { icon:'💆', slug:'spa',        name:'Spa & Massage',   desc:'Treatments & bookings' },
          { icon:'🌿', slug:'wellness',   name:'Wellness Clinic', desc:'Holistic therapies' },
        ]},
      ],
    },
    features: {
      label: 'Features',
      title: 'Everything under one roof',
      desc: "No need for 5 apps — Vaqo brings them all together.",
      tabs: ['📅 Booking', '💼 Run Business', '🚀 Grow'],
      groups: [
        { category:'Booking & Scheduling', icon:'📅', color:'#2563eb', bg:'#eff6ff', items:[
          { icon:'🖱️', title:'Online Booking',     desc:'Clients book 24/7 from any device' },
          { icon:'📆', title:'Class Schedule',     desc:'Manage complex schedules with ease' },
          { icon:'⏳', title:'Waitlist',           desc:'Automatically fills cancelled spots' },
          { icon:'🔔', title:'Auto Reminders',     desc:'SMS and email before every appointment' },
        ]},
        { category:'Run Your Business', icon:'💼', color:'#7c3aed', bg:'#f5f3ff', items:[
          { icon:'👥', title:'Staff Management',   desc:'Roles, schedules, payments & leave' },
          { icon:'👤', title:'Client Management',  desc:'Full profile, history, outstanding balances' },
          { icon:'💰', title:'Payments & POS',     desc:'Cash, transfer, automatic invoices' },
          { icon:'📊', title:'Reports',            desc:'Revenue, attendance, analytics' },
        ]},
        { category:'Grow Your Business', icon:'🚀', color:'#16a34a', bg:'#f0fdf4', items:[
          { icon:'⭐', title:'Reviews & Rating',   desc:'Ratings appear on public Explore' },
          { icon:'🗺️', title:'Interactive Map',   desc:'Clients find you easily on the map' },
          { icon:'🥗', title:'Nutritionists 70/30',desc:'Sell diet plans, earn 70% commission' },
          { icon:'📱', title:'Member App',         desc:'Subscriptions, workouts, statistics' },
        ]},
      ],
    },
    howItWorks: {
      label: 'How It Works',
      title: 'Ready in 4 steps',
      steps: [
        { n:'01', ico:'📝', t:'Apply Online',  d:'5 min form, no payment.' },
        { n:'02', ico:'🤝', t:'Book Demo',     d:'30 min with our team.' },
        { n:'03', ico:'📥', t:'Import',        d:'Upload existing clients.' },
        { n:'04', ico:'🚀', t:'Go Live!',      d:'Dashboard ready instantly.' },
      ],
      cta: 'Book Free Demo →',
    },
    calc: {
      label: 'Calculator',
      title: 'How much time do you save each month?',
      clients:'Active clients', bookings:'Min/client for manual booking', admin:'Admin hours / day',
      unit1:'clients', unit2:'min', unit3:'hours',
      saved1:'Time saved / month', saved2:'Value saved',
      unit4:'work hours', unit5:'ALL / month',
      pro:'Vaqo Pro:', roi:'ROI:',
    },
    pricing: {
      label: 'Pricing', title: 'Transparent. No surprises.',
      sub: '30 days free · No contract · Upgrade anytime',
      popular: '⭐ Most Popular',
      perMonth: '/ month',
      cta1:'Start 30 Days Free', cta2:'Start Pro →', cta3:'Contact Us',
      note:'💵 Cash or bank transfer · ✅ 30 days free · 🔒 Cancel anytime',
      plans: [
        { name:'Starter', price:'4,900', limit:'100 clients', desc:'Perfect for new businesses',
          features:['Up to 100 clients','Live dashboard','QR Check-in','Online bookings','Auto invoices','1 staff account'], featured:false },
        { name:'Pro',     price:'7,900', limit:'500 clients', desc:'For growing businesses',
          features:['Up to 500 clients','Everything in Starter','Group classes','Auto Email + SMS','5 staff accounts','Explore + Business Profile'], featured:true },
        { name:'Business',price:'14,900',limit:'Unlimited',   desc:'For chains & multi-location',
          features:['Unlimited clients','Everything in Pro','Multiple locations','Unlimited staff','API access','Dedicated manager'], featured:false },
      ],
    },
    faq: {
      label: 'FAQ', title: 'Frequently Asked Questions',
      items: [
        { q:'How long does setup take?',             a:'30 minutes. We configure everything together — no technical expertise needed.' },
        { q:'Does it work for barbershops & salons?',a:'Yes! Vaqo works for any wellness business.' },
        { q:'Can I manage multiple locations?',      a:'Yes, the Business plan supports multiple branches.' },
        { q:'How does payment work?',                a:'Cash or bank transfer. No credit card required.' },
        { q:'Do clients get a mobile app?',          a:'Yes! They can book classes and view statistics from their phone.' },
      ],
    },
    cta: {
      label: 'Get Started Today',
      title: 'Ready to modernize your business?',
      desc: 'Book a free demo and see how Vaqo changes everything.',
      forBusiness: 'For Businesses',
      bizDesc: 'Gym, barbershop, spa and much more',
      bookDemo: 'Book Demo →',
      forNutri: 'For Nutritionists',
      nutriDesc: 'Sell your diet plans, earn 70% commission',
      applyNutri: 'Apply as Nutritionist →',
      note: '✅ 30 days free · 💵 No credit card · 🔒 Cancel anytime',
    },
    footer: { copy: '© 2026 Vaqo · #1 Wellness Platform in Albania 🇦🇱' },
    lang: { sq:'🇦🇱 Shqip', en:'🇬🇧 English' },
  },
}

// Hook for language management
export function useLanguage() {
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('vaqo_lang') : null
  const browserLang = typeof navigator !== 'undefined' && navigator.language?.startsWith('en') ? 'en' : 'sq'
  return stored || browserLang
}

export function setLanguage(lang) {
  if (typeof localStorage !== 'undefined') localStorage.setItem('vaqo_lang', lang)
  window.location.reload()
}

export function t(lang) {
  return TRANSLATIONS[lang] || TRANSLATIONS['sq']
}
