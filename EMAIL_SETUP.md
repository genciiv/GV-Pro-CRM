# 📧 Email Automatik Setup — Resend.com + Vaqo

## Çfarë dërgon sistemi automatikisht

| Eventi | Kush merr email | Kur |
|--------|----------------|-----|
| Rezervim i ri (barbershop/salon/spa) | Klienti | Menjëherë |
| Rezervim klase (yoga/pilates) | Klienti | Menjëherë |
| Anëtar i ri | Anëtari | Menjëherë |
| Book Demo | Ti (admin) | Menjëherë |
| Abonim skadon 3 ditë | Anëtari | Çdo ditë |
| Kujtues takimi nesër | Klienti | Çdo ditë |

---

## Hapi 1 — Regjistrohu te Resend.com (Falas)

1. Shko te **[resend.com](https://resend.com)** → Sign Up falas
2. Resend ofron **3,000 email/muaj falas** — mjafton për fillim

---

## Hapi 2 — Verifiko Domain (vaqo.al)

1. Resend Dashboard → **Domains → Add Domain**
2. Vendos: `vaqo.al`
3. Shto DNS records te domain provider-it tënd:
   ```
   TXT   resend._domainkey.vaqo.al   [vlera nga Resend]
   MX    vaqo.al                      [vlera nga Resend]
   ```
4. Prit 5-10 minuta → Verified ✅

**Nëse nuk ke domain akoma**, përdor email-in tënd personal (test mode).

---

## Hapi 3 — Krijo API Key

1. Resend → **API Keys → Create API Key**
2. Emri: `vaqo-production`
3. Permission: **Full Access**
4. Kopjo API Key (fillon me `re_`)

---

## Hapi 4 — Shto te Supabase Secrets

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

Ose te Supabase Dashboard → **Settings → Edge Functions → Add Secret**:
- Name: `RESEND_API_KEY`
- Value: `re_xxxxxxxxxxxxxxxxxxxx`

---

## Hapi 5 — Deploy Edge Function

```bash
npx supabase link --project-ref pmefecdbnsbqgpknbeku
npx supabase functions deploy send-email --no-verify-jwt
```

---

## Hapi 6 — Shto .env Variable (për admin email)

Hap `.env` në projektin tënd dhe shto:

```
VITE_ADMIN_EMAIL=vaqogenci@gmail.com
```

---

## Hapi 7 — Testo

Hap browser → `/demo` → plotëso formularin → Submit.

Duhet të marrësh email te `vaqogenci@gmail.com` me detajet e kërkesës.

---

## Nëse nuk ke domain ende (test mode)

Ndrysho `from` te Edge Function:

```typescript
from: 'Vaqo <onboarding@resend.dev>',
```

Kjo dërgon vetëm te emaili juaj (verified) gjatë testimit.

---

## Setup Cron Job — Kujtues Ditore

Supabase → **Database → Extensions → pg_cron** → Enable

Pastaj SQL Editor:

```sql
-- Çdo ditë në 09:00 dërgon kujtues
-- (implemento sipas nevojës)
SELECT cron.schedule(
  'daily-reminders',
  '0 9 * * *',
  'SELECT net.http_post(
    url := current_setting(''app.supabase_url'') || ''/functions/v1/send-reminders'',
    headers := jsonb_build_object(''Authorization'', ''Bearer '' || current_setting(''app.anon_key'')),
    body := ''{}''::jsonb
  )'
);
```

---

## Email Templates — Çfarë Duken

Të gjitha emailet kanë:
- ✅ Header i zi me logo **Vaqo**
- ✅ Tabela me detajet e rezervimit
- ✅ Alert me informacion të rëndësishëm
- ✅ Footer me linkun e vaqo.al
- ✅ Responsive (mobile + desktop)

---

## Troubleshooting

**Email nuk dërgohet:**
1. Kontrollo Supabase Logs → Edge Functions → send-email
2. Verifiko RESEND_API_KEY është i saktë
3. Verifiko domain te Resend (duhet Verified ✅)

**"Domain not verified":**
- Resend → Domains → Shiko DNS Records
- Prit 24h nëse sapo ke shtuar DNS

**Test pa deploy:**
- Supabase Dashboard → Edge Functions → send-email → Invoke
- Body: `{"type":"demo_request","to":"test@test.com","data":{...}}`
