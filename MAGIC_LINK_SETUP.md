# 📧 Magic Link Setup — Supabase

## Çfarë bën Magic Link

Kur palestra shton anëtar me email:
1. Anëtari merr email automatik
2. Klikoni linkun → hyn direkt në App
3. **Pa fjalëkalim fare** — e thjeshtë dhe profesionale

---

## Setup (1 herë)

### Hapi 1 — Supabase Email Settings

Shko te: **Supabase Dashboard → Authentication → Email Templates**

Ndryshon template-in "Magic Link":

**Subject:**
```
Mirë se vini në FitPro! 💪
```

**Body (HTML):**
```html
<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
  <div style="background:#18181b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
    <div style="font-size:36px;margin-bottom:8px">💪</div>
    <div style="font-size:22px;font-weight:700;color:#fff">FitPro CRM</div>
    <div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:4px">Platforma Fitness #1 në Shqipëri</div>
  </div>
  
  <h2 style="font-size:20px;margin-bottom:8px">Mirë se vini! 👋</h2>
  <p style="color:#52525b;line-height:1.7;margin-bottom:24px">
    Jeni shtuar si anëtar. Klikoni butonin më poshtë për të hyrë në app-in tuaj personal FitPro.
  </p>
  
  <a href="{{ .ConfirmationURL }}" 
    style="display:block;background:#18181b;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px;text-decoration:none;margin-bottom:16px">
    🚀 Hyr në FitPro →
  </a>
  
  <p style="font-size:12px;color:#a1a1aa;text-align:center;margin-top:16px">
    Ky link skadon pas 24 orësh. Nëse nuk e kërkuat ju, injorojeni.
  </p>
  
  <div style="border-top:1px solid #e4e4e7;margin-top:24px;padding-top:16px;font-size:11px;color:#a1a1aa;text-align:center">
    FitPro CRM — Bërë për Shqipërinë 🇦🇱
  </div>
</div>
```

---

### Hapi 2 — URL Redirect

**Supabase → Authentication → URL Configuration**

**Site URL:**
```
http://localhost:5173
```
(Pas deploy: vendos URL-në e Vercel-it)

**Redirect URLs (shto këto):**
```
http://localhost:5173/
https://DOMAIN_YT.vercel.app/
```

---

### Hapi 3 — Konfirmo Email Settings

**Supabase → Authentication → Settings:**
- ✅ Enable email confirmations: **OFF** (jo e nevojshme për Magic Link)
- ✅ Secure email change: ON
- OTP Expiry: **86400** (24 orë)

---

## Si funksionon pas setup:

1. Palestra shton anëtar + email ✅ **checkbox Magic Link**
2. Anëtari merr email brenda 1-2 minutash
3. Klikoni → ridrejton te `localhost:5173/` (ose domain-i yt)
4. Hyn automatikisht si anëtar
5. Sheh App-in personal me abonimin, planet e stërvitjes, etj.

## Dërgo sërish:

Profili i anëtarit → Butoni **"📧 Magic Link"** → Dërgon sërish.

---

## Shënim i rëndësishëm

Supabase falas lejon **2 emaile/orë** për çdo adresë dhe **50 emaile/ditë** total.

Për production me shumë anëtarë, konfiguro **SMTP të jashtëm**:
- **Resend.com** — 3,000 email/muaj falas
- **SendGrid** — 100/ditë falas

Supabase → Authentication → SMTP Settings → vendos kredencialet e Resend/SendGrid
