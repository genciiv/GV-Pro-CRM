import { LegalPage } from './LegalPage'

const SECTIONS = [
  {
    icon: '🏢',
    title: 'Palët dhe Marrëdhënia',
    content: `Vaqo është një platformë softuerike SaaS (Software as a Service) e zhvilluar dhe operuar nga Vaqo SH.P.K., e regjistruar në Shqipëri.

**Palët e kësaj marrëdhënie:**
• "Vaqo" ose "ne" — kompania Vaqo SH.P.K., ofruesi i platformës
• "Biznesi" ose "ju" — çdo person juridik ose fizik që regjistron biznesin e tij te Vaqo
• "Klienti i Biznesit" — klientët e biznesit tuaj që përdorin platformën

Duke u regjistruar ose duke përdorur shërbimet e Vaqo, ju pranoni të gjitha kushtet e këtij dokumenti. Nëse nuk pajtoheni me kushtet, ju lutemi mos e përdorni platformën.`,
  },
  {
    icon: '✅',
    title: 'Shërbimet e Ofruara',
    content: `Vaqo ofron platformë dixhitale për menaxhimin e bizneseve wellness, duke përfshirë:

- Dashboard i plotë për menaxhim biznesi
- Sistem menaxhimi anëtarësh dhe klientësh
- Rezervime online dhe menaxhim oraresh
- QR Check-in automatik
- Pagesa dhe fatura dixhitale
- Raporte dhe analiza
- Profil publik te Vaqo Explore
- Email njoftimet automatike
- App mobil për klientët

**Disponueshmëria e shërbimit:**
Vaqo synon disponueshmëri 99.9% për abonentet Business. Mirëmbajtja e planifikuar njoftohet 48 orë paraprakisht. Vaqo nuk garanton disponueshmëri të pandërprerë për planet Starter dhe Pro.`,
  },
  {
    icon: '💰',
    title: 'Çmimet dhe Pagesa',
    content: `**Abonimi mujor:**
Çmimet aktuale janë të publikuara te vaqo.al/pricing. Vaqo rezervon të drejtën të ndryshojë çmimet me njoftim 30-ditor paraprak.

**Periudha provë falas:**
30 ditë aksesi i plotë në planin Pro, pa kërkuar kartë krediti ose informacion pagese.

**Mënyra e pagesës:**
- Cash — pagesë direkte te zyrat e Vaqo
- Transfertë bankare — sipas të dhënave të faturës
- Fatura mujore lëshohet brenda 5 ditëve të para të çdo muaji

**Vonesa në pagesë:**
Pas 15 ditëve vonesë, aksesi mund të kufizohet. Pas 30 ditëve vonesë, llogaria mund të pezullohet. Vaqo nuk aplikon interesa për vonesat.

**Rimbursimi:**
Vaqo nuk ofron rimbursim për periudha të paguara. Nëse anuloni, aksesi vazhdon deri në fund të periudhës aktuale të faturimit.`,
  },
  {
    icon: '📋',
    title: 'Detyrimet e Biznesit',
    content: `Duke përdorur Vaqo, biznesi juaj merr përsipër:

**Informacioni i saktë:**
- Të jepni informacion të saktë dhe të përditësuar gjatë regjistrimit
- Të njoftoni Vaqo për çdo ndryshim material të biznesit
- Të mos krijoni llogari false ose të mashtroni rreth natyrës së biznesit

**Siguria e llogarisë:**
- Të mbani konfidenciale kredencialet e aksesit
- Të njoftoni menjëherë Vaqo nëse dyshoni akses të paautorizuar
- Çdo aktivitet nga llogaria juaj konsiderohet i autorizuar nga ju

**Përdorimi i ligjshëm:**
- Të mos përdorni platformën për veprimtari të paligjshme
- Të respektoni legjislacionin shqiptar për mbrojtjen e të dhënave
- Të mos ngarkoni përmbajtje që shkel të drejtat e palëve të treta`,
  },
  {
    icon: '🔒',
    title: 'Pronësia Intelektuale',
    content: `**Pronësia e Vaqo:**
E gjithë platforma Vaqo — kodi burimor, dizajni, logot, markat tregtare dhe dokumentacioni — janë pronë ekskluzive e Vaqo SH.P.K. dhe mbrohen nga ligji shqiptar dhe ndërkombëtar i pronësisë intelektuale.

**Të dhënat e biznesit tuaj:**
Të dhënat që ju ngarkoni te Vaqo (informacioni i klientëve, rezervimet, pagesat, etj.) mbeten pronë e juaja. Vaqo nuk kërkon asnjë të drejtë mbi to, përveç të drejtës për t'i processuar për qëllime të ofrimit të shërbimit.

**Licenca e kufizuar:**
Vaqo ju jep një licencë të kufizuar, jo-ekskluzive dhe të pakalueshme për të përdorur platformën vetëm për qëllimet e biznesit tuaj.

Ju nuk mund të:
- Kopjoni, modifikoni ose shpërndani kodin e platformës
- Reverse-engineering ose dekompiloni softuerin
- Krijoni produkte konkurruese bazuar në platformën Vaqo`,
  },
  {
    icon: '⚠️',
    title: 'Kufizimi i Përgjegjësisë',
    content: `**Disclaimer i shërbimit:**
Vaqo ofrohet "siç është" (as-is). Nuk garantojmë se platforma do të përmbushë çdo kërkesë specifike të biznesit tuaj.

**Kufizimi i dëmshpërblimit:**
Përgjegjësia maksimale e Vaqo ndaj jush nuk mund të tejkalojë shumën e pagesave mujore të bëra gjatë 3 muajve të fundit.

Vaqo nuk mban përgjegjësi për:
- Humbje të të ardhurave ose fitimeve
- Humbje të të dhënave shkaktuar nga veprimet tuaja
- Dëme indirekte ose aksidentale
- Ndërprerje të shërbimit shkaktuar nga forcë madhore
- Gabime të bëra nga stafi i biznesit tuaj gjatë përdorimit të platformës`,
  },
  {
    icon: '🔚',
    title: 'Anulimi dhe Ndërprerja',
    content: `**Anulimi nga biznesi:**
Ju mund të anuloni abonimin kurdo, pa penalitete. Anulimi hyn në fuqi nga fillimi i periudhës së ardhshme të faturimit. Të dhënat ruhen 30 ditë pas anulimit dhe mund të eksportohen me kërkesë.

**Ndërprerja nga Vaqo:**
Vaqo rezervon të drejtën të ndërpresë aksesin në rastet:
- Shkelje të rëndë të këtyre kushteve
- Aktivitet mashtrues ose i paligjshëm
- Vonesë pagese mbi 45 ditë
- Kërkesë ligjore nga autoritetet kompetente

Në rastet e ndërprerjes për shkelje, Vaqo do të njoftojë me email dhe do të japë 7 ditë afat korrigjimi, përveç rasteve të shkeljeve të rënda.

**Pas ndërprerjes:**
Aksesi te platforma bllokohet. Biznesi ka 30 ditë të eksportojë të dhënat. Pas 30 ditësh, të dhënat fshihen përfundimisht.`,
  },
  {
    icon: '⚖️',
    title: 'Ligji i Zbatueshëm dhe Zgjidhja e Mosmarrëveshjeve',
    content: `**Ligji i zbatueshëm:**
Këto kushte rregullohen nga ligji i Republikës së Shqipërisë.

**Zgjidhja miqësore:**
Palët do të përpiqen të zgjidhin çdo mosmarrëveshje nëpërmjet dialogut direkt brenda 30 ditëve.

**Juridiksioni:**
Çdo mosmarrëveshje e pazgjidhur do t'i nënshtrohet juridiksionit ekskluziv të gjykatave të Tiranës, Shqipëri.

**Ndryshimet e kushteve:**
Vaqo mund të ndryshojë këto kushte me njoftim 30-ditor me email. Vazhdimi i përdorimit pas njoftimit konsiderohet pranim i kushteve të reja.

Versioni aktual i kushteve është gjithmonë i disponueshëm te vaqo.al/terms.`,
  },
]

export default function Terms() {
  return (
    <LegalPage
      title="Kushtet e Shërbimit"
      subtitle="Ky dokument përcakton kushtet dhe rregullat e përdorimit të platformës Vaqo nga bizneset e regjistruara. Ju lutemi lexojini me kujdes përpara se të filloni të përdorni shërbimet tona."
      lastUpdated="1 Janar 2026"
      badge="📋 Kushtet e Shërbimit"
      badgeColor="#18181b"
      sections={SECTIONS}
    />
  )
}
