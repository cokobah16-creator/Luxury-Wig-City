import React, { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { Skeleton, OrderRowSkeleton } from '../components/Skeleton'
import { useAuth } from '../contexts/AuthContext'
import { useVendorOrders, useVendorProducts } from '../lib/queries'
import { useUpsertVendorProduct, useDeleteVendorProduct, type VendorProductInput } from '../lib/mutations'
import { formatNaira } from '../lib/supabase'
import { useSeo } from '../lib/useSeo'
import type { Product, ProductCategory } from '../lib/database.types'

const CATEGORIES: ProductCategory[] = [
  'Bone Straight', 'Bouncy Hair', 'Pixie Curl', 'Closure Wigs',
  'Frontal Wigs', 'Braided Wigs', 'Colored Wigs', 'Short Wigs', 'Custom Wigs'
]

const TEXTURES = ['Straight', 'Wavy', 'Curly', 'Kinky']
const LACE_TYPES = ['13x4 HD Lace', '13x6 HD Lace', '5x5 Closure', '4x4 Closure', 'Full Lace', 'No Lace']

const Vendor: React.FC = () => {
  useSeo({ title: 'Vendor Dashboard', noIndex: true })

  const { user, vendorProfile, isVendor, loading } = useAuth()
  const [view, setView] = useState<'overview' | 'products' | 'orders'>('overview')
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)

  const { data: products = [], isLoading: prodLoading } = useVendorProducts()
  const { data: orders = [],   isLoading: ordersLoading } = useVendorOrders()
  const deleteProduct = useDeleteVendorProduct()

  if (loading) return null
  if (!user) return <Navigate to="/account" replace />
  if (!isVendor || !vendorProfile) return <Navigate to="/sell-with-us" replace />

  const stats = {
    productCount:  products.length,
    activeProducts:products.filter(p => p.status === 'active').length,
    orderCount:    orders.length,
    revenue:       orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0)
  }

  return (
    <div className="bg-pearl min-h-screen">
      <section className="bg-burgundy text-offwhite py-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center gap-4 flex-wrap">
          <Logo size={56} variant="gold-on-burgundy" />
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold">— Vendor Dashboard —</div>
            <h1 className="font-display uppercase text-gold text-3xl lg:text-4xl tracking-tight">{vendorProfile.store_name}</h1>
          </div>
          <div className="ml-auto text-xs tracking-[0.18em] uppercase">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${vendorProfile.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-gold/20 text-gold'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {vendorProfile.status}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 grid lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-2">
          <nav className="space-y-1 lg:sticky lg:top-32">
            {([
              { id: 'overview' as const, label: 'Overview' },
              { id: 'products' as const, label: 'Products' },
              { id: 'orders'   as const, label: 'Orders' }
            ]).map(item => (
              <button
                key={item.id}
                onClick={() => { setView(item.id); setEditing(null); setCreating(false) }}
                className={`w-full text-left px-4 py-3 rounded-sm text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  view === item.id ? 'bg-burgundy text-offwhite' : 'text-burgundy hover:bg-offwhite'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="lg:col-span-10 space-y-8">
          {view === 'overview' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Products listed"  value={String(stats.productCount)} />
              <StatCard label="Active products"  value={String(stats.activeProducts)} />
              <StatCard label="Total orders"     value={String(stats.orderCount)} />
              <StatCard label="Lifetime revenue" value={formatNaira(stats.revenue)} />
            </div>
          )}

          {view === 'products' && (
            <>
              {(creating || editing) ? (
                <ProductForm
                  initial={editing}
                  onCancel={() => { setEditing(null); setCreating(false) }}
                  onSaved={() => { setEditing(null); setCreating(false) }}
                />
              ) : (
                <>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="font-display uppercase text-burgundy text-2xl">Your products</h2>
                    <Button variant="primary" size="md" onClick={() => setCreating(true)}>+ New product</Button>
                  </div>

                  {prodLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                    </div>
                  ) : products.length === 0 ? (
                    <div className="bg-offwhite p-10 rounded-sm text-center border border-burgundy/10">
                      <Logo size={80} variant="mono-burgundy" className="mx-auto mb-4 opacity-50" />
                      <h3 className="font-display uppercase text-burgundy text-2xl mb-2">No products yet</h3>
                      <p className="font-serif italic text-burgundy/60 mb-6">List your first wig and start selling.</p>
                      <Button variant="primary" size="md" onClick={() => setCreating(true)}>Add your first product</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {products.map(p => (
                        <div key={p.id} className="bg-offwhite p-4 rounded-sm border border-burgundy/10 flex items-center gap-4 flex-wrap">
                          <div className="w-16 h-20 bg-burgundy rounded-sm shrink-0 overflow-hidden flex items-center justify-center">
                            {p.images?.[0]
                              ? <img src={p.images[0]} alt={p.name} loading="lazy" className="w-full h-full object-cover" />
                              : <Logo size={42} variant="mono-gold" className="opacity-70" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/shop/${p.id}`} className="font-semibold text-burgundy hover:underline truncate block">{p.name}</Link>
                            <div className="text-xs text-burgundy/60 mt-1">{[p.category, p.length_inches ? `${p.length_inches}"` : null, p.texture].filter(Boolean).join(' · ')}</div>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                              <span className="font-display text-burgundy">{formatNaira(p.discount_price ?? p.price)}</span>
                              <span className="text-burgundy/50">Stock: {p.stock}</span>
                              <span className={`uppercase tracking-wider px-2 py-0.5 rounded text-[10px] font-bold ${p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-burgundy/15 text-burgundy'}`}>{p.status}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => setEditing(p)}>Edit</Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                              if (confirm(`Remove "${p.name}"?`)) deleteProduct.mutate(p.id)
                            }}>Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {view === 'orders' && (
            <>
              <h2 className="font-display uppercase text-burgundy text-2xl">Your orders</h2>
              {ordersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => <OrderRowSkeleton key={i} />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-offwhite p-10 rounded-sm text-center border border-burgundy/10">
                  <p className="font-serif italic text-burgundy/60">No orders yet — once a customer buys one of your wigs it'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(o => (
                    <div key={o.id} className="bg-offwhite p-4 rounded-sm border border-burgundy/10">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="text-xs text-burgundy/50 font-mono">#{o.id.slice(0, 8).toUpperCase()}</div>
                          <div className="font-display text-burgundy text-lg mt-1">{formatNaira(Number(o.total_amount))}</div>
                          <div className="text-xs text-burgundy/60 mt-0.5">{new Date(o.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs">
                          <span className="uppercase tracking-wider px-2 py-0.5 rounded font-semibold bg-burgundy/10 text-burgundy">{o.status.replace(/_/g, ' ')}</span>
                          <span className={`uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gold/20 text-gold-700'}`}>{o.payment_status}</span>
                        </div>
                      </div>
                      {Array.isArray(o.items) && o.items.length > 0 && (
                        <div className="mt-3 text-sm text-burgundy/70">
                          {o.items.map((it, i) => (
                            <span key={i}>{it.product_name}{it.quantity > 1 ? ` ×${it.quantity}` : ''}{i < o.items.length - 1 ? ', ' : ''}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-offwhite p-5 rounded-sm border border-burgundy/10">
    <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/60 font-bold mb-2">{label}</div>
    <div className="font-display text-burgundy text-2xl">{value}</div>
  </div>
)

const ProductForm: React.FC<{
  initial: Product | null
  onCancel: () => void
  onSaved: () => void
}> = ({ initial, onCancel, onSaved }) => {
  const upsert = useUpsertVendorProduct()
  const [form, setForm] = useState<VendorProductInput>({
    id:             initial?.id,
    name:           initial?.name ?? '',
    description:    initial?.description ?? '',
    category:       initial?.category ?? 'Bone Straight',
    price:          initial?.price ?? 0,
    discount_price: initial?.discount_price ?? null,
    stock:          initial?.stock ?? 1,
    texture:        initial?.texture ?? null,
    length_inches:  initial?.length_inches ?? null,
    lace_type:      initial?.lace_type ?? null,
    primary_color:  initial?.primary_color ?? null,
    images:         initial?.images ?? [],
    status:         (initial?.status as 'active' | 'draft' | undefined) ?? 'active'
  })
  const [imageInput, setImageInput] = useState('')

  const set = <K extends keyof VendorProductInput>(k: K, v: VendorProductInput[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await upsert.mutateAsync(form)
    onSaved()
  }

  const addImage = () => {
    const url = imageInput.trim()
    if (!url) return
    set('images', [...(form.images ?? []), url])
    setImageInput('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-offwhite p-6 lg:p-8 rounded-sm border border-burgundy/10 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display uppercase text-burgundy text-2xl">{initial ? 'Edit product' : 'New product'}</h2>
        <Button variant="ghost" size="sm" onClick={onCancel} type="button">Cancel</Button>
      </div>

      <FormField label="Product name *">
        <input type="text" required value={form.name} onChange={e => set('name', e.target.value)}
          className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
      </FormField>

      <FormField label="Description">
        <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)}
          rows={4} maxLength={1000}
          className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
      </FormField>

      <div className="grid sm:grid-cols-2 gap-5">
        <FormField label="Category *">
          <select value={form.category} onChange={e => set('category', e.target.value as ProductCategory)}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Status">
          <select value={form.status ?? 'active'} onChange={e => set('status', e.target.value as 'active' | 'draft')}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none">
            <option value="active">Active (visible in shop)</option>
            <option value="draft">Draft (hidden)</option>
          </select>
        </FormField>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <FormField label="Price (₦) *">
          <input type="number" min={0} step={1000} required value={form.price} onChange={e => set('price', Number(e.target.value))}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
        </FormField>
        <FormField label="Sale price (optional)">
          <input type="number" min={0} step={1000} value={form.discount_price ?? ''} onChange={e => set('discount_price', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
        </FormField>
        <FormField label="Stock *">
          <input type="number" min={0} required value={form.stock} onChange={e => set('stock', Number(e.target.value))}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
        </FormField>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <FormField label="Texture">
          <select value={form.texture ?? ''} onChange={e => set('texture', e.target.value || null)}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none">
            <option value="">—</option>
            {TEXTURES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormField>
        <FormField label="Length (inches)">
          <input type="number" min={8} max={40} value={form.length_inches ?? ''} onChange={e => set('length_inches', e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
        </FormField>
        <FormField label="Lace type">
          <select value={form.lace_type ?? ''} onChange={e => set('lace_type', e.target.value || null)}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none">
            <option value="">—</option>
            {LACE_TYPES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
      </div>

      <FormField label="Primary color">
        <input type="text" value={form.primary_color ?? ''} onChange={e => set('primary_color', e.target.value || null)}
          placeholder="e.g. Natural Black, Honey Blonde"
          className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
      </FormField>

      <FormField label="Images (paste URLs)">
        <div className="flex gap-2">
          <input type="url" value={imageInput} onChange={e => setImageInput(e.target.value)}
            placeholder="https://…"
            className="flex-1 px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none" />
          <Button type="button" variant="secondary" size="md" onClick={addImage}>Add</Button>
        </div>
        {(form.images ?? []).length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
            {(form.images ?? []).map((url, i) => (
              <div key={`${url}-${i}`} className="relative aspect-square bg-pearl rounded-sm overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button"
                  onClick={() => set('images', (form.images ?? []).filter((_, j) => j !== i))}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-burgundy/80 text-offwhite text-xs opacity-0 group-hover:opacity-100 transition focus:opacity-100"
                >×</button>
              </div>
            ))}
          </div>
        )}
      </FormField>

      <div className="pt-2 flex gap-3">
        <Button type="submit" variant="primary" size="md" disabled={upsert.isPending}>
          {upsert.isPending ? 'Saving…' : initial ? 'Save changes' : 'Publish product'}
        </Button>
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold block mb-2">{label}</label>
    {children}
  </div>
)

export default Vendor
