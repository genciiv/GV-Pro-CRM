# 🎬 Udhëzues Prodhimi Video Demo — Vaqo

## Çfarë duhet të xhirosh (3 minuta)

### Struktura e Skriptit

```
[00:00 - 00:20] HOOK — Problemi
[00:20 - 00:50] ZGJIDHJA — Vaqo çfarë është
[00:50 - 02:30] DEMO LIVE — Funksionet kryesore
[02:30 - 03:00] CTA — Thirre për veprim
```

---

## Skripti i Plotë

### 🎬 Hapi 1 — HOOK (0-20 sek)

**[Ekran: Telefon me missed calls]**

> "Sa herë keni humbur klientë sepse nuk keni marrë telefonin?
> Sa orë kaloni çdo ditë duke menaxhuar Excel-a dhe lista të shkruara me dorë?
> Ekziston një zgjidhje më e mirë."

---

### 🎬 Hapi 2 — ZGJIDHJA (20-50 sek)

**[Ekran: Vaqo logo + landing page]**

> "Vaqo është platforma wellness all-in-one e ndërtuar për bizneset shqiptare.
> Palestra, barbershop, sallon, spa, yoga — gjithçka menaxhohet nga një dashboard."

---

### 🎬 Hapi 3 — DEMO LIVE (50 sek - 2:30 min)

#### Seksioni 3a — Dashboard (50 sek - 1:15 min)
**[Ekran: GymDashboard]**
> "Kur hapni Vaqo çdo mëngjes, shihni menjëherë:
> - Sa anëtarë hynë dje
> - Sa pagesa u bënë
> - Rezervimet e ditës
> - Kush skadon këtë javë"

#### Seksioni 3b — QR Check-in (1:15 - 1:35 min)
**[Ekran: QR code + telefon duke skanuar]**
> "Çdo anëtar ka QR kod personal.
> Hyn, skanon me telefon — regjistrohet automatikisht.
> Zero letër, zero pritje."

#### Seksioni 3c — Rezervime Online (1:35 - 2:00 min)
**[Ekran: Booking form + konfirmim]**
> "Klientët rezervojnë vetë, 24/7, nga telefoni.
> Marrin konfirmim automatik me email dhe SMS.
> Ju nuk bëni asgjë — sistemi punon për ju."

#### Seksioni 3d — Pagesa & Fatura (2:00 - 2:30 min)
**[Ekran: Payments + invoice PDF]**
> "Çdo pagesë regjistrohet me 1 klik.
> Fatura automatike PDF me numër unik.
> Raportet janë live — shihni çdo moment sa keni fituar."

---

### 🎬 Hapi 4 — CTA (2:30 - 3:00 min)

**[Ekran: /demo page]**
> "30 ditë falas. Pa kartë krediti. Setup 30 minuta.
> Kliko butonin poshtë dhe book demo tani."

---

## Si ta Xhirosh

### Mjetet e Nevojshme (falas)

| Mjet | Çfarë bën | Ku shkarkohet |
|------|-----------|---------------|
| **OBS Studio** | Regjistron ekranin | obsproject.com |
| **Loom** | Rekordim i shpejtë me webcam | loom.com |
| **DaVinci Resolve** | Montazh falas | blackmagicdesign.com |

### Cilësia e Rekomanduar
- **Rezolucioni:** 1920×1080 (Full HD)
- **FPS:** 30 ose 60
- **Audio:** Mikrofon i jashtëm (edhe USB i lirë funksionon)
- **Formati final:** MP4, H.264

---

## Ku ta Postosh dhe si ta Embedo

### Opsioni 1 — YouTube (i rekomanduar)
```
1. Ngarko te youtube.com/upload
2. Titulli: "Vaqo - Platform Wellness #1 në Shqipëri | Demo 3 min"
3. Description: [vendos URL vaqo.al/demo]
4. Visibility: Public (ose Unlisted nëse nuk dëshironi publik)
5. Merr YouTube ID nga URL: youtube.com/watch?v=XXXXX
```

Pastaj te `src/components/DemoVideo.jsx`:
```javascript
const VIDEO_CONFIG = {
  platform: 'youtube',
  youtube_id: 'XXXXX', // ← vendos ID-në
  title: 'Vaqo — Si funksionon platforma',
  duration: '3:00',
}
```

### Opsioni 2 — Loom (shumë i shpejtë)
```
1. Shko loom.com → Record
2. Share → merr linkun
3. ID: loom.com/share/XXXXX → merr XXXXX
```

```javascript
const VIDEO_CONFIG = {
  platform: 'loom',
  loom_id: 'XXXXX',
}
```

### Opsioni 3 — Vimeo (më profesional)
```
1. Ngarko te vimeo.com
2. Merr ID nga URL: vimeo.com/XXXXX
```

```javascript
const VIDEO_CONFIG = {
  platform: 'vimeo',
  vimeo_id: 'XXXXX',
}
```

---

## Rezultati pas Shtimit të Videos

### 📊 Impakti i Pritur
- **+40%** konvertim te /demo
- **+25%** kohë në faqe (dwell time)
- **-30%** pyetje repetitive nga klientët
- **SEO:** YouTube video rrit rankimin organik

### Ku shfaqet Automatikisht
| Faqja | Pozicioni |
|-------|-----------|
| `/` (Landing Page) | Seksioni "Demo Video" pas "Si Funksionon" |
| `/demo` (Book Demo) | Panel i djathtë, sipër Trust badges |

### Thumbnail i Rekomanduar
- Madhësia: **1280×720px**
- Elementi: Foto jote + tekst "3 min Demo"
- Ngjyrat: Vjollcë (#7c3aed) + i zi (#18181b)
- Tool falas: **Canva.com**

---

## Checklist para Xhirimit

- [ ] Hap `localhost:5173` ose `vaqo.al`
- [ ] Pastro historikun e browser (Ctrl+Shift+Delete)
- [ ] Ngaro disa anëtarë test
- [ ] Bëj 1-2 rezervime test
- [ ] Aktivizo "Do Not Disturb" në telefon
- [ ] Testo audio para xhirimit
- [ ] Xhiro 2-3 take dhe zgjedh të mirën

---

## Shembull Thumbnail

```
┌─────────────────────────────────┐
│  [FOTO]    VAQO                 │
│  jote      Platform             │
│  këtu      Wellness #1          │
│            ─────────────        │
│            Shiko Demo           │
│            ▶ 3 min              │
└─────────────────────────────────┘
```
