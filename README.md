# 💪 Vaqo Ecosystem — Platforma Fitness #1 Shqipëri

## Çfarë ka ky sistem

```
Vaqo Platform
├── 💪 CRM Palestra     — menaxhim i plotë
├── 🥗 Dietologë        — shitje dietash (70/30)
├── 🛒 Dyqani           — produkte sportive (30% komision)
└── 📱 App Anëtarësh    — planet stërvitjeje
```

## URLs

| URL | Shfaqet |
|-----|---------|
| `/` | Faqja kryesore (Landing Page) |
| `/apply` | Apliko si Palestre |
| `/nutritionist/apply` | Apliko si Dietolog |
| `/login` | Hyrja |
| pas login (admin) | Platform Admin Panel |
| pas login (dietolog) | Nutritionist Dashboard |
| pas login (gym) | Gym Dashboard |

## Setup

### 1. Instalo
```bash
npm install
npm run dev
```

### 2. SQL Schema
Supabase → SQL Editor → kopjo `supabase_schema.sql` → Run

### 3. .env
```
VITE_SUPABASE_URL=https://pmefecdbnsbqgpknbeku.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Krijo Admin
Supabase → Auth → Add User → emailin tënd
```sql
UPDATE platform_admins SET auth_id = (SELECT id FROM auth.users WHERE email='emaili_yt' LIMIT 1) WHERE email='emaili_yt';
```

## Modeli i Biznesit

| Burimi | Ti fiton |
|--------|---------|
| Abonim palestre Starter | 4,900 L/muaj |
| Abonim palestre Pro | 9,900 L/muaj |
| Çdo dietë e shitur | 30% |
| Çdo produkt i shitur | 30% |

## Deploy me Vercel
```bash
npm run build
npx vercel --prod
```

---
*Vaqo Ecosystem v2.0 — Bërë për Shqipërinë 🇦🇱*
