import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/ProductCard'
import { wigs } from '../data/wigs'

const categories = ['Bone Straight', 'Pixie Curls', 'Frontal Wigs', 'Closure Wigs', 'Braided Wigs']
const textures = ['Straight', 'Wavy', 'Curly', 'Kinky']
const lengths = [{ label: 'Short (10-16")', min: 10, max: 16 }, { label: 'Medium (18-22")', min: 18, max: 22 }, { label: 'Long (24-28")', min: 24, max: 28 }, { label: 'Extra Long (30"+)', min: 30, max: 99 }]
const laceTypes = ['13x4 HD Lace', '13x6 HD Lace', '5x5 Closure', '4x4 Closure', 'Full Lace', 'No Lace']
const colors = ['Natural Black', 'Honey Blonde', 'Burgundy', 'Custom']

const Shop: React.FC = () => {
  const [params, setParams] = useSearchParams()
  const initialCat = params.get('cat')

  const [selectedCat, setSelectedCat] = useState<string | null>(initialCat)
  const [selectedTextures, setSelectedTextures] = useState<string[]>([])
  const [selectedLengthBucket, setSelectedLengthBucket] = useState<string | null>(null)
  const [priceMax, setPriceMax] = useState(350000)
  const [sort, setSort] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured')

  const filtered = useMemo(() => {
    let list = [...wigs]
    if (selectedCat) list = list.filter(w => w.category === selectedCat)
    if (selectedTextures.length) list = list.filter(w => selectedTextures.includes(w.texture))
    if (selectedLengthBucket) {
      const bucket = lengths.find(l => l.label === selectedLengthBucket)
      if (bucket) list = list.filter(w => w.length >= bucket.min && w.length <= bucket.max)
    }
    list = list.filter(w => w.price <= priceMax)
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [selectedCat, selectedTextures, selectedLengthBucket, priceMax, sort])

  const toggleTexture = (t: string) =>
    setSelectedTextures(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const clearFilters = () => {
    setSelectedCat(null)
    setSelectedTextures([])
    setSelectedLengthBucket(null)
    setPriceMax(350000)
    setParams({})
  }

  return (
    <div className="bg-offwhite">
      {/* Page header */}
      <section className="bg-burgundy text-offwhite py-14 lg:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— The Shop —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
            Browse the collection
          </h1>
          <p className="font-serif italic text-offwhite/80 text-lg mt-4">
            {filtered.length} {filtered.length === 1 ? 'wig' : 'wigs'} found · curated and verified
          </p>
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

            {/* Category */}
            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Category</div>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer hover:text-burgundy">
                    <input
                      type="radio"
                      name="cat"
                      checked={selectedCat === cat}
                      onChange={() => setSelectedCat(cat)}
                      className="accent-burgundy"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Texture */}
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

            {/* Length */}
            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Length</div>
              <div className="space-y-2">
                {lengths.map(l => (
                  <label key={l.label} className="flex items-center gap-2 text-sm cursor-pointer hover:text-burgundy">
                    <input
                      type="radio"
                      name="length"
                      checked={selectedLengthBucket === l.label}
                      onChange={() => setSelectedLengthBucket(l.label)}
                      className="accent-burgundy"
                    />
                    {l.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Max Price</div>
              <input
                type="range"
                min={50000}
                max={350000}
                step={10000}
                value={priceMax}
                onChange={e => setPriceMax(+e.target.value)}
                className="w-full accent-burgundy"
              />
              <div className="text-xs mt-2 text-burgundy/70">Up to ₦{priceMax.toLocaleString()}</div>
            </div>

            {/* Lace Type */}
            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Lace Type</div>
              <div className="flex flex-wrap gap-2">
                {laceTypes.map(l => (
                  <span key={l} className="text-[11px] px-2.5 py-1 bg-pearl border border-burgundy/15 rounded-full hover:border-burgundy cursor-pointer">{l}</span>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy font-bold mb-3">Color</div>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <span key={c} className="text-[11px] px-2.5 py-1 bg-pearl border border-burgundy/15 rounded-full hover:border-burgundy cursor-pointer">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* GRID */}
        <main className="lg:col-span-9">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-burgundy/10">
            <div className="text-sm text-burgundy/70">Showing {filtered.length} results</div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="text-sm border border-burgundy/20 rounded-full px-4 py-2 bg-offwhite focus:border-burgundy outline-none"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-serif italic text-burgundy/60 text-xl">No wigs match your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-burgundy underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((wig, i) => <ProductCard key={wig.id} wig={wig} index={i} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Shop
