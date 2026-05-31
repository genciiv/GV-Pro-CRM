// src/components/VaqoLogo.jsx
// Logo SVG e Vaqo — përdor kudo në vend të emoji 💪

export function VaqoIcon({ size=36, className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="vaqo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b"/>
          <stop offset="100%" stopColor="#27272a"/>
        </linearGradient>
        <linearGradient id="vaqo-v" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      {/* Background */}
      <rect width="100" height="100" rx="22" fill="url(#vaqo-bg)"/>
      {/* Left arm — violet */}
      <polygon points="18,28 34,28 50,68 42,68" fill="url(#vaqo-v)"/>
      {/* Right arm — white */}
      <polygon points="66,28 82,28 58,68 50,68" fill="white" opacity="0.92"/>
      {/* Gold bar */}
      <rect x="18" y="72" width="64" height="5" rx="2.5" fill="#c8a96e"/>
    </svg>
  )
}

export function VaqoLogo({ size='md', dark=false, className='' }) {
  const sizes = { sm: 28, md: 36, lg: 48, xl: 64 }
  const iconSize = sizes[size] || sizes.md
  const textSizes = { sm:'16px', md:'22px', lg:'28px', xl:'36px' }
  const textSize = textSizes[size] || textSizes.md

  return (
    <div style={{ display:'flex', alignItems:'center', gap: iconSize*0.28 }} className={className}>
      <VaqoIcon size={iconSize}/>
      <span style={{
        fontSize: textSize,
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontWeight: 900,
        letterSpacing: '-0.03em',
        color: dark ? '#ffffff' : '#18181b',
        lineHeight: 1,
        userSelect: 'none',
      }}>
        Vaqo
      </span>
    </div>
  )
}

export function VaqoFavicon({ size=32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fav-v" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="#18181b"/>
      <polygon points="5.5,8.5 10.5,8.5 16,22 13,22" fill="url(#fav-v)"/>
      <polygon points="21.5,8.5 26.5,8.5 19,22 16,22" fill="white" opacity="0.9"/>
      <rect x="5.5" y="23.5" width="21" height="2" rx="1" fill="#c8a96e"/>
    </svg>
  )
}

export default VaqoLogo
