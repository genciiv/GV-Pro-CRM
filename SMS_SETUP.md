# 📱 SMS & WhatsApp Setup — Twilio + Vaqo

## Çfarë dërgon sistemi automatikisht

| Eventi | Kanali | Kur |
|--------|--------|-----|
| Rezervim i ri (barbershop/salon/spa) | SMS | Menjëherë |
| Rezervim klase (yoga) | SMS | Menjëherë |
| Kujtues 24h para takimit | SMS | Çdo ditë 09:00 |
| Kujtues 2h para takimit | SMS | Automatik |
| Pagesa e re | SMS | Menjëherë |
| Abonim skadon 3 ditë | SMS | Çdo ditë |
| Abonim i skaduar | SMS | Ditën e skadimit |
| Book Demo (konfirmim klientit) | SMS | Menjëherë |
| Anëtar i ri | SMS | Menjëherë |

---

## Hapi 1 — Regjistrohu te Twilio (FALAS për test)

1. Shko te **[twilio.com](https://twilio.com)** → Sign Up falas
2. Twilio jep **15$ kredit falas** — mjafton për ~1,000 SMS
3. Verifiko emailin dhe numrin tuaj të telefonit

---

## Hapi 2 — Merr numrin SMS

1. Twilio Console → **Phone Numbers → Buy a Number**
2. Kërko numër me:
   - Country: Albania (+355) — nëse disponohet
   - Ose SHBA (+1) — funksionon globalisht
   - Capabilities: SMS ✅
3. Çmimi: ~$1/muaj për numër amerikan

**Për Shqipëri specifike:**
- Shiko **[infobip.com](https://infobip.com)** ose **[routee.net](https://routee.net)**
- Këta ofrues kanë numra shqiptarë (+355)
- API-ja e tyre ngjason me Twilio

---

## Hapi 3 — Konfiguro WhatsApp (Opsional)

1. Twilio Console → **Messaging → WhatsApp**
2. **Sandbox** (falas për test):
   - Dërgo "join [kod]" te +1 415 523 8886
   - Mirë për development
3. **Production** (kërkon aprovim Meta):
   - Apliko te Meta Business Suite
   - Mund të marrë 1-4 javë

---

## Hapi 4 — Merr Kredencialet

Twilio Console → **Account Info**:
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Hapi 5 — Shto te Supabase Secrets

```bash
npx supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
npx supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxx
npx supabase secrets set TWILIO_FROM_SMS=+12025550100
npx supabase secrets set TWILIO_FROM_WHATSAPP=whatsapp:+14155238886
```

Ose te Supabase Dashboard → **Settings → Edge Functions → Secrets**.

---

## Hapi 6 — Deploy Edge Function

```bash
npx supabase link --project-ref pmefecdbnsbqgpknbeku
npx supabase functions deploy send-sms --no-verify-jwt
```

---

## Hapi 7 — Testo

### Test SMS:
```bash
curl -X POST https://pmefecdbnsbqgpknbeku.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "appointment_confirm",
    "to": "+355691234567",
    "channel": "sms",
    "data": {
      "service": "Prerje flokësh",
      "staff": "Artani",
      "date": "E Hënë, 20 Janar",
      "time": "15:00",
      "price": "1,000",
      "gym": "Elite Barber",
      "phone": "069 123 4567"
    }
  }'
```

### Test WhatsApp:
Ndrysho `"channel": "whatsapp"`.

---

## Konfigurimi i Kanalit (SMS vs WhatsApp)

Te dashboard i çdo biznesi, mund të zgjedhësh kanalin:
- **SMS** — arrin të gjithë, por kosto më e lartë (~0.05-0.10€/SMS)
- **WhatsApp** — falas nëse klienti ka WhatsApp, mesazhe më të bukura
- **Të dyja** — SMS fallback nëse WhatsApp dështon

---

## Çmimet Twilio

| Lloji | Kosto | Shënim |
|-------|-------|--------|
| SMS Shqipëri (marrje) | ~$0.065/SMS | Numër amerikan → AL |
| SMS Shqipëri (dërgim) | ~$0.0075/SMS | Nëse ke numër AL |
| WhatsApp | $0.005/mesazh | Shumë më lirë |
| Numër mujor | ~$1/muaj | Numër amerikan |

**Për 1,000 SMS/muaj ≈ $10-65** (depende nga origjina e numrit).

---

## Alternativë Lokale — Routee.net

Nëse dëshironi numër shqiptar real:

```javascript
// Ndrysho endpoint te Edge Function:
const res = await fetch('https://api.routee.net/sms', {
  method: 'POST',
  headers: { 'Authorization': `Basic ${btoa(`${appId}:${password}`)}` },
  body: JSON.stringify({ from: 'Vaqo', to: toNumber, body: message })
})
```

---

## Troubleshooting

**"Twilio credentials missing"**
→ Verifiko Supabase Secrets janë shtuar saktë

**"Invalid phone number"**
→ Sigurohu që numri ka format +355XXXXXXXX

**"WhatsApp number not set"**
→ Shto `TWILIO_FROM_WHATSAPP=whatsapp:+14155238886` te secrets

**SMS nuk arrin**
→ Shiko Twilio Console → Logs → Messages (shfaqen të gjitha dërgimet)
