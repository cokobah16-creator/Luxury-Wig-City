import React, { useState, useMemo, useRef } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { BeforeAfter } from '../components/BeforeAfter'
import { Skeleton } from '../components/Skeleton'
import { useProducts, useProduct, useMyTryOns } from '../lib/queries'
import { useGenerateTryOn, useDeleteTryOn, useAddToCart } from '../lib/mutations'
import { useAuth } from '../contexts/AuthContext'
import { formatNaira } from '../lib/supabase'
import { useSeo } from '../lib/useSeo'
import type { Product } from '../lib/database.types'

type Step = 'photo' | 'wig' | 'consent' | 'generating' | 'result'

const PHOTO_GUIDELINES = [
  'Front-facing, eyes to camera',
  'Forehead and hairline visible',
  'Even daylight if possible',
  'No sunglasses or hats',
  'No filters or heavy makeup'
]

const TryOn: React.FC = () => {
  useSeo({
    title: 'AI Wig Mirror',
    description: 'See yourself in any wig before you buy. Upload a photo, choose a style, and our AI shows you the look in seconds.'
  })

  const { user } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const preselectedProductId = params.get('product')

  // ── Flow state ────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('photo')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [selectedWig, setSelectedWig] = useState<Product | null>(null)
  const [consent, setConsent] = useState(false)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Data ──────────────────────────────────────────────────────────────
  const { data: catalog = [], isLoading: catalogLoading } = useProducts({ limit: 30 })
  const { data: preselectedProduct } = useProduct(preselectedProductId ?? undefined)
  const { data: history = [] } = useMyTryOns()
  const generate = useGenerateTryOn()
  const deleteLook = useDeleteTryOn()
  const addToCart = useAddToCart()

  // Auto-select the wig from the URL if provided, and skip ahead in the flow
  React.useEffect(() => {
    if (preselectedProduct && !selectedWig) setSelectedWig(preselectedProduct)
  }, [preselectedProduct, selectedWig])

  const wigToTry = selectedWig ?? preselectedProduct ?? null
  const canSubmit = !!photo && !!wigToTry && consent && !generate.isPending

  // ── Handlers ──────────────────────────────────────────────────────────
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
    setStep('wig')
  }

  const reset = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhoto(null)
    setPhotoPreview(null)
    setSelectedWig(null)
    setConsent(false)
    setResultUrl(null)
    setStep('photo')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleGenerate = async () => {
    if (!photo || !wigToTry) return
    setStep('generating')
    try {
      const res = await generate.mutateAsync({ file: photo, productId: wigToTry.id })
      setResultUrl(res.generated_url)
      setStep('result')
    } catch {
      setStep('consent')
    }
  }

  const handleAddToCart = async () => {
    if (!wigToTry) return
    await addToCart.mutateAsync({ product: wigToTry })
    navigate('/cart')
  }

  // ── Auth gate ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="bg-offwhite">
        <Hero />
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display uppercase text-burgundy text-3xl mb-4">Sign in to use the AI Wig Mirror</h2>
          <p className="font-serif italic text-burgundy/60 mb-6">
            Your photos are kept private to your account. We never sell or train on them.
          </p>
          <Button to="/account" variant="primary" size="lg">Sign in</Button>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-offwhite">
      <Hero />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <Stepper step={step} hasResult={!!resultUrl} />

        <div className="mt-10 grid lg:grid-cols-12 gap-10">
          {/* ──────────────── Left: stage ──────────────── */}
          <div className="lg:col-span-8">
            {step === 'photo' && (
              <PhotoUploader fileInputRef={fileInputRef} onPhoto={handlePhoto} />
            )}

            {(step === 'wig' || step === 'consent') && photoPreview && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="aspect-[4/5] bg-pearl rounded-sm overflow-hidden relative">
                  <img src={photoPreview} alt="Your selfie" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={reset}
                    className="absolute bottom-3 left-3 bg-burgundy/80 hover:bg-burgundy text-offwhite text-xs px-3 py-1.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    Change photo
                  </button>
                </div>
                <div className="aspect-[4/5] bg-pearl rounded-sm overflow-hidden flex items-center justify-center">
                  {wigToTry?.images?.[0] ? (
                    <img src={wigToTry.images[0]} alt={wigToTry.name} className="w-full h-full object-cover" />
                  ) : wigToTry ? (
                    <div className="text-center px-6">
                      <Logo size={120} variant="mono-burgundy" className="mx-auto opacity-40" />
                      <div className="mt-4 font-display uppercase text-burgundy text-xl">{wigToTry.name}</div>
                      <div className="text-xs text-burgundy/60 mt-1">{wigToTry.category}</div>
                    </div>
                  ) : (
                    <div className="text-center text-burgundy/50 px-6">
                      <div className="text-[11px] tracking-[0.3em] uppercase font-bold">Step 2</div>
                      <div className="font-display uppercase text-burgundy/70 text-2xl mt-2">Pick a wig →</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 'generating' && photoPreview && (
              <div className="aspect-[4/5] bg-burgundy rounded-sm overflow-hidden relative flex items-center justify-center">
                <img src={photoPreview} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                <div className="relative text-center text-offwhite">
                  <Logo size={96} variant="gold-on-burgundy" className="mx-auto mb-6 animate-pulse" />
                  <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-2">— AI Wig Mirror —</div>
                  <div className="font-display uppercase text-gold text-3xl mb-2">Styling your look…</div>
                  <p className="font-serif italic text-offwhite/70 max-w-xs mx-auto text-sm">
                    Our AI is preserving your face and blending the lace front. This usually takes 20–40 seconds.
                  </p>
                </div>
              </div>
            )}

            {step === 'result' && photoPreview && resultUrl && (
              <ResultStage
                beforeSrc={photoPreview}
                afterSrc={resultUrl}
                onAddToCart={handleAddToCart}
                onTryAnother={() => { setSelectedWig(null); setResultUrl(null); setStep('wig') }}
                onStartOver={reset}
                product={wigToTry}
                addingToCart={addToCart.isPending}
              />
            )}
          </div>

          {/* ──────────────── Right: side panel ──────────────── */}
          <aside className="lg:col-span-4 space-y-6">
            {step === 'photo' && <PhotoTips />}

            {step === 'wig' && (
              <WigPicker
                catalog={catalog}
                loading={catalogLoading}
                selectedId={wigToTry?.id ?? null}
                onPick={(p) => { setSelectedWig(p); setStep('consent') }}
              />
            )}

            {step === 'consent' && wigToTry && (
              <ConsentPanel
                product={wigToTry}
                consent={consent}
                onConsent={setConsent}
                onGenerate={handleGenerate}
                canSubmit={canSubmit}
                onBack={() => setStep('wig')}
              />
            )}

            {step === 'generating' && (
              <div className="bg-pearl p-6 rounded-sm space-y-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            )}

            {step === 'result' && wigToTry && (
              <SummaryCard product={wigToTry} />
            )}
          </aside>
        </div>

        {history.length > 0 && (
          <SavedLooks
            items={history}
            onDelete={(id) => deleteLook.mutate(id)}
          />
        )}
      </div>
    </div>
  )
}

// =====================================================================
// Sub-components
// =====================================================================

const Hero: React.FC = () => (
  <section className="bg-burgundy text-offwhite py-14 lg:py-20 relative overflow-hidden">
    <Logo size={400} variant="mono-gold" className="absolute -top-20 -right-20 opacity-[0.08]" />
    <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
      <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— AI Wig Mirror —</div>
      <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
        See It Before You Wear It
      </h1>
      <p className="font-serif italic text-offwhite/80 text-lg mt-4 max-w-2xl">
        Upload a clear selfie, pick any wig from our catalog, and our AI generates a realistic preview — your face stays exactly as it is.
      </p>
    </div>
  </section>
)

const Stepper: React.FC<{ step: Step; hasResult: boolean }> = ({ step, hasResult }) => {
  const steps = [
    { id: 'photo',   label: 'Upload selfie' },
    { id: 'wig',     label: 'Choose a wig' },
    { id: 'consent', label: 'Confirm' },
    { id: 'result',  label: 'Your look' }
  ] as const

  const currentIdx = (() => {
    if (step === 'photo') return 0
    if (step === 'wig') return 1
    if (step === 'consent') return 2
    if (step === 'generating' || step === 'result') return 3
    return 0
  })()

  return (
    <ol className="flex flex-wrap items-center gap-3 text-sm">
      {steps.map((s, i) => {
        const isDone = i < currentIdx || (s.id === 'result' && hasResult && step === 'result')
        const isCurrent = i === currentIdx
        return (
          <React.Fragment key={s.id}>
            <li className={`flex items-center gap-2 ${isCurrent ? 'text-burgundy font-semibold' : isDone ? 'text-burgundy/80' : 'text-burgundy/40'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isDone    ? 'bg-burgundy text-gold' :
                isCurrent ? 'bg-gold text-burgundy ring-4 ring-gold/30' :
                            'bg-pearl text-burgundy/40 border border-burgundy/15'
              }`}>
                {isDone ? '✓' : i + 1}
              </span>
              <span>{s.label}</span>
            </li>
            {i < steps.length - 1 && <span className="text-burgundy/15">—</span>}
          </React.Fragment>
        )
      })}
    </ol>
  )
}

const PhotoUploader: React.FC<{
  fileInputRef: React.RefObject<HTMLInputElement>
  onPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ fileInputRef, onPhoto }) => (
  <label className="block aspect-[4/5] bg-pearl rounded-sm border-2 border-dashed border-burgundy/20 hover:border-burgundy/40 transition cursor-pointer focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2">
    <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={onPhoto}
        className="sr-only"
      />
      <div className="w-20 h-20 rounded-full bg-burgundy/10 flex items-center justify-center">
        <svg className="w-10 h-10 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
      </div>
      <div>
        <div className="font-display uppercase text-burgundy text-2xl mb-1">Upload your selfie</div>
        <p className="text-sm text-burgundy/60">JPG, PNG or HEIC · up to 8 MB</p>
      </div>
      <span className="mt-2 inline-flex items-center gap-2 text-burgundy font-semibold text-sm tracking-wider uppercase border border-burgundy rounded-full px-6 py-2.5 hover:bg-burgundy hover:text-offwhite transition">
        Choose photo
      </span>
    </div>
  </label>
)

const PhotoTips: React.FC = () => (
  <div className="bg-pearl p-6 rounded-sm">
    <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— For best results —</div>
    <ul className="space-y-2 text-sm text-burgundy/80">
      {PHOTO_GUIDELINES.map(g => (
        <li key={g} className="flex items-start gap-2">
          <span className="text-gold-600 mt-0.5">✦</span>
          <span>{g}</span>
        </li>
      ))}
    </ul>
    <p className="mt-5 text-xs text-burgundy/60 italic font-serif">
      Your photo is used only to generate your preview. We never sell it or use it for training. You can delete it anytime.
    </p>
  </div>
)

const WigPicker: React.FC<{
  catalog: Product[]
  loading: boolean
  selectedId: string | null
  onPick: (p: Product) => void
}> = ({ catalog, loading, selectedId, onPick }) => (
  <div className="bg-pearl p-5 rounded-sm">
    <h3 className="font-display uppercase text-burgundy text-xl mb-4">Choose a wig</h3>
    {loading ? (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    ) : catalog.length === 0 ? (
      <p className="font-serif italic text-burgundy/50 text-sm">No wigs available yet.</p>
    ) : (
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {catalog.map(wig => (
          <button
            key={wig.id}
            type="button"
            onClick={() => onPick(wig)}
            aria-pressed={selectedId === wig.id}
            className={`w-full flex items-center gap-3 p-3 rounded-sm border-2 transition text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
              selectedId === wig.id ? 'border-burgundy bg-offwhite' : 'border-transparent bg-offwhite/60 hover:border-burgundy/30'
            }`}
          >
            <div className="w-14 h-18 bg-burgundy rounded-sm shrink-0 flex items-center justify-center overflow-hidden">
              {wig.images?.[0]
                ? <img src={wig.images[0]} alt={wig.name} loading="lazy" className="w-full h-full object-cover" />
                : <Logo size={42} variant="mono-gold" className="opacity-70" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-burgundy truncate text-sm">{wig.name}</div>
              <div className="text-[11px] text-burgundy/60 mt-0.5 truncate">
                {[wig.category, wig.length_inches ? `${wig.length_inches}"` : null, wig.texture].filter(Boolean).join(' · ')}
              </div>
              <div className="text-[11px] text-gold-700 font-bold mt-0.5">{formatNaira(wig.discount_price ?? wig.price)}</div>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
)

const ConsentPanel: React.FC<{
  product: Product
  consent: boolean
  onConsent: (v: boolean) => void
  onGenerate: () => void
  canSubmit: boolean
  onBack: () => void
}> = ({ product, consent, onConsent, onGenerate, canSubmit, onBack }) => (
  <div className="bg-pearl p-6 rounded-sm">
    <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— Confirm & generate —</div>
    <h3 className="font-display uppercase text-burgundy text-xl mb-1">{product.name}</h3>
    <p className="text-xs text-burgundy/60 mb-5">
      {[product.category, product.length_inches ? `${product.length_inches}"` : null, product.texture].filter(Boolean).join(' · ')}
    </p>

    <div className="text-xs text-burgundy/70 space-y-2 mb-5 font-serif italic">
      <p>
        Your photo will be sent to our AI service to generate the preview. We auto-delete the result after 30 days, or you can delete it sooner from your account.
      </p>
      <p>
        AI previews can vary from the actual product — final fit and color depend on cap size, density and styling.
      </p>
    </div>

    <label className="flex items-start gap-3 text-sm text-burgundy mb-5 cursor-pointer">
      <input
        type="checkbox"
        checked={consent}
        onChange={e => onConsent(e.target.checked)}
        className="mt-1 accent-burgundy"
      />
      <span>I agree to use my photo to generate this preview, and understand it isn't a guarantee of the final look.</span>
    </label>

    <div className="flex gap-3">
      <Button variant="ghost" size="md" onClick={onBack}>Back</Button>
      <Button variant="primary" size="md" onClick={onGenerate} disabled={!canSubmit} fullWidth>
        Try It On With AI
      </Button>
    </div>
  </div>
)

const ResultStage: React.FC<{
  beforeSrc: string
  afterSrc: string
  onAddToCart: () => void
  onTryAnother: () => void
  onStartOver: () => void
  product: Product | null
  addingToCart: boolean
}> = ({ beforeSrc, afterSrc, onAddToCart, onTryAnother, onStartOver, product, addingToCart }) => (
  <div className="space-y-6">
    <BeforeAfter beforeSrc={beforeSrc} afterSrc={afterSrc} />
    <div className="grid sm:grid-cols-3 gap-3">
      <Button variant="primary" size="md" fullWidth onClick={onAddToCart} disabled={!product || addingToCart}>
        {addingToCart ? 'Adding…' : 'Add this wig'}
      </Button>
      <Button variant="secondary" size="md" fullWidth onClick={onTryAnother}>Try another wig</Button>
      <Button variant="ghost" size="md" fullWidth onClick={onStartOver}>New photo</Button>
    </div>
    <p className="text-xs text-burgundy/60 italic font-serif text-center">
      Drag the gold handle to compare. Save this look from your account to share or revisit later.
    </p>
  </div>
)

const SummaryCard: React.FC<{ product: Product }> = ({ product }) => (
  <div className="bg-pearl p-6 rounded-sm">
    <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— You're trying —</div>
    <Link to={`/shop/${product.id}`} className="block hover:opacity-80 transition">
      <div className="font-display uppercase text-burgundy text-xl mb-1">{product.name}</div>
      <div className="text-xs text-burgundy/60 mb-3">
        {[product.category, product.length_inches ? `${product.length_inches}"` : null, product.texture, product.lace_type].filter(Boolean).join(' · ')}
      </div>
      <div className="font-display text-burgundy text-2xl">{formatNaira(product.discount_price ?? product.price)}</div>
    </Link>
  </div>
)

const SavedLooks: React.FC<{ items: ReturnType<typeof useMyTryOns>['data']; onDelete: (id: string) => void }> = ({ items, onDelete }) => {
  const list = useMemo(() => (items ?? []).filter(i => i.status === 'complete' && i.generated_url), [items])
  if (list.length === 0) return null
  return (
    <section className="mt-16 pt-10 border-t border-burgundy/10">
      <h2 className="font-display uppercase text-burgundy text-2xl mb-5">Saved looks</h2>
      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {list.map(item => (
          <div key={item.id} className="relative group">
            <div className="aspect-[4/5] bg-pearl rounded-sm overflow-hidden">
              <img src={item.generated_url ?? ''} alt={item.product_name ?? 'Try-on look'} loading="lazy" className="w-full h-full object-cover" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              {item.product_id ? (
                <Link to={`/shop/${item.product_id}`} className="text-xs text-burgundy hover:underline truncate">
                  {item.product_name ?? 'Wig'}
                </Link>
              ) : (
                <span className="text-xs text-burgundy/60 truncate">{item.product_name ?? 'Wig'}</span>
              )}
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label="Delete this look"
                className="text-burgundy/50 hover:text-burgundy text-xs underline shrink-0"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TryOn
