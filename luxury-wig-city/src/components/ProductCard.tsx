import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../lib/database.types'
import { formatNaira } from '../lib/supabase'

interface ProductCardProps {
  product: Product
  index?: number
}

const badgeStyle: Record<string, string> = {
  'Bestseller':    'bg-gold text-ink-soft',
  'New':           'bg-burgundy text-gold',
  'Limited':       'bg-ink-soft text-gold',
  "Editor's Pick": 'bg-gold text-ink-soft'
}

/**
 * Luxury Wig City product card. 3:4 portrait, 2 px radius, full-bleed photo
 * with dark scrim, gold pill badge top-left, italic Cormorant "No. 0n"
 * top-right. Hover lifts 6 px with deeper shadow + brightness bump.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const hero = product.images?.[0]
  const onSale = product.discount_price != null && product.discount_price < product.price
  const displayPrice  = onSale ? product.discount_price! : product.price
  const strikethrough = onSale ? product.price : null
  const badgeCls = badgeStyle[product.badge ?? 'Bestseller'] ?? 'bg-gold text-ink-soft'

  return (
    <Link
      to={`/shop/${product.id}`}
      className="group lift block rounded-sm shadow-card hover:shadow-lift hover:brightness-[1.04]"
    >
      <div className="relative aspect-[3/4] bg-burgundy-900 rounded-sm overflow-hidden">
        {/* Burgundy → amber radial gradient base + subtle grain */}
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.40) 0%, transparent 55%), radial-gradient(circle at 75% 75%, rgba(128,0,32,0.85) 0%, rgba(26,0,6,0.95) 70%)'
          }}
        />

        {hero ? (
          <img src={hero} alt={product.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        ) : (
          <svg viewBox="0 0 200 270" className="absolute inset-0 w-full h-full opacity-90" preserveAspectRatio="xMidYMid slice">
            <path
              d={
                product.texture === 'Curly' ? 'M 40 130 Q 35 60 100 40 Q 165 60 160 130 Q 175 220 150 265 L 50 265 Q 25 220 40 130 Z'
                : product.texture === 'Wavy'  ? 'M 50 125 Q 45 55 100 40 Q 155 55 150 125 Q 165 215 145 265 L 55 265 Q 35 215 50 125 Z'
                : product.texture === 'Kinky' ? 'M 35 115 Q 30 50 100 35 Q 170 50 165 115 Q 180 215 155 265 L 45 265 Q 20 215 35 115 Z'
                : 'M 55 130 Q 50 65 100 50 Q 150 65 145 130 Q 160 215 140 265 L 60 265 Q 40 215 55 130 Z'
              }
              fill="#1A0006"
              opacity="0.7"
            />
            <ellipse cx="100" cy="145" rx="30" ry="38" fill="#5A2828" opacity="0.6" />
            {product.texture === 'Curly' && (
              <>
                <path d="M 50 200 Q 30 240 35 265" stroke="#0A0506" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.7" />
                <path d="M 150 200 Q 170 240 165 265" stroke="#0A0506" strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.7" />
              </>
            )}
            <path d="M 60 90 Q 100 70 140 90" stroke="#FFD700" strokeWidth="0.8" fill="none" opacity="0.4" />
          </svg>
        )}

        {/* Subtle film grain overlay (mix-blend overlay) */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.07  0 0 0 0 0.0  0 0 0 0 0.02  0 0 0 0.32 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
          }}
        />

        {/* Badge */}
        {product.badge && (
          <div
            className={`absolute top-4 left-4 px-3 py-1.5 ${badgeCls} text-[11px] tracking-uppercase uppercase font-bold rounded-md shadow-soft`}
          >
            {product.badge}
          </div>
        )}

        {/* No. */}
        <div className="absolute top-4 right-4 font-serif italic text-gold/85 text-sm">
          No. {String(index + 1).padStart(2, '0')}
        </div>

        {/* Bottom scrim — black gradient with gold/serif/price typography */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 pt-16 bg-gradient-to-t from-black/95 via-black/80 to-transparent">
          <div className="text-[11px] tracking-eyebrow uppercase font-semibold text-gold mb-1.5">
            {product.category}
          </div>
          <div className="font-serif text-offwhite text-2xl lg:text-[28px] font-medium leading-[1.05] mb-3">
            {product.name}
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-gold font-bold text-[22px] tracking-tight">{formatNaira(displayPrice)}</span>
              {strikethrough && (
                <span className="text-offwhite/55 text-xs line-through">{formatNaira(strikethrough)}</span>
              )}
            </div>
            <div className="text-offwhite text-sm flex items-center gap-1.5">
              <span className="text-gold">★</span>
              <span>{product.rating}</span>
            </div>
          </div>
        </div>

        {/* Hover headline overlay — kept subtle so the photo still leads */}
        <div className="absolute inset-0 bg-burgundy/0 group-hover:bg-burgundy/35 transition-colors duration-500 ease-luxe flex items-center justify-center pointer-events-none">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-luxe text-gold font-display text-2xl tracking-wider uppercase">
            View Details
          </span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
