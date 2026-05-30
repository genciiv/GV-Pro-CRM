import { useEffect, useRef, useState } from 'react'

// QR Code e bëjmë inline pa library të jashtme
// Përdorim SVG path të thjeshtë

function QRCodeSVG({ value, size = 120 }) {
  const [dataUrl, setDataUrl] = useState(null)

  useEffect(() => {
    if (!value) return
    // Përdorim canvas për të gjeneruar QR
    // Build full URL for QR
    const qrValue = value?.startsWith('http') ? value : `${window.location.origin}/checkin/${value}`
    import('qrcode').then(QRCode => {
      QRCode.toDataURL(qrValue, {
        width: size,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      }).then(url => setDataUrl(url))
        .catch(() => setDataUrl(null))
    }).catch(() => setDataUrl(null))
  }, [value, size])

  if (!dataUrl) {
    // Fallback - pattern vizual
    return (
      <div style={{
        width: size, height: size,
        background: '#f4f4f5',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
      }}>
        <div style={{ fontSize: 28, opacity: .4 }}>▦</div>
        <div style={{ fontSize: 9, color: '#a1a1aa', textAlign: 'center', padding: '0 8px' }}>
          {value?.slice(0, 8)}...
        </div>
      </div>
    )
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      style={{ width: size, height: size, borderRadius: 8, display: 'block' }}
    />
  )
}

export default QRCodeSVG

// Print helper
export function printQR(memberName, qrCode) {
  const qrValue = `${window.location.origin}/checkin/${qrCode}`
  import('qrcode').then(QRCode => {
    QRCode.toDataURL(qrValue, { width: 300, margin: 2 }).then(url => {
      const w = window.open('', '_blank', 'width=400,height=550')
      w.document.write(`
        <html>
        <head><title>QR — ${memberName}</title>
        <style>
          body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; margin: 0; background: #fff; }
          img { border: 2px solid #e4e4e7; border-radius: 12px; margin-bottom: 16px; }
          h3 { font-size: 20px; margin-bottom: 4px; }
          p { font-size: 12px; color: #71717a; margin-bottom: 20px; font-family: monospace; }
          button { background: #18181b; color: #fff; border: none; padding: 10px 28px; border-radius: 8px; font-size: 14px; cursor: pointer; }
        </style>
        </head>
        <body>
          <img src="${url}" width="250" height="250"/>
          <h3>${memberName}</h3>
          <p>${qrCode}</p>
          <button onclick="window.print()">🖨️ Printo</button>
          <script>setTimeout(()=>window.focus(),100)</script>
        </body>
        </html>
      `)
      w.document.close()
    })
  })
}
