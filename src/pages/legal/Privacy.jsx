import { LegalPage } from './LegalPage'

const SECTIONS = [
  {
    icon: '👤',
    title: 'Kush Jemi dhe Çfarë Bëjmë',
    content: `Vaqo SH.P.K. ("Vaqo", "ne") është kontrollues i të dhënave personale të mbledhura nëpërmjet platformës sonë.

**Kontakti i mbrojtjes së të dhënave:**
- Email: privacy@vaqo.al
- Adresa: Tiranë, Shqipëri
- Telefon: disponibël me kërkesë

Vaqo ofron softuer menaxhimi për bizneset wellness — palestra, barbershop, sallon, spa, yoga dhe të tjera. Gjatë ofrimit të këtij shërbimi, mbledhim dhe procesojmë të dhëna personale si të bizneseve partnere ashtu edhe të klientëve të tyre fundorë.

Ky dokument shpjegon: çfarë të dhënash mbledhim, pse, si i mbrojmë dhe cilat janë të drejtat tuaja.`,
  },
  {
    icon: '📊',
    title: 'Çfarë të Dhënash Mbledhim',
    content: `**Të dhëna që jepni drejtpërdrejt — Bizneset:**
- Emri i biznesit dhe pronari
- Emaili dhe numri i telefonit
- Adresa dhe qyteti
- Lloji i biznesit
- Informacioni i pagesës (nuk ruajmë kartë krediti)

**Të dhëna të klientëve të biznesit (Anëtarët):**
- Emri i plotë dhe emaili
- Numri i telefonit (opsional)
- Historiku i abonimeve dhe pagesave
- Historiku i hyrjeve (QR check-in)
- Plane stërvitjeje dhe informacion shëndetësor (vetëm nëse biznesi e shton)

**Të dhëna teknike të gjeneruara automatikisht:**
- Adresa IP dhe lloji i shfletuesit
- Koha dhe data e aksesit
- Faqet e vizituara brenda platformës
- Gabimet teknike (për qëllime debugging)

**Të dhëna që NUK mbledhim:**
- Numra kartash krediti (pagesat bëhen cash/transfertë)
- Biometri
- Informacion financiar personal të anëtarëve`,
  },
  {
    icon: '🎯',
    title: 'Pse i Mbledhim — Bazat Ligjore',
    content: `Procesojmë të dhënat tuaja bazuar në:

**1. Ekzekutimi i kontratës (Art. 6(1)(b) GDPR):**
- Menaxhimi i llogarisë suaj
- Ofrimi i funksioneve të platformës
- Faturimi dhe pagesa
- Support teknik

**2. Interesi legjitim (Art. 6(1)(f) GDPR):**
- Siguria e platformës dhe parandalimi i abuzimit
- Analiza dhe përmirësimi i shërbimit
- Komunikimi me bizneset partnere

**3. Pajtimi (Art. 6(1)(a) GDPR):**
- Email marketing (vetëm me pajtim eksplicit)
- Cookies jo-thelbësore
- Njoftimet promovuese

**4. Detyrimi ligjor (Art. 6(1)(c) GDPR):**
- Mbajtja e të dhënave financiare sipas ligjit tatimor shqiptar
- Përgjigja ndaj kërkesave të autoriteteve`,
  },
  {
    icon: '🔄',
    title: 'Si i Përdorim të Dhënat',
    content: `**Ofrimi i shërbimit:**
- Krijimi dhe menaxhimi i llogarive
- Funksionimit të sistemit të rezervimeve
- Dërgimi i emaileve automatike (konfirmime, kujtues)
- Gjenerimi i raporteve për biznesin tuaj

**Komunikimi:**
- Njoftime teknike rreth platformës
- Ndryshime në kushte ose politika
- Emaile marketing (vetëm me pajtim tuajin)
- Përgjigje ndaj pyetjeve dhe support

**Sigurisë:**
- Monitorimi për aktivitet të dyshimtë
- Parandalimi i aksesit të paautorizuar
- Backup automatik i të dhënave

**Rritja e shërbimit:**
- Analiza e modeleve të përdorimit (anonime)
- Testimi i funksioneve të reja
- Përmirësimi i ndërfaqes

**KURRË nuk bëjmë:**
- Shitje të dhënash te palë të treta
- Profilezim për reklama
- Ndarje me kompani reklamuese`,
  },
  {
    icon: '🤝',
    title: 'Ndarje me Palë të Treta',
    content: `Vaqo nuk shet dhe nuk jep me qira të dhënat tuaja. Ndajmë të dhëna vetëm në rastet e mëposhtme:

**Ofruesit e shërbimeve teknike (sub-procesuesit):**
- Supabase (hosting i bazës së të dhënave) — GDPR compliant, serverë në BE
- Resend.com (dërgimi i emaileve) — GDPR compliant
- Vercel (hosting i aplikacionit) — GDPR compliant

Të gjithë sub-procesuesit kanë nënshkruar Data Processing Agreements dhe janë të detyruar të mbrojnë të dhënat tuaja.

**Rastet ligjore:**
Mund të ndajmë të dhëna me autoritetet shqiptare nëse kemi detyrimin ligjor (urdhër gjykate, kërkim penal, etj.). Do t'ju njoftojmë paraprakisht nëse e lejojnë rrethanat.

**Transferta biznesi:**
Nëse Vaqo shitet ose bashkohet me kompani tjetër, të dhënat kalojnë te entiteti i ri nën të njëjtat kushte mbrojtjeje.`,
  },
  {
    icon: '🛡️',
    title: 'Si i Mbrojmë të Dhënat',
    content: `**Masat teknike:**
- Enkriptim TLS/SSL për të gjitha komunikimet
- Enkriptim i të dhënave sensititve në bazën e të dhënave
- Autentifikim me dy faktorë i disponueshëm
- Akses i kufizuar bazuar në role (row-level security)
- Backup automatik çdo 24 orë

**Masat organizative:**
- Akses vetëm nga stafi i autorizuar
- Trajnim i rregullt i stafit për sigurinë
- Rishikim periodik i akseseve
- Procedura të qarta për incident response

**Serverët:**
Të dhënat ruhen në serverë të Supabase brenda Bashkimit Europian (Irlandë/Gjermani), duke garantuar mbrojtje sipas standardeve GDPR.

**Periudha e ruajtjes:**
- Të dhënat e llogarisë aktive: ruhen gjatë gjithë periudhës së abonimit
- Pas anulimit: 30 ditë, pastaj fshihen
- Të dhënat financiare: 7 vjet (detyrim ligjor tatimor)
- Logjet teknike: 90 ditë`,
  },
  {
    icon: '✊',
    title: 'Të Drejtat Tuaja',
    content: `Sipas ligjit shqiptar dhe Rregullores GDPR, keni të drejtat e mëposhtme:

**E drejta e aksesit:**
Mund të kërkoni një kopje të të gjitha të dhënave personale që Vaqo mban për ju.

**E drejta e korrigjimit:**
Nëse të dhënat tuaja janë të pasakta, mund të kërkoni korrigjimin e tyre menjëherë.

**E drejta e fshirjes ("e drejta e harresës"):**
Mund të kërkoni fshirjen e të dhënave tuaja, me përjashtim të rasteve kur kemi detyrim ligjor t'i mbajmë.

**E drejta e kufizimit:**
Mund të kërkoni kufizimin e procesimit të të dhënave tuaja gjatë periudhës së shqyrtimit të ankesës.

**E drejta e portabilitetit:**
Mund të merrni të dhënat tuaja në format të strukturuar (JSON/CSV) për t'i transferuar gjetiu.

**E drejta e kundërshtimit:**
Mund të kundërshtoni procesimin bazuar në interesin legjitim, duke përfshirë marketingun direkt.

**Si të ushtroni të drejtat:**
Dërgoni email te privacy@vaqo.al me temë "Kërkesë GDPR". Përgjigjem brenda 30 ditëve falas. Identifikimi juaj verifikohet para ekzekutimit të kërkesës.`,
  },
  {
    icon: '🍪',
    title: 'Cookies dhe Teknologji Gjurmuese',
    content: `**Cookies thelbësore (të detyrueshme):**
- Sesioni i autentifikimit — nevojitet për të qëndruar i kyçur
- Preferencat e gjuhës dhe temës
- Token CSRF për sigurinë

Këto cookies nuk kërkojnë pajtimin tuaj pasi janë thelbësore për funksionimin e platformës.

**Cookies analitike (me pajtim):**
Vaqo mund të përdorë analitikë anonime (pa ID personale) për të kuptuar si përdoret platforma. Këto aktivizohen vetëm me pajtimin tuaj eksplicit.

**Cookies të marketingut:**
Vaqo NUK përdor cookies reklamuese ose tracking të palëve të treta. Platforma jonë është krejtësisht pa reklama.

**Menaxhimi i cookies:**
Mund të kontrolloni cookies nëpërmjet cilësimeve të shfletuesit tuaj. Fshirja e cookies thelbësore mund të ndikojë funksionalitetin e platformës.`,
  },
]

export default function Privacy() {
  return (
    <LegalPage
      title="Politika e Privatësisë"
      subtitle="Vaqo respekton privatësinë tuaj. Ky dokument shpjegon saktësisht çfarë të dhënash mbledhim, pse i mbledhim, si i mbrojmë dhe cilat janë të drejtat tuaja si subjekt i të dhënave."
      lastUpdated="1 Janar 2026"
      badge="🔒 Politika e Privatësisë"
      badgeColor="#7c3aed"
      sections={SECTIONS}
    />
  )
}
