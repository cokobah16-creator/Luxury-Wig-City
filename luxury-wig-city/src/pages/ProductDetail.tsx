import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { wigs, formatNaira } from '../data/wigs'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { ProductCard } from '../components/ProductCard'

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const wig = wigs.find(w => w.id === id)
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)

  if (!wig) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display uppercase text-burgundy text-5xl mb-4">Wig Not Found</h1>
        <Link to="/shop" className="text-burgundy underline">Back to shop</Link>
      </div>
    )
  }

  const related = wigs.filter(w => w.id !== wig.id && w.category === wig.category).slice(0, 4)

  return (
    <div className="bg-offwhite">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 text-sm text-burgundy/60">
        <Link to="/" className="hover:text-burgundy">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-burgundy">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-burgundy">{wig.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 grid lg:grid-cols-2 gap-12">
        {/* GALLERY */}
        <div>
          {/* Main image */}
          <div className="relative aspect-square bg-burgundy rounded-sm overflow-hidden mb-4">
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: `radial-gradient(circle at ${30 + activeImage * 15}% 30%, rgba(255,215,0,0.4) 0%, transparent 50%)`
            }} />
            <Logo size={500} variant="mono-gold" className="absolute inset-0 m-auto opacity-40" />
            {wig.badge && (
              <div className="absolute top-6 left-6 px-3 py-1.5 bg-gold text-burgundy text-[11px] tracking-widest uppercase font-bold rounded">
                {wig.badge}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map(i => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-square bg-burgundy rounded-sm overflow-hidden border-2 ${activeImage === i ? 'border-gold' : 'border-transparent'}`}
              >
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `radial-gradient(circle at ${30 + i * 15}% 30%, rgba(255,215,0,0.4) 0%, transparent 50%)`
                }} />
                <Logo size={100} variant="mono-gold" className="opacity-60 m-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">{wig.category}</div>
          <h1 className="font-display uppercase text-burgundy text-5xl lg:text-6xl tracking-tight display-shadow leading-none">
            {wig.name}
          </h1>

          {/* Vendor + rating */}
          <div className="flex items-center gap-4 mt-4 text-sm text-burgundy/70">
            <span>by <span className="font-semibold text-burgundy">{wig.vendor}</span></span>
            <span>·</span>
            <span className="text-gold-600">★ {wig.rating}</span>
            <span>({wig.reviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-display text-burgundy text-4xl">{formatNaira(wig.price)}</span>
            {wig.oldPrice && (
              <span className="text-burgundy/40 text-xl line-through">{formatNaira(wig.oldPrice)}</span>
            )}
          </div>

          {/* Description */}
          <p className="mt-6 font-serif text-lg text-ink/80 leading-relaxed">{wig.description}</p>

          {/* Attributes grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 p-6 bg-pearl rounded-sm">
            {[
              ['Length', `${wig.length}"`],
              ['Density', `${wig.density}%`],
              ['Texture', wig.texture],
              ['Lace Type', wig.laceType],
              ['Color', wig.color],
              ['Hair Type', wig.hairType]
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold">{k}</div>
                <div className="text-burgundy font-semibold mt-0.5">{v}</div>
              </div>
            ))}
          </div>

          {/* Quantity */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-semibold text-burgundy uppercase tracking-wider">Quantity</span>
            <div className="flex items-center border border-burgundy/20 rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-pearl">−</button>
              <span className="px-4 py-2 font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-pearl">+</button>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="primary" size="lg" fullWidth>
              Add to Cart
            </Button>
            <Button to="/try-on" variant="secondary" size="lg" fullWidth>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"/></svg>
              Try This Wig (AI)
            </Button>
            <Button
              href={`https://wa.me/2348000000000?text=Hi%20I'm%20interested%20in%20${encodeURIComponent(wig.name)}`}
              variant="gold"
              size="lg"
              fullWidth
              className="sm:col-span-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4zM12 22c-1.7 0-3.4-.5-4.9-1.4L3 22l1.4-4.1C3.5 16.4 3 14.7 3 13c0-5 4-9 9-9s9 4 9 9-4 9-9 9z"/></svg>
              Order via WhatsApp
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-burgundy/70">
            <span className="flex items-center gap-2"><span className="text-gold-600">✦</span> 100% Verified Vendor</span>
            <span className="flex items-center gap-2"><span className="text-gold-600">✦</span> Free Abuja Delivery</span>
            <span className="flex items-center gap-2"><span className="text-gold-600">✦</span> 7-Day Returns</span>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-pearl py-16 lg:py-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <h2 className="font-display uppercase text-burgundy text-4xl lg:text-5xl mb-8 display-shadow">You May Also Love</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((w, i) => <ProductCard key={w.id} wig={w} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetail
