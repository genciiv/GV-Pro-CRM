import { useEffect, useRef } from 'react'

// Leaflet nga CDN — pa npm install problems
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

const BIZ_COLORS = {
  gym:          '#18181b',
  barbershop:   '#7c3aed',
  salon:        '#be185d',
  spa:          '#0891b2',
  yoga:         '#16a34a',
  pilates:      '#16a34a',
  martial_arts: '#dc2626',
  other:        '#52525b',
}

const BIZ_ICONS = {
  gym:'🏋️', barbershop:'💈', salon:'💅', spa:'💆',
  yoga:'🧘', pilates:'🤸', martial_arts:'🥊', other:'🏢',
}

// City coordinates Albania
const CITY_COORDS = {
  'Tiranë':    [41.3275, 19.8187],
  'Tirana':    [41.3275, 19.8187],
  'Durrës':    [41.3246, 19.4565],
  'Shkodër':   [42.0683, 19.5126],
  'Vlorë':     [40.4608, 19.4818],
  'Elbasan':   [41.1125, 20.0822],
  'Korçë':     [40.6186, 20.7808],
  'Fier':      [40.7239, 19.5563],
  'Berat':     [40.7058, 19.9522],
  'Lushnjë':   [40.9419, 19.7050],
  'Kavajë':    [41.1856, 19.5569],
  'Lezhë':     [41.7836, 19.6436],
}

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return }

    // CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'; link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }

    // JS
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.onload = () => resolve(window.L)
    document.head.appendChild(script)
  })
}

function getCityCoords(city) {
  if (!city) return null
  for (const [k,v] of Object.entries(CITY_COORDS)) {
    if (city.toLowerCase().includes(k.toLowerCase())) return v
  }
  return null
}

// ── EXPLORE MAP — shumë biznes ────────────────────────────
export function ExploreMap({ businesses, onSelect, style }) {
  const mapRef  = useRef(null)
  const mapInst = useRef(null)
  const markers = useRef([])

  useEffect(() => {
    let isMounted = true
    loadLeaflet().then(L => {
      if (!isMounted || !mapRef.current) return

      // Init map
      if (!mapInst.current) {
        mapInst.current = L.map(mapRef.current, {
          center: [41.15, 20.0],
          zoom: 8,
          zoomControl: true,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 18,
        }).addTo(mapInst.current)
      }

      // Remove old markers
      markers.current.forEach(m => m.remove())
      markers.current = []

      // Add markers
      const validBiz = (businesses||[]).filter(b => {
        const coords = getCityCoords(b.city)
        return coords !== null
      })

      validBiz.forEach(biz => {
        const coords = getCityCoords(biz.city)
        if (!coords) return

        // Small jitter so multiple businesses in same city don't overlap
        const jitter = [(Math.random()-0.5)*0.02, (Math.random()-0.5)*0.02]
        const pos = [coords[0]+jitter[0], coords[1]+jitter[1]]

        const color = BIZ_COLORS[biz.business_type] || '#18181b'
        const icon  = BIZ_ICONS[biz.business_type] || '🏢'

        const customIcon = L.divIcon({
          html: `
            <div style="
              width:40px;height:40px;border-radius:50% 50% 50% 0;
              background:${color};border:3px solid #fff;
              box-shadow:0 3px 12px rgba(0,0,0,.3);
              display:flex;align-items:center;justify-content:center;
              font-size:18px;transform:rotate(-45deg);cursor:pointer;
              transition:transform .15s;
            ">
              <span style="transform:rotate(45deg)">${icon}</span>
            </div>`,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -44],
        })

        const marker = L.marker(pos, { icon: customIcon })
          .addTo(mapInst.current)
          .bindPopup(`
            <div style="font-family:'Geist',sans-serif;min-width:180px;padding:4px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${biz.name}</div>
              <div style="font-size:12px;color:#71717a;margin-bottom:6px">📍 ${biz.city}</div>
              ${biz.rating > 0 ? `<div style="font-size:12px;color:#f59e0b;margin-bottom:8px">${'★'.repeat(Math.round(biz.rating))} ${parseFloat(biz.rating).toFixed(1)}</div>` : ''}
              ${biz.top_services?.slice(0,2).map(s=>`<div style="font-size:11px;color:#52525b">${s.emoji} ${s.name} — ${s.price?.toLocaleString('sq-AL')}L</div>`).join('')||''}
              <button onclick="window.location.href='/b/${biz.slug}'" style="
                margin-top:10px;width:100%;background:#18181b;color:#fff;
                border:none;padding:7px;border-radius:7px;font-size:12px;
                font-weight:600;cursor:pointer;font-family:inherit;
              ">Shiko Biznesin →</button>
            </div>
          `, { maxWidth: 220 })
          .on('click', () => onSelect && onSelect(biz))

        markers.current.push(marker)
      })

      // Fit bounds nëse ka markers
      if (markers.current.length > 0) {
        const group = L.featureGroup(markers.current)
        mapInst.current.fitBounds(group.getBounds().pad(0.15))
      }
    })

    return () => { isMounted = false }
  }, [businesses])

  useEffect(() => {
    return () => {
      if (mapInst.current) {
        mapInst.current.remove()
        mapInst.current = null
      }
    }
  }, [])

  return (
    <div style={{ position:'relative', borderRadius:16, overflow:'hidden', ...style }}>
      <div ref={mapRef} style={{ width:'100%', height:'100%' }}/>
      <div style={{ position:'absolute', top:10, left:10, background:'rgba(255,255,255,.95)', backdropFilter:'blur(8px)', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:600, color:'#18181b', zIndex:500, boxShadow:'0 2px 8px rgba(0,0,0,.1)' }}>
        📍 {(businesses||[]).filter(b=>getCityCoords(b.city)).length} biznese në hartë
      </div>
    </div>
  )
}

// ── SINGLE BUSINESS MAP ───────────────────────────────────
export function BusinessMap({ business, style }) {
  const mapRef  = useRef(null)
  const mapInst = useRef(null)

  useEffect(() => {
    if (!business) return
    const coords = getCityCoords(business.city)
    if (!coords) return

    let isMounted = true
    loadLeaflet().then(L => {
      if (!isMounted || !mapRef.current || mapInst.current) return

      mapInst.current = L.map(mapRef.current, {
        center: coords,
        zoom: 15,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(mapInst.current)

      const color = BIZ_COLORS[business.business_type] || '#18181b'
      const icon  = BIZ_ICONS[business.business_type] || '🏢'

      const customIcon = L.divIcon({
        html: `
          <div style="
            width:52px;height:52px;border-radius:50% 50% 50% 0;
            background:${color};border:4px solid #fff;
            box-shadow:0 4px 16px rgba(0,0,0,.3);
            display:flex;align-items:center;justify-content:center;
            font-size:24px;transform:rotate(-45deg);
          ">
            <span style="transform:rotate(45deg)">${icon}</span>
          </div>`,
        className:'',
        iconSize:[52,52],
        iconAnchor:[26,52],
        popupAnchor:[0,-56],
      })

      L.marker(coords, { icon: customIcon })
        .addTo(mapInst.current)
        .bindPopup(`
          <div style="font-family:'Geist',sans-serif;padding:4px">
            <div style="font-weight:700;font-size:14px">${business.name}</div>
            <div style="font-size:12px;color:#71717a;margin-top:4px">📍 ${business.city}${business.address?', '+business.address:''}</div>
            ${business.phone?`<div style="font-size:12px;margin-top:4px">📞 ${business.phone}</div>`:''}
          </div>
        `)
        .openPopup()

      // Add circle radius
      L.circle(coords, { radius:100, color, fillColor:color, fillOpacity:0.1, weight:1 })
        .addTo(mapInst.current)
    })

    return () => {
      isMounted = false
      if (mapInst.current) { mapInst.current.remove(); mapInst.current = null }
    }
  }, [business])

  return (
    <div style={{ borderRadius:14, overflow:'hidden', ...style }}>
      <div ref={mapRef} style={{ width:'100%', height:'100%' }}/>
    </div>
  )
}

export default ExploreMap
