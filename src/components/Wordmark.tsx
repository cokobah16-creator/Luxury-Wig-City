import React from 'react'

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'burgundy' | 'gold' | 'offwhite'
  variant?: 'stacked' | 'inline'
  className?: string
}

const sizeMap = { sm: '22px', md: '36px', lg: 'clamp(56px,8vw,110px)' }
const colorMap = { burgundy: '#800020', gold: '#FFD700', offwhite: '#FDFFFC' }

// Matches the design-system HTML spec exactly:
//   l u✦ x u r y   w i g ✦   c i t y
// ✦ after first u in "luxury" (position:absolute right:-0.05em)
// ✦ after "wig"               (position:absolute top:-0.2em right:-0.5em)
export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'md',
  color = 'burgundy',
  variant = 'inline',
  className = ''
}) => {
  const fs  = sizeMap[size]
  const col = colorMap[color]
  const starSz = `calc(${fs} * 0.30)`

  const base: React.CSSProperties = {
    fontFamily: "'Italiana','Cormorant Garamond',serif",
    fontStyle:  'italic',
    letterSpacing: '0.02em',
    lineHeight: 0.9,
    color: col,
    fontSize: fs
  }

  if (variant === 'stacked') {
    return (
      <div className={className} style={{ ...base, display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        <span>luxury</span>
        <span style={{ position: 'relative' }}>
          wig city
          <span style={{ position: 'absolute', top: '-0.2em', right: '-0.5em', fontSize: starSz, color: col, lineHeight: 1 }}>✦</span>
        </span>
      </div>
    )
  }

  return (
    <div className={className} style={{ ...base, display: 'inline-flex', alignItems: 'baseline', gap: '0.32em', whiteSpace: 'nowrap' }}>
      <span>
        l<span style={{ position: 'relative' }}>u<span style={{ position: 'absolute', right: '-0.05em', fontSize: starSz, color: col, lineHeight: 1 }}>✦</span></span>xury
      </span>
      <span style={{ position: 'relative' }}>
        wig<span style={{ position: 'absolute', top: '-0.2em', right: '-0.5em', fontSize: starSz, color: col, lineHeight: 1 }}>✦</span>
      </span>
      <span>city</span>
    </div>
  )
}

export default Wordmark
