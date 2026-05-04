import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { ProductCard } from '../components/ProductCard'
import { Skeleton } from '../components/Skeleton'
import { Lightbox } from '../components/Lightbox'
import { useSeo, useJsonLd } from '../lib/useSeo'
import { useProduct, useProductReviews, useProducts, useCanReview, useMyReview } from '../lib/queries'
import { useAddToCart, useAddReview } from '../lib/mutations'
import { useAuth } from '../contexts/AuthContext'
import { formatNaira } from '../lib/supabase'
import { waLink } from '../lib/constants'

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: product, isLoading } = useProduct(id)
  const { data: reviews = [] } = useProductReviews(id)
  const { data: related = [] } = useProducts({
    category: product?.category,
    excludeId: id,
    limit: 4
  })
  const addToCart = useAddToCart()
  const addReview = useAddReview()
  const { data: canReview = false } = useCanReview(id)
  const { data: myReview } = useMyReview(id)

  const [activeImage, setActiveImage] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [qty,         setQty]         = useState(1)
  const [length,      setLength]      = useState<string>('')
  const [capSize,     setCapSize]     = useState<string>('')
  const [color,       setColor]       = useState<string>('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')

  useSeo({
    title:       product?.name,
    description: product?.description ?? undefined,
    image:       product?.images?.[0] ?? null
  })

  useJsonLd('product', product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images ?? [],
    sku: product.id,
    category: product.category,
    brand: product.vendor_name ? { '@type': 'Brand', name: product.vendor_name } : undefined,
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      priceCurrency: 'NGN',
      price: Number(product.discount_price ?? product.price),
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition'
    },
    aggregateRating: product.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating),
      reviewCount: product.review_count
    } : undefined
  } : null)

  useJsonLd('breadcrumb', product ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined },
      { '@type': 'ListItem', position: 2, name: 'Shop',     item: typeof window !== 'undefined' ? `${window.location.origin}/shop` : undefined },
      { '@type': 'ListItem', position: 3, name: product.category, item: typeof window !== 'undefined' ? `${window.location.origin}/shop?cat=${encodeURIComponent(product.category)}` : undefined },
      { '@type': 'ListItem', position: 4, name: product.name }
    ]
  } : null)

  if (isLoading) {
    return (
      <div className="bg-offwhite">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-8">
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 grid lg:grid-cols-2 gap-12" aria-busy="true" aria-label="Loading product">
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-10 w-40 mt-4" />
            <Skeleton className="h-24 w-full mt-4" />
            <div className="grid sm:grid-cols-2 gap-3 mt-6">
              <Skeleton className="h-12 w-full" rounded="full" />
              <Skeleton className="h-12 w-full" rounded="full" />
            </div>
          </div>
        </div>
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

  const images = product.images?.length ? product.images : []
  const avgRating = Number(product.rating).toFixed(1)

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/account')
      return
    }
    await addToCart.mutateAsync({
      product,
      quantity: qty,
      length:   length   || null,
      cap_size: capSize  || null,
      color:    color    || null
    })
  }

  return (
    <div className="bg-offwhite">
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
          <button
            type="button"
            onClick={() => images.length > 0 && setLightboxOpen(true)}
            disabled={images.length === 0}
            aria-label={images.length > 0 ? 'Open image gallery' : undefined}
            className="relative aspect-square bg-burgundy rounded-sm overflow-hidden mb-4 w-full block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
          >
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                loading="eager"
                decoding="async"
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
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
            {images.length > 0 && (
              <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-burgundy/80 text-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition" aria-hidden="true">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>
              </div>
            )}
          </button>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={activeImage === i || undefined}
                  className={`aspect-square rounded-sm overflow-hidden border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${activeImage === i ? 'border-gold' : 'border-transparent hover:border-burgundy/30'}`}
                >
                  <img src={src} alt="" loading="lazy" decoding="async" width={200} height={200} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">{product.category}</div>
          <h1 className="font-display uppercase text-burgundy text-5xl lg:text-6xl tracking-tight display-shadow leading-none">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mt-4 text-sm text-burgundy/70">
            {product.vendor_name && <span>by <span className="font-semibold text-burgundy">{product.vendor_name}</span></span>}
            {product.vendor_name && <span>·</span>}
            <span className="text-gold-600">★ {avgRating}</span>
            <span>({product.review_count} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-display text-burgundy text-4xl">{formatNaira(product.discount_price ?? product.price)}</span>
            {product.discount_price && (
              <span className="text-burgundy/40 text-xl line-through">{formatNaira(product.price)}</span>
            )}
          </div>

          {product.description && (
            <p className="mt-6 font-serif text-lg text-ink/80 leading-relaxed">{product.description}</p>
          )}

          {/* Variant pickers */}
          {product.lengths?.length > 0 && (
            <div className="mt-6">
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold mb-2">Length</div>
              <div className="flex flex-wrap gap-2">
                {product.lengths.map(l => (
                  <button key={l} onClick={() => setLength(l)}
                    className={`px-3 py-1.5 rounded-full text-xs border font-semibold transition ${length === l ? 'bg-burgundy text-offwhite border-burgundy' : 'border-burgundy/20 hover:border-burgundy'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.cap_sizes?.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold mb-2">Cap Size</div>
              <div className="flex flex-wrap gap-2">
                {product.cap_sizes.map(s => (
                  <button key={s} onClick={() => setCapSize(s)}
                    className={`px-3 py-1.5 rounded-full text-xs border font-semibold transition ${capSize === s ? 'bg-burgundy text-offwhite border-burgundy' : 'border-burgundy/20 hover:border-burgundy'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold mb-2">Color</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`px-3 py-1.5 rounded-full text-xs border font-semibold transition ${color === c ? 'bg-burgundy text-offwhite border-burgundy' : 'border-burgundy/20 hover:border-burgundy'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attributes */}
          {(product.length_inches || product.density || product.texture || product.lace_type || product.primary_color || product.hair_type) && (
            <div className="mt-8 grid grid-cols-2 gap-4 p-6 bg-pearl rounded-sm">
              {([
                product.length_inches ? ['Length',    `${product.length_inches}"`]  : null,
                product.density       ? ['Density',   `${product.density}%`]         : null,
                product.texture       ? ['Texture',   product.texture]               : null,
                product.lace_type     ? ['Lace Type', product.lace_type]             : null,
                product.primary_color ? ['Color',     product.primary_color]         : null,
                product.hair_type     ? ['Hair Type', product.hair_type]             : null
              ] as Array<[string, string] | null>).filter((x): x is [string, string] => x !== null).map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold">{k}</div>
                  <div className="text-burgundy font-semibold mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="mt-8 flex items-center gap-4">
            <span className="text-sm font-semibold text-burgundy uppercase tracking-wider">Qty</span>
            <div className="flex items-center border border-burgundy/20 rounded-full">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2 hover:bg-pearl">−</button>
              <span className="px-4 py-2 font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-4 py-2 hover:bg-pearl">+</button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="primary" size="lg" fullWidth onClick={handleAddToCart} disabled={addToCart.isPending}>
              {addToCart.isPending ? 'Adding…' : 'Add to Cart'}
            </Button>
            <Button to="/try-on" variant="secondary" size="lg" fullWidth>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"/></svg>
              Try This Wig (AI)
            </Button>
            <Button
              href={waLink(`Hi I'm interested in ${product.name}`)}
              variant="gold" size="lg" fullWidth className="sm:col-span-2"
            >
              Order via WhatsApp
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-burgundy/70">
            <span className="flex items-center gap-2"><span className="text-gold-600">✦</span> 100% Verified Vendor</span>
            <span className="flex items-center gap-2"><span className="text-gold-600">✦</span> Free Abuja Delivery</span>
            <span className="flex items-center gap-2"><span className="text-gold-600">✦</span> 7-Day Returns</span>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 border-t border-burgundy/10">
        <h2 className="font-display uppercase text-burgundy text-3xl mb-6">Customer Reviews</h2>

        {reviews.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {reviews.slice(0, 6).map(r => (
              <div key={r.id} className="bg-pearl p-5 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-burgundy text-sm">{r.customer_name ?? 'Customer'}</span>
                  <span className="text-gold-600 text-xs" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-burgundy/70 font-serif italic">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="font-serif italic text-burgundy/60 mb-10">No reviews yet. Be the first.</p>
        )}

        {/* Submission form */}
        {!user ? (
          <div className="bg-pearl p-6 rounded-sm flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-burgundy/80">Sign in to leave a review.</p>
            <Button to="/account" variant="primary" size="md">Sign in</Button>
          </div>
        ) : myReview ? (
          <div className="bg-pearl p-6 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] tracking-[0.2em] uppercase text-burgundy/60 font-bold">Your review</span>
              <span className="text-gold-600 text-sm" aria-label={`${myReview.rating} out of 5`}>{'★'.repeat(myReview.rating)}</span>
            </div>
            {myReview.comment && <p className="text-sm text-burgundy/80 font-serif italic">{myReview.comment}</p>}
          </div>
        ) : !canReview ? (
          <div className="bg-pearl p-6 rounded-sm">
            <p className="text-sm text-burgundy/70">Only verified purchasers can review this wig. Place an order and come back after delivery.</p>
          </div>
        ) : (
          <form
            onSubmit={async e => {
              e.preventDefault()
              if (!id) return
              await addReview.mutateAsync({ productId: id, rating: reviewRating, comment: reviewComment })
              setReviewComment('')
            }}
            className="bg-pearl p-6 rounded-sm max-w-2xl"
          >
            <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold mb-3">Rate this wig</div>
            <div className="flex items-center gap-1 mb-5" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={reviewRating === n}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  onClick={() => setReviewRating(n)}
                  className={`text-3xl leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm ${n <= reviewRating ? 'text-gold-600' : 'text-burgundy/20 hover:text-gold-600/60'}`}
                >★</button>
              ))}
            </div>
            <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Comment (optional)</label>
            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="What did you love? Anything to flag?"
              className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none"
            />
            <div className="mt-4">
              <Button type="submit" variant="primary" size="md" disabled={addReview.isPending}>
                {addReview.isPending ? 'Posting…' : 'Post review'}
              </Button>
            </div>
          </form>
        )}
      </section>


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

      {lightboxOpen && images.length > 0 && (
        <Lightbox
          images={images}
          alt={product.name}
          index={activeImage}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setActiveImage}
        />
      )}
    </div>
  )
}

export default ProductDetail
