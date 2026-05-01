import React from 'react'

interface LogoProps {
  size?: number
  variant?: 'burgundy-on-gold' | 'gold-on-burgundy' | 'gold-on-dark' | 'mono-burgundy' | 'mono-gold'
  className?: string
}

// Photo variants use real brand photography (circular crop, solid bg included).
// Mono / transparent variants use the SVG line-art medallion for overlays + decorations.
export const Logo: React.FC<LogoProps> = ({
  size = 80,
  variant = 'gold-on-burgundy',
  className = ''
}) => {
  if (variant === 'gold-on-burgundy') {
    return (
      <img
        src="/medallion-on-burgundy.jpeg"
        alt="Luxury Wig City"
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  if (variant === 'burgundy-on-gold') {
    return (
      <img
        src="/medallion-on-gold.jpeg"
        alt="Luxury Wig City"
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  // SVG line-art for transparent / decorative / mono variants
  const palette = {
    'gold-on-dark':  { bg: 'transparent', fg: '#FFD700' },
    'mono-burgundy': { bg: 'transparent', fg: '#800020' },
    'mono-gold':     { bg: 'transparent', fg: '#FFD700' }
  }[variant] ?? { bg: 'transparent', fg: '#FFD700' }

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Luxury Wig City"
    >
      <circle cx="100" cy="100" r="92" fill="none" stroke={palette.fg} strokeWidth="2.5" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={palette.fg} strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="100" cy="108" rx="20" ry="28" fill="none" stroke={palette.fg} strokeWidth="2.2" />
      <path d="M 86 102 Q 91 100 96 102" stroke={palette.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 85 99 L 84 96 M 88 98 L 87.5 95 M 91 98 L 91 95 M 94 98 L 94.5 95" stroke={palette.fg} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 104 102 Q 109 100 114 102" stroke={palette.fg} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 106 98 L 105.5 95 M 109 98 L 109 95 M 112 98 L 112.5 95 M 115 99 L 116 96" stroke={palette.fg} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M 100 110 Q 98 118 100 122" stroke={palette.fg} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M 95 130 Q 100 132 105 130" stroke={palette.fg} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M 80 85 Q 60 70 50 80 Q 55 95 70 100 Q 60 110 55 130 Q 65 135 78 125" fill="none" stroke={palette.fg} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 78 90 Q 68 85 60 92 M 75 105 Q 68 110 64 120" stroke={palette.fg} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 65 85 L 63 105 M 70 95 L 68 115 M 75 102 L 73 122" stroke={palette.fg} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 120 85 Q 140 70 150 80 Q 145 95 130 100 Q 140 110 145 130 Q 135 135 122 125" fill="none" stroke={palette.fg} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M 122 90 Q 132 85 140 92 M 125 105 Q 132 110 136 120" stroke={palette.fg} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 135 85 L 137 105 M 130 95 L 132 115 M 125 102 L 127 122" stroke={palette.fg} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M 90 76 Q 100 70 110 76" stroke={palette.fg} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 95 80 L 95 88 M 100 78 L 100 88 M 105 80 L 105 88" stroke={palette.fg} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
      <text x="42" y="60" fontSize="10" fill={palette.fg} fontFamily="serif">✦</text>
      <text x="150" y="60" fontSize="10" fill={palette.fg} fontFamily="serif">✦</text>
      <text x="100" y="178" fontSize="8" fill={palette.fg} fontFamily="serif" textAnchor="middle">✦</text>
    </svg>
  )
}

export default Logo
