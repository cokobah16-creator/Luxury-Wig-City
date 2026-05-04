import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { useProducts, type ProductFilters } from '../lib/queries'
import { useSeo } from '../lib/useSeo'

const categories = ['Bone Straight', 'Bouncy Hair', 'Pixie Curl', 'Closure Wigs', 'Frontal Wigs', 'Braided Wigs', 'Colored Wigs', 'Short Wigs', 'Custom Wigs']
const textures   = ['Straight', 'Wavy', 'Curly', 'Kinky']
const lengths    = [
  { label: 'Short (10-16")',    min: 10, max: 16 },
  { label: 'Medium (18-22")',   min: 18, max: 22 },
  { label: 'Long (24-28")',     min: 24, max: 28 },
  { label: 'Extra Long (30"+)', min: 30, max: 99 }
]
const laceTypes = ['13x4 HD Lace', '13x6 HD Lace', '5x5 Closure', '4x4 Closure', 'Full Lace', 'No Lace']
const colors    = ['Natural Black', 'Honey Blonde', 'Burgundy', 'Custom']

const Shop: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const cat = params.get('cat')
  const q = params.get('q')
  useSeo({
    title: q ? `Search: ${q}` : cat ? `${cat}` : 'Shop',
    description: q
      ? `Search results for "${q}" — premium wigs from vetted vendors.`
      : cat
      ? `Shop ${cat} — premium ${cat.toLowerCase()} wigs from vetted vendors. Free Abuja delivery on orders above ₦150,000.`
      : 'Browse our full collection of premium wigs — bone straight, pixie curl, frontals, closures and more.'
  })
  const [selectedCat,          setSelectedCat]          = useState<string | null>(cat)
  const [selectedTextures,     setSelectedTextures]     = useState<string[]>([])
  const [selectedLengthBucket, setSelectedLengthBucket] = useState<string | null>(null)
  const [priceMax,             setPriceMax]             = useState(350000)
  const [sort,                 setSort]                 = useState<ProductFilters['sort']>('featured')
  const [search,               setSearch]               = useState(params.get('q') ?? '')

  // Keep search in sync when navbar pushes a new ?q= (e.g. user searches again)
  useEffect(() => {
    setSearch(params.get('q') ?? '')
  }, [params])

  const bucket = lengths.find(l => l.label === selectedLengthBucket)

  const { data: products = [], isLoading } = useProducts({
    category:   selectedCat ?? undefined,
    textures:   selectedTextures.length ? selectedTextures : undefined,
    minLength:  bucket?.min,
    maxLength:  bucket?.max,
    priceMax,
    sort,
    search:     search.trim() || undefined
  })

  const toggleTexture = (t: string) =>
    setSelectedTextures(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const clearFilters = () => {
    setSelectedCat(null)
    setSelectedTextures([])
    setSelectedLengthBucket(null)
    setPriceMax(350000)
    setSearch('')
    setParams({})
  }

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    const next = new URLSearchParams(params)
    if (q) next.set('q', q); else next.delete('q')
    setParams(next)
  }

  return (
    <div className="bg-offwhite">
      <section className="bg-burgundy text-offwhite py-14 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— The Shop —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
            Browse the collection
          </h1>
          <p className="font-serif italic text-offwhite/80 text-lg mt-4">
            {isLoading ? 'Loading…' : `${products.length} ${products.length === 1 ? 'wig' : 'wigs'} found · curated and verified`}
          </p>
          {/* Search */}
          <form onSubmit={submitSearch} className="mt-6 max-w-md">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search wigs…"
              aria-label="Search products"
              className="w-full px-5 py-3 rounded-full bg-offwhite/10 text-offwhite placeholder-offwhite/50 border border-offwhite/20 focus:border-gold outline-none"
            />
          </form>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10">
        {/* FILTER SIDEBAR */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-32 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display uppercase text-burgundy text-2xl">Filters</h2>
              <button onClick={clearFilters} className="text-xs text-burgundy/60 hover:text-burgundy underline">Clear all</button>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Category</div>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer hover:text-burgundy">
                    <input type="radio" name="cat" checked={selectedCat === cat} onChange={() => { setSelectedCat(cat); setParams({ cat }) }} className="accent-burgundy" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Texture</div>
              <div className="space-y-2">
                {textures.map(t => (
                  <label key={t} className="flex items-center gap-2 text-sm cursor-pointer hover:text-burgundy">
                    <input type="checkbox" checked={selectedTextures.includes(t)} onChange={() => toggleTexture(t)} className="accent-burgundy" />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Length</div>
              <div className="space-y-2">
                {lengths.map(l => (
                  <label key={l.label} className="flex items-center gap-2 text-sm cursor-pointer hover:text-burgundy">
                    <input type="radio" name="length" checked={selectedLengthBucket === l.label} onChange={() => setSelectedLengthBucket(l.label)} className="accent-burgundy" />
                    {l.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Max Price</div>
              <input type="range" min={50000} max={350000} step={10000} value={priceMax} onChange={e => setPriceMax(+e.target.value)} className="w-full accent-burgundy" />
              <div className="text-xs mt-2 text-burgundy/70">Up to ₦{priceMax.toLocaleString()}</div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Lace Type</div>
              <div className="flex flex-wrap gap-2">
                {laceTypes.map(l => <span key={l} className="text-[11px] px-2.5 py-1 bg-pearl border border-burgundy/15 rounded-full">{l}</span>)}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Color</div>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => <span key={c} className="text-[11px] px-2.5 py-1 bg-pearl border border-burgundy/15 rounded-full">{c}</span>)}
              </div>
            </div>
          </div>
        </aside>

        {/* GRID */}
        <main className="lg:col-span-9">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-burgundy/10">
            <div className="text-sm text-burgundy/70">
              {isLoading ? 'Loading…' : `Showing ${products.length} results`}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as ProductFilters['sort'])} className="text-sm border border-burgundy/20 rounded-full px-4 py-2 bg-offwhite focus:border-burgundy outline-none">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-pearl rounded-sm animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif italic text-burgundy/60 text-xl">No wigs match your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-burgundy underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Shop
