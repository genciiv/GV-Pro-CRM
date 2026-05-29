# 🚀 Deploy Edge Function — invite-member

## Çfarë bën kjo Edge Function

Kur palestra shton anëtar me email:
1. Krijon userin automatikisht në Supabase Auth
2. E lidh me tabelën members
3. Dërgon email me link hyrjeje
4. Anëtari klikohet → hyn direkt në App

---

## Hapat e Deploy-it (1 herë)

### Hapi 1 — Instalo Supabase CLI

```bash
# Windows (PowerShell Admin)
winget install Supabase.CLI

# Mac
brew install supabase/tap/supabase

# Verifiko
supabase --version
```

### Hapi 2 — Login te Supabase

```bash
supabase login
```
Hap browser → logohu → kthehu te terminal.

### Hapi 3 — Lidh projektin

```bash
cd fitpro-ecosystem
supabase link --project-ref pmefecdbnsbqgpknbeku
```
Vendos **Database Password** (nga Supabase → Settings → Database).

### Hapi 4 — Vendos Secrets

```bash
supabase secrets set SITE_URL=http://localhost:5173
```

*(Pas deploy Vercel: `supabase secrets set SITE_URL=https://fitpro-crm.vercel.app`)*

### Hapi 5 — Deploy Function

```bash
supabase functions deploy invite-member --no-verify-jwt
```

Duhet të shohësh:
```
✓ Deployed Function invite-member
```

---

## Testo nëse funksionon

```bash
curl -X POST https://pmefecdbnsbqgpknbeku.supabase.co/functions/v1/invite-member \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","gymName":"Test Gym","gymId":"GYM_ID"}'
```

Përgjigja duhet të jetë:
```json
{"success":true,"message":"📧 Invitation u dërgua te test@test.com"}
```

---

## Pas Deploy Vercel

Ndrysho SITE_URL:
```bash
supabase secrets set SITE_URL=https://DOMAIN_YT.vercel.app
```

---

## Nëse ka gabim "relay not found"

Konfiguro SMTP te Supabase:
1. Shko te [Resend.com](https://resend.com) → Regjistrohu falas
2. Krijo API Key
3. Supabase → Settings → Auth → SMTP Settings:
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: `API_KEY_NGA_RESEND`
   - Sender: `fitpro@domain.yt`

---

## Supabase → Authentication → URL Configuration

Shto këto (KRITIKE):
```
Site URL: http://localhost:5173

Additional Redirect URLs:
http://localhost:5173
http://localhost:5173/
https://DOMAIN_YT.vercel.app
https://DOMAIN_YT.vercel.app/
```
