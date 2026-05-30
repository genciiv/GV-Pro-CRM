# 🔐 Google & Apple Sign-in Setup — Vaqo

## Google Sign-in (15 minuta)

### Hapi 1 — Google Cloud Console
1. Shko te: https://console.cloud.google.com
2. Krijo projekt të ri: "Vaqo"
3. APIs & Services → Credentials → Create Credentials → OAuth Client ID
4. Application type: **Web application**
5. Authorized redirect URIs shto:
   ```
   https://pmefecdbnsbqgpknbeku.supabase.co/auth/v1/callback
   ```
6. Kopjo **Client ID** dhe **Client Secret**

### Hapi 2 — Supabase
1. Supabase → Authentication → Providers → Google
2. Enable Google → vendos Client ID + Client Secret
3. Save

---

## Apple Sign-in (30 minuta — më kompleks)

### Hapi 1 — Apple Developer Account
1. Shko te: https://developer.apple.com
2. Certificates → Identifiers → Register App ID
3. Enable "Sign In with Apple"
4. Keys → Create Key → Enable "Sign In with Apple"
5. Shkarko `.p8` filen

### Hapi 2 — Supabase
1. Supabase → Authentication → Providers → Apple
2. Vendos: Service ID, Team ID, Key ID, Private Key (.p8)
3. Save

---

## URL Configuration (KRITIKE)

**Supabase → Authentication → URL Configuration:**

```
Site URL:
https://gv-pro-crm.vercel.app

Redirect URLs (shto të gjitha):
http://localhost:5173
http://localhost:5173/
https://gv-pro-crm.vercel.app
https://gv-pro-crm.vercel.app/
```

---

## Si funksionon pas setup

**Klienti hap Explore → klik "Rezervo"**
→ Nëse nuk ka llogari, opsion: Google / Apple / email
→ 1 klik → llogaria krijohet automatikisht
→ Rezervimi bëhet direkt

**Biznesi dhe Admin** → vetëm email + password (si tani)

---

## Test

Pas setup, shko te `localhost:5173/login` dhe shiko butonin Google.
Kliko → duhet të hapë Google OAuth popup → logo → kthehu.
