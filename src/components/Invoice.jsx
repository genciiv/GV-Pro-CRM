import { fmtNum, fmtDate } from '../lib/db'

// Gjenero dhe printo faturë HTML
export function printInvoice({ invoice_number, member, gym, plan, amount, method, date }) {
  const w = window.open('', '_blank', 'width=600,height=750')
  const methodLabel = method === 'cash' ? 'Cash' : method === 'transfer' ? 'Transfertë Bankare' : 'Kartë'

  w.document.write(`
    <!DOCTYPE html>
    <html lang="sq">
    <head>
      <meta charset="UTF-8"/>
      <title>Faturë ${invoice_number}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; color: #18181b; background: #fff; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #18181b; }
        .logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon { width: 44px; height: 44px; background: #18181b; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .logo-text { font-size: 20px; font-weight: 700; }
        .logo-sub { font-size: 12px; color: #71717a; }
        .invoice-info { text-align: right; }
        .invoice-num { font-size: 22px; font-weight: 900; color: #18181b; }
        .invoice-date { font-size: 13px; color: #71717a; margin-top: 4px; }
        .status { display: inline-block; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #a1a1aa; margin-bottom: 12px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
        .info-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 10px; padding: 16px; }
        .info-label { font-size: 11px; color: #71717a; margin-bottom: 4px; }
        .info-value { font-size: 14px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #18181b; color: #fff; padding: 10px 14px; text-align: left; font-size: 12px; font-weight: 600; }
        td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .total-row { background: #f5f0e8; }
        .total-row td { font-weight: 700; font-size: 16px; padding: 14px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e4e4e7; text-align: center; font-size: 11px; color: #a1a1aa; line-height: 1.8; }
        .print-btn { position: fixed; bottom: 24px; right: 24px; background: #18181b; color: #fff; border: none; padding: 12px 24px; border-radius: 9px; font-size: 14px; font-weight: 600; cursor: pointer; }
        @media print { .print-btn { display: none; } body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <div class="logo-icon">💪</div>
          <div>
            <div class="logo-text">${gym?.name || 'Vaqo Gym'}</div>
            <div class="logo-sub">${gym?.address || ''} ${gym?.city || ''}</div>
            ${gym?.nipt ? `<div class="logo-sub">NIPT: ${gym.nipt}</div>` : ''}
          </div>
        </div>
        <div class="invoice-info">
          <div class="invoice-num">${invoice_number}</div>
          <div class="invoice-date">${fmtDate(date || new Date().toISOString())}</div>
          <div class="status">✓ E Paguar</div>
        </div>
      </div>

      <div class="grid2">
        <div class="info-box">
          <div class="section-title">Klienti</div>
          <div class="info-value">${member?.first_name} ${member?.last_name}</div>
          ${member?.phone ? `<div class="info-label" style="margin-top:6px">📞 ${member.phone}</div>` : ''}
          ${member?.email ? `<div class="info-label">📧 ${member.email}</div>` : ''}
        </div>
        <div class="info-box">
          <div class="section-title">Palestra</div>
          <div class="info-value">${gym?.name || 'Vaqo Gym'}</div>
          ${gym?.phone ? `<div class="info-label" style="margin-top:6px">📞 ${gym.phone}</div>` : ''}
          ${gym?.email ? `<div class="info-label">📧 ${gym.email}</div>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Përshkrimi</th>
            <th>Metoda</th>
            <th style="text-align:right">Shuma</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style="font-weight:600">${plan?.emoji || '🎫'} ${plan?.name || 'Abonim'}</div>
              ${plan?.duration_days ? `<div style="font-size:11px;color:#71717a;margin-top:3px">${plan.duration_days} ditë abonim</div>` : ''}
            </td>
            <td>💵 ${methodLabel}</td>
            <td style="text-align:right;font-weight:700;font-size:16px">${fmtNum(amount)} L</td>
          </tr>
          <tr class="total-row">
            <td colspan="2">TOTALI</td>
            <td style="text-align:right">${fmtNum(amount)} L</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <div>Faleminderit që zgjodhët ${gym?.name || 'Vaqo Gym'}! 💪</div>
        <div>Fatura e gjeneruar automatikisht nga Vaqo • vaqo.al</div>
        <div style="margin-top:6px;font-size:10px">Kjo faturë është e vlefshme pa vulë dhe nënshkrim sipas ligjit nr. 87/2019</div>
      </div>

      <button class="print-btn" onclick="window.print()">🖨️ Printo Faturën</button>
    </body>
    </html>
  `)
  w.document.close()
}

// Butoni i faturës
export function InvoiceButton({ payment, gym, member, plan, style }) {
  if (!payment) return null
  return (
    <button
      className="btn btn-g btn-xs"
      title="Printo Faturën"
      style={style}
      onClick={() => printInvoice({
        invoice_number: payment.invoice_number,
        member, gym, plan,
        amount: payment.amount,
        method: payment.method,
        date: payment.paid_at || payment.created_at,
      })}
    >
      🧾
    </button>
  )
}
