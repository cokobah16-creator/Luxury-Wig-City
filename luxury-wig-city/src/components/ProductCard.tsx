import React from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../lib/database.types'
import { formatNaira } from '../lib/supabase'

interface ProductCardProps {
  product: Product
  index?:  number
}

/**
 * Stylized product card. Uses gradient/pattern backgrounds
 * with the brand mascot silhouette as the placeholder image —
 * swaps for real photos when Precious uploads vendor photography.
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const badgeColor = {
    'Bestseller':       'bg-gold text-burgundy',
    'New':              'bg-burgundy text-gold',
    'Limited':          'bg-black text-gold',
    "Editor's Pick":    'bg-gold text-burgundy'
  }[product.badge ?? 'Bestseller']

  const hero = product.images?.[0]
  const onSale = product.discount_price != null && product.discount_price < product.price
  const displayPrice    = onSale ? product.discount_price! : product.price
  const strikethrough   = onSale ? product.price : null

  return (
    <Link to={`/shop/${product.id}`} className="group lift block">
      <div className="relative aspect-[3/4] bg-burgundy rounded-sm overflow-hidden">
        {/* Brand pattern background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,215,0,0.4) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(255,215,0,0.25) 0%, transparent 50%)`
          }}
        />

        {hero ? (
          <img src={hero} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
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

        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-4 left-4 px-2 py-1 ${badgeColor} text-[10px] tracking-widest uppercase font-bold rounded`}>
            {product.badge}
          </div>
        )}

        {/* No. */}
        <div className="absolute top-4 right-4 font-serif italic text-offwhite/70 text-xs">
          No. {String(index + 1).padStart(2, '0')}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-burgundy-900 via-burgundy-900/80 to-transparent">
          <div className="text-[10px] tracking-[0.18em] uppercase text-gold/80 mb-1">{product.category}</div>
          <div className="font-serif text-offwhite text-xl font-semibold leading-tight">{product.name}</div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-gold font-bold text-sm">{formatNaira(displayPrice)}</span>
              {strikethrough && (
                <span className="text-offwhite/50 text-xs line-through">{formatNaira(strikethrough)}</span>
              )}
            </div>
            <div className="text-offwhite/70 text-xs">★ {product.rating}</div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-burgundy/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <span className="text-gold font-display text-2xl tracking-wider uppercase">View Details</span>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
