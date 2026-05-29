# 💪 FitPro CRM — Setup Guide

## HAPAT PAS SHKARKIMIT TË ZIP

---

### HAPI 1 — Hap projektin në VS Code
1. Shpako ZIP-in
2. Hap folderin `fitpro-final` në VS Code
3. Hap terminalin (Ctrl + `)

---

### HAPI 2 — Instalo dependencies
```bash
npm install
```

---

### HAPI 3 — SQL Schema në Supabase
1. Shko te **supabase.com** → projekti yt
2. **SQL Editor** → **New Query**
3. Kopjo gjithçka nga skedari `supabase_schema.sql`
4. Kliko **Run** (ose Ctrl+Enter)
5. Duhet të shohësh: `FitPro Schema u krijua me sukses! ✅`

---

### HAPI 4 — Krijo llogarinë tënde (Platform Admin)

**Supabase → Authentication → Users → Add User:**
```
Email:    vaqogenci@gmail.com
Password: fjalëkalimi_yt_i_fortë
```

Kliko **Create User** dhe kopjo **UUID** (kolona UID).

---

### HAPI 5 — Shto veten si Platform Admin

**SQL Editor → New Query:**
```sql
insert into platform_admins (auth_id, email, name)
values (
  'VENDOS_UUID_KETU',
  'vaqogenci@gmail.com',
  'Admin FitPro'
);
```

Zëvendëso `VENDOS_UUID_KETU` me UUID-in që kopjove.

---

### HAPI 6 — Nis projektin
```bash
npm run dev
```

Hap: **http://localhost:5173**

---

### HAPI 7 — Hyr si Admin
- Shko te `/login`
- Email: `vaqogenci@gmail.com`
- Password: fjalëkalimi që ke vendosur

---

## SI FUNKSIONON PROCESI ME KLIENTËT

```
1. Klienti shkon te / (faqja kryesore)
2. Klikon "Apliko Tani" → plotëson formularin
3. TI shikon aplikimin te Admin Panel → "Aplikimet"
4. Telefonon klientin, merr pagesën cash
5. Klik "Aprovo" → vendos fjalëkalimin për klientin
6. Shko te Supabase → Authentication → Add User
   Email: emaili i klientit
   Password: fjalëkalimi që vendose
7. Telefono klientin: "Hyr te [URL] me [email] dhe [password]"
8. Klienti hyn → sheh dashboardin e tij BOSH → fillon punën
```

---

## DEPLOY FALAS ME VERCEL

```bash
npm run build
npx vercel --prod
```

Shto env variables te Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## FAQET

| URL | Shfaqet |
|-----|---------|
| `/` | Faqja kryesore (landing page) |
| `/apply` | Formulari i aplikimit |
| `/login` | Hyrja |
| pas login (admin) | Panel Admin |
| pas login (gym) | Dashboard i palestrës |

---
*FitPro CRM v1.0 — Bërë për palestra shqiptare 🇦🇱*
