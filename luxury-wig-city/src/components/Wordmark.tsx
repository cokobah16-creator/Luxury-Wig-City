import React from 'react'

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'burgundy' | 'gold' | 'offwhite'
  variant?: 'stacked' | 'inline'
  brand?: 'luxury wigs' | 'luxury wig city'
  className?: string
}

const sizeMap = {
  sm: { wrap: 'leading-[0.8]', top: 'text-[20px]', bot: 'text-[20px]' },
  md: { wrap: 'leading-[0.78]', top: 'text-[36px]', bot: 'text-[36px]' },
  lg: { wrap: 'leading-[0.8]', top: 'text-[80px] sm:text-[110px]', bot: 'text-[80px] sm:text-[110px]' }
}
const colorMap = {
  burgundy: 'text-burgundy',
  gold: 'text-gold',
  offwhite: 'text-offwhite'
}

/**
 * Recreated "luxury wigs" stacked wordmark using Italiana — a fashion serif
 * that approximates the custom decorative serif in Precious's brand mark,
 * with sparkle accents in the letterforms.
 */
export const Wordmark: React.FC<WordmarkProps> = ({
  size = 'md',
  color = 'burgundy',
  variant = 'stacked',
  brand = 'luxury wigs',
  className = ''
}) => {
  const s = sizeMap[size]
  const c = colorMap[color]

  if (variant === 'inline' || brand === 'luxury wig city') {
    return (
      <div className={`font-wordmark ${c} ${className} flex items-baseline gap-2 whitespace-nowrap`}>
        <span className={`${s.top} italic`}>luxury</span>
        <span className={`${s.bot} italic relative`}>
          {brand === 'luxury wig city' ? 'wig city' : 'wigs'}
          <span className="absolute -top-1 -right-2 text-[0.4em] opacity-90">✦</span>
        </span>
      </div>
    )
  }

  return (
    <div className={`font-wordmark ${c} ${className} ${s.wrap} inline-flex flex-col items-center text-center`}>
      <span className={`${s.top} italic relative`}>
        l<span className="relative">u<span className="absolute -top-2 right-0 text-[0.25em]">✦</span></span>x<span className="relative">u<span className="absolute -bottom-1 right-0 text-[0.2em]">✦</span></span>r<span className="relative">y</span>
      </span>
      <span className={`${s.bot} italic relative -mt-1 sm:-mt-2`}>
        wig<span className="relative">s<span className="absolute -bottom-1 -right-2 text-[0.22em]">✦</span></span>
      </span>
    </div>
  )
}

export default Wordmark
