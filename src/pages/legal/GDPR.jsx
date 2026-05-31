import { LegalPage } from './LegalPage'

const SECTIONS = [
  {
    icon: '🇪🇺',
    title: 'Vaqo dhe GDPR',
    content: `Vaqo është i angazhuar të respektojë Rregulloren e Përgjithshme të Mbrojtjes së të Dhënave (GDPR — Regulation EU 2016/679) dhe ligjin shqiptar nr. 9887/2008 "Për mbrojtjen e të dhënave personale" dhe ndryshimeve të tij.

**Roli ynë i dyfishtë:**
Vaqo vepron si:

- **Kontrollues i pavarur** — për të dhënat e bizneseve që regjistrohen te Vaqo (emrat, emailet, informacioni i faturimit)
- **Procesues** — për të dhënat e klientëve fundorë që bizneset tuaja menaxhojnë nëpërmjet platformës sonë

Kjo dallim është i rëndësishëm: si biznes që përdor Vaqo, JU jeni kontrollues i të dhënave të klientëve tuaj. Vaqo i procesimi vetëm sipas udhëzimeve tuaja.

**Zbatimi gjeografik:**
Edhe pse Shqipëria nuk është anëtare e BE-së, Vaqo zbaton standardet GDPR si standard ari i mbrojtjes së privatësisë, pasi:
• Shumë klientë tanë operojnë në tregun europian
• Standardet GDPR janë standardet ndërkombëtare të pranuara
• Ligji shqiptar i mbrojtjes së të dhënave është harmonizuar me GDPR`,
  },
  {
    icon: '📋',
    title: 'Marrëveshja e Procesimit të të Dhënave (DPA)',
    content: `Bizneset që përdorin Vaqo automatikisht hyjnë në një Marrëveshje Procesimi të të Dhënave (Data Processing Agreement — DPA) me ne.

**Çfarë mbulon DPA-ja jonë:**

- Qëllimi dhe natyra e procesimit
- Llojet e të dhënave personale dhe kategoritë e subjekteve
- Detyrimet tona si procesues
- Të drejtat tuaja si kontrollues
- Masat e sigurisë teknike dhe organizative
- Procedurat për breaches dhe incidente
- Kushtet e fshirjes ose kthimit të të dhënave

**Si ta merrni DPA-n e nënshkruar:**
Dërgoni email te legal@vaqo.al me titull "DPA Request" dhe emrin e biznesit tuaj. Dërgojmë dokumentin e plotë brenda 48 orësh.

**Nën-procesuesit tanë (Sub-processors):**
• Supabase Inc. — databaza dhe autentifikimi
• Resend Inc. — shërbimi i emailit
• Vercel Inc. — hosting i aplikacionit
Lista e plotë dhe e përditësuar e sub-procesuesve disponohet me kërkesë.`,
  },
  {
    icon: '🏗️',
    title: 'Privacy by Design dhe Privacy by Default',
    content: `Vaqo zbaton parimet e Privacy by Design dhe Privacy by Default në të gjithë zhvillimin e platformës.

**Privacy by Design — si e implementojmë:**

- **Minimizimi i të dhënave:** Mbledhim vetëm të dhënat absolutisht të nevojshme
- **Enkriptim end-to-end:** Të gjitha komunikimet janë të enkriptuara
- **Anonimizim:** Analitikat bëhen me të dhëna anonime
- **Akses i kufizuar:** Row-level security — çdo biznes sheh vetëm të dhënat e tij
- **Arkitekturë zero-trust:** Çdo kërkesë API verifikohet pavarësisht burimit

**Privacy by Default — cilësimet standarde:**
- Nuk ndajmë asgjë automatikisht
- Email marketing: jo-aktiv si parazgjedhje
- Cookies jo-thelbësore: të çaktivizuara si parazgjedhje
- Profili publik: i kontrolluar nga biznesi
- Të dhënat e klientëve: aksesibël vetëm nga biznesi juaj`,
  },
  {
    icon: '📁',
    title: 'Regjistri i Aktiviteteve të Procesimit (ROPA)',
    content: `Sipas nenit 30 të GDPR, Vaqo mban Regjistrin e Aktiviteteve të Procesimit (Records of Processing Activities — ROPA).

**Procesimi #1 — Menaxhimi i llogarive të bizneseve:**
• Kategoria: Të dhëna identifikimi dhe kontakti
• Baza ligjore: Kontrata
• Ruajtja: Gjatë abonimit + 7 vjet (detyrim tatimor)
• Marrës: Vetëm stafi i autorizuar i Vaqo

**Procesimi #2 — Të dhënat e klientëve fundorë:**
• Kategoria: Emër, email, telefon, histori shërbimesh
• Baza ligjore: Kontrata (DPA me biznesin)
• Ruajtja: Sipas udhëzimeve të biznesit kontrollues
• Marrës: Vetëm biznesi kontrollues

**Procesimi #3 — Email marketing:**
• Kategoria: Email dhe emri
• Baza ligjore: Pajtimi
• Ruajtja: Deri sa të tërhiqet pajtimi
• Marrës: Resend (sub-procesor)

**Procesimi #4 — Logjet teknike:**
• Kategoria: IP, timestamp, endpoint
• Baza ligjore: Interesi legjitim (siguria)
• Ruajtja: 90 ditë
• Marrës: Vetëm sistemi automatik`,
  },
  {
    icon: '🚨',
    title: 'Procedura e Incidentit të Sigurisë (Data Breach)',
    content: `Në rast shkelje të sigurisë së të dhënave, Vaqo ndjek procedurën e mëposhtme:

**Brenda 24 orësh nga zbulimi:**
• Identifikimi dhe ndalimi i shkeljeve
• Vlerësimi i llojit dhe shtrirjes së të dhënave të prekura
• Dokumentimi i incidentit

**Brenda 72 orësh (detyrim GDPR):**
• Njoftimi i Komisionerit për Mbrojtjen e të Dhënave (Shqipëri) nëse kemi detyrimin
• Vlerësimi i riskut për subjektet e të dhënave

**Brenda 72 orësh shtesë:**
• Njoftimi i bizneseve të prekura me email të detajuar:
  - Natyra e shkeljeve
  - Të dhënat e prekura
  - Hapat e ndërmarrë
  - Rekomandimet tuaja si kontrollues

**Detyrimi juaj si kontrollues:**
Nëse njoftoheni nga Vaqo për incident, sipas GDPR ju keni detyrimin të njoftoni:
• Autoritetin mbikëqyrës brenda 72 orëve (nëse aplikohet)
• Klientët e prekur nëse rrisku është i lartë

**Kontakti urgjent i sigurisë:**
security@vaqo.al (moniturohet 24/7)`,
  },
  {
    icon: '✊',
    title: 'Të Drejtat e Subjekteve të të Dhënave',
    content: `**Bizneset partnere të Vaqo gëzojnë:**

- **E drejta e aksesit (Art. 15):** Mund të eksportoni të gjitha të dhënat tuaja kurdo
- **E drejta e korrigjimit (Art. 16):** Mund të ndryshoni çdo informacion të pasaktë
- **E drejta e fshirjes (Art. 17):** Mund të kërkoni fshirjen e llogarisë dhe të dhënave
- **E drejta e portabilitetit (Art. 20):** Eksport i të dhënave në format JSON/CSV
- **E drejta e kundërshtimit (Art. 21):** Mund të kundërshtoni procesimin marketing

**Klientët fundorë (të bizneseve tuaja):**
Si kontrollues, JU jeni përgjegjës për përgjigjen ndaj kërkesave GDPR të klientëve tuaj. Vaqo ju jep mjetet e nevojshme:
• Eksport i profilit të klientit me 1 klik
• Fshirje e llogarisë së klientit
• Anonimizim i të dhënave historike

**Afati ligjor i përgjigjes:**
30 ditë kalendarike nga marrja e kërkesës.
Mundësi zgjatjeje me 60 ditë shtesë në raste komplekse, me njoftim.

**Ankim:**
Nëse konsideroni se të drejtat tuaja janë shkelur, mund të paraqitni ankim te:
Komisioneri për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale
Website: idp.al | Email: info@idp.al`,
  },
  {
    icon: '🌍',
    title: 'Transfertat Ndërkombëtare të të Dhënave',
    content: `Vaqo ruhet dhe procesion të dhënat kryesisht brenda Bashkimit Europian dhe Zonës Ekonomike Europiane (EEA).

**Serverët tanë:**
• Supabase: serverë në Frankfurte (Gjermani) dhe Dublin (Irlandë) — brenda EEA
• Vercel: CDN global, me të dhëna sensitive vetëm brenda EEA
• Resend: serverë në SHBA me Standard Contractual Clauses (SCC) aktive

**Transfertat jashtë EEA:**
Kur transferojmë të dhëna jashtë EEA (p.sh. te ofruesit amerikanë), sigurojmë mbrojtje nëpërmjet:
• Standard Contractual Clauses (SCC) të BE-së
• Certifikime Data Privacy Framework
• Vlerësim të Transfer Impact Assessment (TIA)

**E drejta juaj:**
Mund të kërkoni informacion të detajuar rreth transfertave specifike dhe garantave të sigurisë duke kontaktuar privacy@vaqo.al`,
  },
  {
    icon: '📞',
    title: 'Zyrtari i Mbrojtjes së të Dhënave (DPO)',
    content: `Vaqo ka caktuar një Zyrtar të Mbrojtjes së të Dhënave (Data Protection Officer — DPO) sipas kërkesave të GDPR.

**Kontakti i DPO:**
• Email: dpo@vaqo.al
• Orari: E Hënë — E Premte, 09:00 — 17:00
• Gjuha: Shqip, Anglisht

**Funksionet e DPO:**
• Monitorimi i pajtueshmërisë GDPR
• Pikë kontakti me autoritetin mbikëqyrës
• Konsulencë për vlerësimet e ndikimit (DPIA)
• Trajnimi i stafit
• Shqyrtimi i ankesave

**Autoriti Mbikëqyrës Shqiptar:**
Komisioneri për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale (IDP)
• Website: idp.al
• Email: info@idp.al
• Telefon: +355 4 2259 928
• Adresa: Rr. "Abdi Toptani", Nr.6, Tiranë

Keni të drejtë të ankoheni direkt te IDP nëse konsideroni se të drejtat tuaja janë shkelur, pavarësisht nëse keni kontaktuar Vaqo paraprakisht.`,
  },
]

export default function GDPR() {
  return (
    <LegalPage
      title="Mbrojtja e të Dhënave — GDPR"
      subtitle="Vaqo zbaton standardet europiane GDPR si standard ari i mbrojtjes së privatësisë. Ky dokument shpjegon angazhimet tona, të drejtat tuaja dhe procedurat e pajtueshmërisë."
      lastUpdated="1 Janar 2026"
      badge="🇪🇺 Pajtueshmëria GDPR"
      badgeColor="#1d4ed8"
      sections={SECTIONS}
    />
  )
}
