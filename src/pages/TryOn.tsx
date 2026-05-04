import React, { useState } from 'react'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { useProducts } from '../lib/queries'
import { formatNaira } from '../lib/supabase'
import type { Product } from '../lib/database.types'
import { useSeo } from '../lib/useSeo'

const TryOn: React.FC = () => {
  useSeo({
    title: 'AI Wig Try-On',
    description: 'See yourself in any wig before you buy. Upload a photo, choose a style, and our AI shows you the look in seconds.'
  })
  const [uploadedImage, setUploadedImage]   = useState<string | null>(null)
  const [selectedWig,   setSelectedWig]     = useState<Product | null>(null)

  const { data: products = [] } = useProducts({ limit: 20 })
  const activeWig = selectedWig ?? products[0] ?? null

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = ev => setUploadedImage(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="bg-offwhite min-h-screen">
      <section className="bg-burgundy text-offwhite py-14 lg:py-20 relative overflow-hidden">
        <Logo size={400} variant="mono-gold" className="absolute -top-20 -right-20 opacity-[0.08]" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— AI Wig Try-On —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
            See It Before You Wear It
          </h1>
          <p className="font-serif italic text-offwhite/80 text-lg mt-4 max-w-2xl">
            Upload your photo, pick a wig, and our AI shows you how it looks — in seconds.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="aspect-[4/5] bg-pearl rounded-sm border-2 border-dashed border-burgundy/20 flex items-center justify-center relative overflow-hidden">
            {!uploadedImage ? (
              <label className="cursor-pointer flex flex-col items-center justify-center gap-4 px-8 text-center">
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                <div className="w-20 h-20 rounded-full bg-burgundy/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </div>
                <div>
                  <div className="font-display uppercase text-burgundy text-2xl mb-1">Upload Your Photo</div>
                  <div className="font-serif italic text-burgundy/60">Front-facing, any lighting works</div>
                </div>
                <Button variant="primary" size="md">Choose Photo</Button>
              </label>
            ) : (
              <div className="relative w-full h-full">
                <img src={uploadedImage} alt="Your photo" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-burgundy/90 backdrop-blur-md text-offwhite px-6 py-3 rounded-full font-display uppercase text-sm tracking-wider">
                    Wig Match: {activeWig?.name ?? '—'}
                  </div>
                </div>
                <Logo size={250} variant="mono-burgundy" className="absolute top-0 left-1/2 -translate-x-1/2 opacity-50" />
              </div>
            )}
          </div>

          {uploadedImage && (
            <div className="flex flex-wrap gap-3 mt-6">
              <Button variant="primary" size="md">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"/></svg>
                Apply Wig
              </Button>
              <Button variant="secondary" size="md">Save Look</Button>
              <Button variant="gold" size="md">Add to Cart</Button>
              <Button variant="ghost" size="md" onClick={() => setUploadedImage(null)}>Upload Different Photo</Button>
            </div>
          )}

          <p className="mt-4 text-xs text-burgundy/50 leading-relaxed">
            <strong>Disclaimer:</strong> AI rendering is a preview only. Actual wig appearance depends on installation, your face shape, and lighting.
          </p>
        </div>

        <div className="lg:col-span-4">
          <h2 className="font-display uppercase text-burgundy text-2xl mb-4">Choose a Wig</h2>
          {products.length === 0 ? (
            <p className="font-serif italic text-burgundy/50">No wigs available yet.</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {products.map(wig => (
                <button
                  key={wig.id}
                  onClick={() => setSelectedWig(wig)}
                  className={`w-full flex items-center gap-3 p-3 rounded-sm border-2 transition text-left ${
                    activeWig?.id === wig.id ? 'border-burgundy bg-pearl' : 'border-transparent bg-pearl/50 hover:border-burgundy/30'
                  }`}
                >
                  <div className="w-16 h-20 bg-burgundy rounded-sm shrink-0 flex items-center justify-center overflow-hidden">
                    {wig.images?.[0]
                      ? <img src={wig.images[0]} alt={wig.name} className="w-full h-full object-cover" />
                      : <Logo size={50} variant="mono-gold" className="opacity-70" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-burgundy">{wig.name}</div>
                    <div className="text-xs text-burgundy/60 mt-0.5">
                      {wig.category}{wig.length_inches ? ` · ${wig.length_inches}"` : ''}
                    </div>
                    <div className="text-xs text-gold-600 font-bold mt-1">{formatNaira(wig.discount_price ?? wig.price)}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TryOn
