import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { ProductCard } from '../components/ProductCard'
import { useProduct, useProductReviews, useProducts } from '../lib/queries'
import { useAddToCart } from '../lib/mutations'
import { useAuth } from '../contexts/AuthContext'
import { formatNaira } from '../lib/supabase'

const ProductDetail: React.FC = () => {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const { data: product,  isLoading } = useProduct(id)
  const { data: reviews = [] }        = useProductReviews(id)
  const { data: related = [] }        = useProducts({
    category:  product?.category ?? null,
    excludeId: id,
    limit:     4
  })

  const [activeImage, setActiveImage] = useState(0)
  const [qty,         setQty]         = useState(1)
  const [pickedLength,  setPickedLength]  = useState<string | null>(null)
  const [pickedCapSize, setPickedCapSize] = useState<string | null>(null)
  const [pickedColor,   setPickedColor]   = useState<string | null>(null)

  // Default the variant pickers to the first option when the product loads.
  useEffect(() => {
    if (!product) return
    setPickedLength(prev  => prev  ?? product.lengths?.[0]   ?? null)
    setPickedCapSize(prev => prev  ?? product.cap_sizes?.[0] ?? null)
    setPickedColor(prev   => prev  ?? product.colors?.[0]    ?? null)
  }, [product])

  const addToCart = useAddToCart(user?.id)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <Logo size={80} variant="gold-on-burgundy" className="mx-auto animate-pulse" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="font-display uppercase text-burgundy text-5xl mb-4">Wig Not Found</h1>
        <Link to="/shop" className="text-burgundy underline">Back to shop</Link>
      </div>
    )
  }

  const onAddToCart = () => {
    if (!user) {
      toast.info('Sign in to save your bag.')
      navigate('/account')
      return
    }
    addToCart.mutate(
      {
        product,
        quantity: qty,
        length:   pickedLength,
        cap_size: pickedCapSize,
        color:    pickedColor
      },
      {
        onSuccess: () => toast.success(`Added ${qty} × ${product.name} to your bag.`),
        onError:   e  => toast.error(e instanceof Error ? e.message : 'Could not add to cart.')
      }
    )
  }

  const onSale = product.discount_price != null && product.discount_price < product.price
  const heroPrice    = onSale ? product.discount_price! : product.price
  const oldPrice     = onSale ? product.price : null
  const heroImage    = product.images?.[activeImage]

  return (
    <div className="bg-offwhite">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8 text-sm text-burgundy/60">
        <Link to="/" className="hover:text-burgundy">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-burgundy">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-burgundy">{product.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 grid lg:grid-cols-2 gap-12">
        {/* GALLERY */}
        <div>
          <div className="relative aspect-square bg-burgundy rounded-sm overflow-hidden mb-4">
            {heroImage ? (
              <img src={heroImage} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `radial-gradient(circle at ${30 + activeImage * 15}% 30%, rgba(255,215,0,0.4) 0%, transparent 50%)`
                }} />
                <Logo size={500} variant="mono-gold" className="absolute inset-0 m-auto opacity-40" />
              </>
            )}
            {product.badge && (
              <div className="absolute top-6 left-6 px-3 py-1.5 bg-gold text-burgundy text-[11px] tracking-widest uppercase font-bold rounded">
                {product.badge}
              </div>
            )}
          </div>

          {/* Thumbnails — fall back to 4 placeholder tiles when no images yet */}
          <div className="grid grid-cols-4 gap-3">
            {(product.images?.length ? product.images : [null, null, null, null]).slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-square bg-burgundy rounded-sm overflow-hidden border-2 ${activeImage === i ? 'border-gold' : 'border-transparent'}`}
              >
                {img ? (
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `radial-gradient(circle at ${30 + i * 15}% 30%, rgba(255,215,0,0.4) 0%, transparent 50%)`
                    }} />
                    <Logo size={100} variant="mono-gold" className="opacity-60 m-auto" />
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">{product.category}</div>
          <h1 className="font-display uppercase text-burgundy text-5xl lg:text-6xl tracking-tight display-shadow leading-none">
            {product.name}
          </h1>

          {/* Vendor + rating */}
          <div className="flex items-center gap-4 mt-4 text-sm text-burgundy/70">
            {product.vendor_name && (
              <>
                <span>by <span className="font-semibold text-burgundy">{product.vendor_name}</span></span>
                <span>·</span>
              </>
            )}
            <span className="text-gold-600">★ {product.rating}</span>
            <span>({product.review_count} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-display text-burgundy text-4xl">{formatNaira(heroPrice)}</span>
            {oldPrice && (
              <span className="text-burgundy/40 text-xl line-through">{formatNaira(oldPrice)}</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="mt-6 font-serif text-lg text-ink/80 leading-relaxed">{product.description}</p>
          )}

          {/* Attributes grid */}
          <div className="mt-8 grid grid-cols-2 gap-4 p-6 bg-pearl rounded-sm">
            {[
              ['Length',     product.length_inches ? `${product.length_inches}"` : '—'],
              ['Density',    product.density       ? `${product.density}%`       : '—'],
              ['Texture',    product.texture       ?? '—'],
              ['Lace Type',  product.lace_type     ?? '—'],
              ['Color',      product.primary_color ?? '—'],
              ['Hair Type',  product.hair_type     ?? '—']
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold">{k}</div>
                <div className="text-burgundy font-semibold mt-0.5">{v}</div>
              </div>
            ))}
          </div>

          {/* Variants */}
          {(product.lengths.length > 0 || product.cap_sizes.length > 0 || product.colors.length > 0) && (
            <div className="mt-8 space-y-4">
              {product.lengths.length > 0 && (
                <Picker label="Length"   options={product.lengths}   value={pickedLength}  onChange={setPickedLength}  />
              )}
              {product.cap_sizes.length > 0 && (
                <Picker label="Cap Size" options={product.cap_sizes} value={pickedCapSize} onChange={setPickedCapSize} />
              )}
              {product.colors.length > 0 && (
                <Picker label="Color"    options={product.colors}    value={pickedColor}   onChange={setPickedColor}   />
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-semibold text-burgundy uppercase tracking-wider">Quantity</span>
            <div className="flex items-center border border-burgundy/20 rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-pearl">−</button>
              <span className="px-4 py-2 font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-pearl">+</button>
            </div>
            {product.stock > 0 && (
              <span className="text-xs text-burgundy/60">{product.stock} in stock</span>
            )}
          </div>

          {/* CTAs */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={onAddToCart} disabled={addToCart.isPending || product.stock === 0}>
              {addToCart.isPending ? 'Adding…' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button to="/try-on" variant="secondary" size="lg" fullWidth>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"/></svg>
              Try This Wig (AI)
            </Button>
            <Button
              href={`https://wa.me/2348000000000?text=Hi%20I'm%20interested%20in%20${encodeURIComponent(product.name)}`}
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

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="bg-offwhite py-12">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <h2 className="font-display uppercase text-burgundy text-3xl mb-6">Reviews</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {reviews.slice(0, 6).map(r => (
                <div key={r.id} className="p-5 bg-pearl rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-burgundy">{r.customer_name ?? 'Anonymous'}</div>
                    <div className="text-gold-600 text-sm">★ {r.rating}</div>
                  </div>
                  {r.comment && <p className="text-sm text-burgundy/80">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-pearl py-16 lg:py-24">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <h2 className="font-display uppercase text-burgundy text-4xl lg:text-5xl mb-8 display-shadow">You May Also Love</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

const Picker: React.FC<{
  label:    string
  options:  string[]
  value:    string | null
  onChange: (v: string) => void
}> = ({ label, options, value, onChange }) => (
  <div>
    <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold mb-2">{label}</div>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            value === opt
              ? 'bg-burgundy text-offwhite border-burgundy'
              : 'bg-pearl text-burgundy border-burgundy/20 hover:border-burgundy'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
)

export default ProductDetail
