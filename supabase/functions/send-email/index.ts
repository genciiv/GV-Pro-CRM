// Supabase Edge Function — send-email
// Dërgon emaile automatike me Resend.com

const RESEND_API = 'https://api.resend.com/emails'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── EMAIL TEMPLATES ───────────────────────────────────────

function baseTemplate(content: string, gymName: string): string {
  return `
<!DOCTYPE html>
<html lang="sq">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Vaqo</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f5;color:#18181b;line-height:1.6}
    .wrap{max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
    .header{background:#18181b;padding:28px 32px;text-align:center}
    .logo{font-size:28px;font-weight:900;color:#fff;font-family:Georgia,serif;letter-spacing:-.5px}
    .logo span{color:#c8a96e}
    .badge{display:inline-block;background:rgba(255,255,255,.1);color:rgba(255,255,255,.6);font-size:11px;padding:3px 12px;border-radius:20px;margin-top:6px}
    .body{padding:32px}
    .title{font-family:Georgia,serif;font-size:22px;font-weight:900;margin-bottom:12px;color:#18181b}
    .text{font-size:15px;color:#52525b;line-height:1.75;margin-bottom:16px}
    .box{background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;padding:20px;margin:20px 0}
    .box-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
    .box-row:last-child{border-bottom:none}
    .box-label{color:#71717a}
    .box-value{font-weight:600;color:#18181b}
    .btn{display:block;background:#18181b;color:#fff;text-align:center;padding:14px 24px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;margin:24px 0}
    .btn-gr{background:#16a34a}
    .btn-pu{background:#7c3aed}
    .alert{border-radius:10px;padding:14px 18px;margin:16px 0;font-size:14px}
    .alert-gr{background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d}
    .alert-am{background:#fffbeb;border:1px solid #fde68a;color:#92400e}
    .alert-rd{background:#fef2f2;border:1px solid #fecaca;color:#dc2626}
    .footer{background:#f8f8f8;padding:20px 32px;text-align:center;border-top:1px solid #e4e4e7}
    .footer-text{font-size:12px;color:#a1a1aa;line-height:1.6}
    .divider{height:1px;background:#f0f0f0;margin:20px 0}
    @media(max-width:600px){.wrap{margin:0;border-radius:0}.body{padding:20px}.header{padding:20px}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="logo">Vaq<span>o</span></div>
      <div class="badge">${gymName}</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <div class="footer-text">
        Ky email u dërgua automatikisht nga Vaqo · Platforma Wellness #1 në Shqipëri 🇦🇱<br/>
        <a href="https://vaqo.al" style="color:#7c3aed;text-decoration:none">vaqo.al</a>
      </div>
    </div>
  </div>
</body>
</html>`
}

// 1. Konfirmim Rezervimi
function appointmentConfirm(data: any): { subject: string; html: string } {
  const { clientName, serviceName, staffName, date, time, price, gymName, gymPhone } = data
  return {
    subject: `✅ Rezervimi u Konfirmua — ${serviceName} · ${date}`,
    html: baseTemplate(`
      <div class="title">Rezervimi juaj u konfirmua! ✅</div>
      <p class="text">Përshëndetje <strong>${clientName}</strong>, rezervimi juaj është konfirmuar me sukses.</p>
      <div class="box">
        <div class="box-row"><span class="box-label">✂️ Shërbimi</span><span class="box-value">${serviceName}</span></div>
        <div class="box-row"><span class="box-label">👤 Specialisti</span><span class="box-value">${staffName || '—'}</span></div>
        <div class="box-row"><span class="box-label">📅 Data</span><span class="box-value">${date}</span></div>
        <div class="box-row"><span class="box-label">🕐 Ora</span><span class="box-value">${time}</span></div>
        <div class="box-row"><span class="box-label">💰 Çmimi</span><span class="box-value">${price} L</span></div>
      </div>
      <div class="alert alert-am">
        💵 <strong>Pagesa bëhet cash</strong> kur të vini te ${gymName}.
      </div>
      <div class="alert alert-gr">
        📍 Adresa: <strong>${data.gymAddress || gymName}</strong><br/>
        📞 Kontakt: <strong>${gymPhone || '—'}</strong>
      </div>
      <div class="divider"></div>
      <p class="text" style="font-size:13px;color:#71717a">Nëse dëshironi të anuloni ose ndryshoni orën, na kontaktoni sa më shpejt.</p>
    `, gymName)
  }
}

// 2. Kujtues 24h para takimit
function appointmentReminder(data: any): { subject: string; html: string } {
  const { clientName, serviceName, staffName, date, time, gymName, gymPhone } = data
  return {
    subject: `⏰ Kujtues — Takimi juaj nesër · ${time}`,
    html: baseTemplate(`
      <div class="title">Takimi juaj është nesër! ⏰</div>
      <p class="text">Përshëndetje <strong>${clientName}</strong>, ju kujtojmë se keni një takim nesër.</p>
      <div class="box">
        <div class="box-row"><span class="box-label">✂️ Shërbimi</span><span class="box-value">${serviceName}</span></div>
        ${staffName ? `<div class="box-row"><span class="box-label">👤 Specialisti</span><span class="box-value">${staffName}</span></div>` : ''}
        <div class="box-row"><span class="box-label">📅 Data</span><span class="box-value">${date}</span></div>
        <div class="box-row"><span class="box-label">🕐 Ora</span><span class="box-value">${time}</span></div>
      </div>
      <div class="alert alert-gr">
        ✅ Jini gati 5 minuta para kohës!<br/>
        📞 Pyetje? <strong>${gymPhone || gymName}</strong>
      </div>
      <p class="text" style="font-size:13px;color:#71717a">Nëse nuk mund të vini, na njoftoni sa më shpejt të mundeni.</p>
    `, gymName)
  }
}

// 3. Njoftim skadimi abonimi
function membershipExpiring(data: any): { subject: string; html: string } {
  const { memberName, planName, expiryDate, daysLeft, gymName, gymPhone } = data
  const isExpired = daysLeft <= 0
  return {
    subject: isExpired
      ? `❌ Abonimi juaj ka skaduar — ${gymName}`
      : `⚠️ Abonimi juaj skadon për ${daysLeft} ditë — ${gymName}`,
    html: baseTemplate(`
      <div class="title">${isExpired ? 'Abonimi juaj ka skaduar ❌' : `Abonimi juaj skadon për ${daysLeft} ditë ⚠️`}</div>
      <p class="text">Përshëndetje <strong>${memberName}</strong>, ${isExpired ? 'abonimi juaj ka skaduar.' : `abonimi juaj i <strong>${planName}</strong> skadon më <strong>${expiryDate}</strong>.`}</p>
      <div class="box">
        <div class="box-row"><span class="box-label">🎫 Plani</span><span class="box-value">${planName}</span></div>
        <div class="box-row"><span class="box-label">📅 Skadon</span><span class="box-value">${expiryDate}</span></div>
        ${!isExpired ? `<div class="box-row"><span class="box-label">⏳ Ditë të mbetura</span><span class="box-value">${daysLeft} ditë</span></div>` : ''}
      </div>
      <div class="alert ${isExpired ? 'alert-rd' : 'alert-am'}">
        ${isExpired
          ? '❌ Nuk mund të hyni në palestër pa abonim aktiv. Rinovoni sot!'
          : '⚠️ Rinovoni abonimin para skadimit për të mos ndërprerë hyrjen.'
        }
      </div>
      <p class="text">Rinovoni abonimin duke vizituar recepsionin ose duke na kontaktuar:</p>
      <div class="alert alert-gr">📞 <strong>${gymPhone || gymName}</strong></div>
    `, gymName)
  }
}

// 4. Mirëseardhje anëtari i ri
function memberWelcome(data: any): { subject: string; html: string } {
  const { memberName, planName, gymName, gymPhone, appUrl, registerUrl } = data
  return {
    subject: `🎉 Mirë se vini te ${gymName}!`,
    html: baseTemplate(`
      <div class="title">Mirë se vini, ${memberName}! 🎉</div>
      <p class="text">Jeni shtuar si anëtar i <strong>${gymName}</strong>. Jemi të lumtur t'ju kemi me ne!</p>
      <div class="box">
        <div class="box-row"><span class="box-label">🎫 Plani</span><span class="box-value">${planName || 'Abonim Aktiv'}</span></div>
        <div class="box-row"><span class="box-label">📞 Kontakti</span><span class="box-value">${gymPhone || '—'}</span></div>
      </div>
      <p class="text">Regjistrohuni në app-in tonë për të parë abonimin, planet e stërvitjes dhe statistikat tuaja:</p>
      <a href="${registerUrl || appUrl || 'https://vaqo.al/register'}" class="btn btn-pu">
        📱 Krijo Llogarinë Tënde →
      </a>
      <div class="alert alert-gr">
        ✅ Vendosni emailin e njëjtë që keni dhënë te recepsioni.<br/>
        ✅ Krijoni fjalëkalimin tuaj personal.<br/>
        ✅ Hyni dhe shikoni gjithçka nga telefoni.
      </div>
      <div class="divider"></div>
      <p class="text" style="font-size:13px;color:#71717a">Pyetje? Recepsioni ynë është gjithmonë këtu për ju. 💪</p>
    `, gymName)
  }
}

// 5. Njoftim Book Demo (te ti si admin)
function demoRequestNotify(data: any): { subject: string; html: string } {
  const { name, phone, email, bizType, bizName, city, hours, message } = data
  const BIZ_LABELS: Record<string,string> = {
    gym:'🏋️ Palestre',yoga:'🧘 Yoga',pilates:'🤸 Pilates',martial_arts:'🥊 Arte Marciale',
    dance:'💃 Vallëzim',fitness:'⚡ Fitness',barbershop:'💈 Barbershop',
    salon:'💅 Sallon',spa:'💆 Spa',wellness:'🌿 Wellness',other:'🏢 Tjetër'
  }
  return {
    subject: `🆕 Kërkesë Demo e Re — ${name} · ${BIZ_LABELS[bizType]||bizType}`,
    html: baseTemplate(`
      <div class="title">Kërkesë e Re Book Demo 🆕</div>
      <p class="text">Një biznes i ri ka kërkuar demonstrim të platformës Vaqo.</p>
      <div class="box">
        <div class="box-row"><span class="box-label">👤 Emri</span><span class="box-value">${name}</span></div>
        <div class="box-row"><span class="box-label">📞 Telefon</span><span class="box-value">${phone}</span></div>
        ${email ? `<div class="box-row"><span class="box-label">📧 Email</span><span class="box-value">${email}</span></div>` : ''}
        <div class="box-row"><span class="box-label">🏢 Lloji</span><span class="box-value">${BIZ_LABELS[bizType]||bizType}</span></div>
        ${bizName ? `<div class="box-row"><span class="box-label">🏷️ Biznesi</span><span class="box-value">${bizName}</span></div>` : ''}
        <div class="box-row"><span class="box-label">📍 Qyteti</span><span class="box-value">${city}</span></div>
        ${hours?.length ? `<div class="box-row"><span class="box-label">🕐 Orari preferencial</span><span class="box-value">${hours.join(' · ')}</span></div>` : ''}
      </div>
      ${message ? `<div class="alert alert-am">💬 <strong>Mesazhi:</strong><br/>${message}</div>` : ''}
      <a href="tel:${phone}" class="btn btn-gr">📞 Telefono ${name} Tani</a>
      <p class="text" style="font-size:13px;color:#71717a">Shiko të gjitha kërkesat te Admin Panel → Demo Kërkesat.</p>
    `, 'Vaqo Platform')
  }
}

// 6. Konfirmim rezervimi klase (Yoga/Pilates)
function classBookingConfirm(data: any): { subject: string; html: string } {
  const { clientName, className, date, time, duration, price, gymName, gymPhone } = data
  return {
    subject: `✅ Rezervimi u Konfirmua — ${className} · ${date}`,
    html: baseTemplate(`
      <div class="title">Vendi juaj u rezervua! ✅</div>
      <p class="text">Përshëndetje <strong>${clientName}</strong>, vendi juaj në klasën e mëposhtme është konfirmuar.</p>
      <div class="box">
        <div class="box-row"><span class="box-label">🧘 Klasa</span><span class="box-value">${className}</span></div>
        <div class="box-row"><span class="box-label">📅 Data</span><span class="box-value">${date}</span></div>
        <div class="box-row"><span class="box-label">🕐 Ora</span><span class="box-value">${time}</span></div>
        <div class="box-row"><span class="box-label">⏱ Kohëzgjatja</span><span class="box-value">${duration} min</span></div>
        <div class="box-row"><span class="box-label">💰 Çmimi</span><span class="box-value">${price} L (cash)</span></div>
      </div>
      <div class="alert alert-gr">
        ✅ Sillni veshje të rehatshme!<br/>
        📞 Pyetje? <strong>${gymPhone || gymName}</strong>
      </div>
    `, gymName)
  }
}

// ── MAIN HANDLER ──────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { type, to, data } = await req.json()

    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_KEY) throw new Error('RESEND_API_KEY not set')

    if (!to || !type) throw new Error('Missing: to, type')

    // Get template
    let template: { subject: string; html: string }
    switch (type) {
      case 'appointment_confirm':   template = appointmentConfirm(data);   break
      case 'appointment_reminder':  template = appointmentReminder(data);   break
      case 'membership_expiring':   template = membershipExpiring(data);    break
      case 'member_welcome':        template = memberWelcome(data);         break
      case 'demo_request':          template = demoRequestNotify(data);     break
      case 'class_booking_confirm': template = classBookingConfirm(data);   break
      default: throw new Error(`Unknown email type: ${type}`)
    }

    // Send via Resend
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Vaqo <noreply@vaqo.al>`,
        to: Array.isArray(to) ? to : [to],
        subject: template.subject,
        html: template.html,
      })
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.message || 'Resend error')

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    console.error('Email error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
