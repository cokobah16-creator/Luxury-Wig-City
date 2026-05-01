import React, { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { useAuth } from '../contexts/AuthContext'
import { useMyOrders, useWishlist, useUserWigs } from '../lib/queries'
import { formatNaira } from '../lib/supabase'

const Account: React.FC = () => {
  const { user, profile, vendorProfile, loading, signIn, signUp, signInWithGoogle, signInWithMagicLink, signOut, isAdmin, isVendor } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<'login' | 'register' | 'magic'>('login')
  const [view, setView] = useState<'orders' | 'saved' | 'looks'>(
    (searchParams.get('view') as 'orders' | 'saved' | 'looks') ?? 'orders'
  )

  const { data: orders   = [] } = useMyOrders()
  const { data: wishlist = [] } = useWishlist()
  const { data: userWigs = [] } = useUserWigs()
  const [form, setForm] = useState({ email: '', password: '', fullName: '' })
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Logo size={80} variant="gold-on-burgundy" className="animate-pulse" />
      </div>
    )
  }

  // ─── Logged-in dashboard ────────────────────────────────────────────
  if (user && profile) {
    return (
      <div className="bg-offwhite min-h-screen">
        <section className="bg-burgundy text-offwhite py-14">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center gap-6">
            <Logo size={80} variant="gold-on-burgundy" />
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-1">— Welcome Back —</div>
              <h1 className="font-display uppercase text-gold text-4xl lg:text-5xl tracking-tight display-shadow">
                Hi, {profile.full_name?.split(' ')[0] ?? 'Queen'}
              </h1>
              <div className="text-xs text-offwhite/70 mt-1 capitalize">
                {isAdmin ? 'Admin' : isVendor ? 'Vendor' : 'Customer'}
                {vendorProfile && vendorProfile.status !== 'approved' && ` · Vendor application: ${vendorProfile.status}`}
              </div>
            </div>
            <button onClick={signOut} className="ml-auto text-sm text-offwhite/70 hover:text-gold underline">Log out</button>
          </div>
        </section>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10">
          <aside className="lg:col-span-3">
            <nav className="space-y-1">
              {([
                { id: 'orders' as const, label: 'Order History' },
                { id: 'saved'  as const, label: 'Saved Wigs' },
                { id: 'looks'  as const, label: 'Try-On Looks' }
              ]).map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-sm font-semibold transition ${view === item.id ? 'bg-burgundy text-offwhite' : 'text-burgundy hover:bg-pearl'}`}
                >
                  {item.label}
                </button>
              ))}

              {isVendor || isAdmin ? (
                <Link to="/admin" className="block w-full text-left px-4 py-3 rounded-sm font-semibold text-gold-700 bg-gold/10 hover:bg-gold/20 mt-4">
                  → Vendor Dashboard
                </Link>
              ) : (
                <Link to="/become-vendor" className="block w-full text-left px-4 py-3 rounded-sm font-semibold text-burgundy border border-burgundy/20 hover:border-burgundy mt-4">
                  Become a Vendor
                </Link>
              )}
            </nav>
          </aside>

          <main className="lg:col-span-9">
            {view === 'orders' && (
              orders.length === 0 ? (
                <div className="bg-pearl p-10 rounded-sm text-center">
                  <Logo size={80} variant="mono-burgundy" className="mx-auto mb-4 opacity-50" />
                  <h2 className="font-display uppercase text-burgundy text-3xl mb-2">No Orders Yet</h2>
                  <p className="font-serif italic text-burgundy/60 mb-6">Your order history will appear here.</p>
                  <Button to="/shop" variant="primary" size="md">Shop Wigs</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => {
                    const statusColor: Record<string, string> = {
                      pending:          'bg-gold/20 text-gold-700',
                      confirmed:        'bg-blue-100 text-blue-800',
                      admin_confirmed:  'bg-blue-100 text-blue-800',
                      packed:           'bg-purple-100 text-purple-800',
                      dispatched:       'bg-burgundy/15 text-burgundy',
                      out_for_delivery: 'bg-burgundy/15 text-burgundy',
                      delivered:        'bg-green-100 text-green-800',
                      cancelled:        'bg-red-100 text-red-800'
                    }
                    return (
                      <div key={order.id} className="bg-pearl p-6 rounded-sm border border-burgundy/10">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <div className="text-xs text-burgundy/50 font-mono">#{order.id.slice(0, 8).toUpperCase()}</div>
                            <div className="font-display text-burgundy text-xl mt-1">{formatNaira(Number(order.total_amount))}</div>
                            <div className="text-xs text-burgundy/60 mt-1">{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusColor[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div className="mt-3 text-sm text-burgundy/70">
                            {(order.items as Array<{ product_name?: string; quantity?: number }>).map((item, i) => (
                              <span key={i}>{item.product_name}{item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : ''}{i < order.items.length - 1 ? ', ' : ''}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {view === 'saved' && (
              wishlist.length === 0 ? (
                <div className="bg-pearl p-10 rounded-sm text-center">
                  <Logo size={80} variant="mono-burgundy" className="mx-auto mb-4 opacity-50" />
                  <h2 className="font-display uppercase text-burgundy text-3xl mb-2">No Saved Wigs</h2>
                  <p className="font-serif italic text-burgundy/60 mb-6">Tap the heart on any wig to save it here.</p>
                  <Button to="/shop" variant="primary" size="md">Browse Wigs</Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlist.map(item => (
                    <Link key={item.id} to={`/shop/${item.product_id}`} className="flex gap-3 p-4 bg-pearl rounded-sm hover:border-burgundy border border-transparent transition">
                      <div className="w-16 h-20 bg-burgundy rounded-sm shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product_image ? <img src={item.product_image} alt={item.product_name ?? ''} className="w-full h-full object-cover" /> : <Logo size={36} variant="mono-gold" className="opacity-70" />}
                      </div>
                      <div>
                        <div className="font-semibold text-burgundy">{item.product_name}</div>
                        {item.product_price && <div className="text-sm text-gold-600 font-bold mt-1">{formatNaira(Number(item.product_price))}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {view === 'looks' && (
              userWigs.length === 0 ? (
                <div className="bg-pearl p-10 rounded-sm text-center">
                  <Logo size={80} variant="mono-burgundy" className="mx-auto mb-4 opacity-50" />
                  <h2 className="font-display uppercase text-burgundy text-3xl mb-2">Wig Wardrobe Empty</h2>
                  <p className="font-serif italic text-burgundy/60">Your wig wardrobe tracker launches in Phase 3.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {userWigs.map(wig => (
                    <div key={wig.id} className="bg-pearl p-4 rounded-sm border border-burgundy/10">
                      <div className="font-semibold text-burgundy">{wig.wig_name ?? 'Unnamed wig'}</div>
                      <div className="text-xs text-burgundy/60 mt-1 capitalize">{wig.condition_status.replace(/_/g, ' ')}</div>
                    </div>
                  ))}
                </div>
              )
            )}
          </main>
        </div>
      </div>
    )
  }

  // ─── Auth screens ───────────────────────────────────────────────────
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    let result: { error: Error | null }
    if (tab === 'login') {
      result = await signIn(form.email, form.password)
    } else if (tab === 'register') {
      result = await signUp(form.email, form.password, form.fullName)
      if (!result.error) toast.success('Account created — check your email to confirm.')
    } else {
      result = await signInWithMagicLink(form.email)
      if (!result.error) toast.success('Check your email for the magic link.')
    }
    if (result.error) toast.error(result.error.message)
    setSubmitting(false)
  }

  return (
    <div className="bg-pearl min-h-screen flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md bg-offwhite p-10 rounded-sm shadow-luxe">
        <Logo size={80} variant="gold-on-burgundy" className="mx-auto mb-6" />
        <h1 className="font-display uppercase text-burgundy text-3xl text-center mb-2">
          {tab === 'login' ? 'Welcome Back' : tab === 'register' ? 'Join the Society' : 'Magic Link'}
        </h1>
        <p className="font-serif italic text-burgundy/60 text-center mb-8">
          {tab === 'login' ? 'Sign in to your account' : tab === 'register' ? 'Create your wig wardrobe' : 'No password needed'}
        </p>

        <div className="flex border-b border-burgundy/15 mb-6">
          <button onClick={() => setTab('login')}    className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition ${tab === 'login'    ? 'text-burgundy border-b-2 border-burgundy' : 'text-burgundy/40'}`}>Login</button>
          <button onClick={() => setTab('register')} className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition ${tab === 'register' ? 'text-burgundy border-b-2 border-burgundy' : 'text-burgundy/40'}`}>Register</button>
          <button onClick={() => setTab('magic')}    className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition ${tab === 'magic'    ? 'text-burgundy border-b-2 border-burgundy' : 'text-burgundy/40'}`}>Magic</button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {tab === 'register' && (
            <input
              type="text" required placeholder="Full Name"
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none"
            />
          )}
          <input
            type="email" required placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none"
          />
          {tab !== 'magic' && (
            <input
              type="password" required minLength={6} placeholder="Password (min 6 chars)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none"
            />
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
            {submitting ? 'Please wait…' : tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Send Magic Link'}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-burgundy/15" />
          <span className="text-xs text-burgundy/50 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-burgundy/15" />
        </div>

        <Button variant="secondary" size="lg" fullWidth onClick={signInWithGoogle}>
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </Button>

        {tab === 'login' && (
          <p className="text-center text-xs text-burgundy/60 mt-6">
            <button type="button" onClick={() => setTab('magic')} className="hover:text-burgundy underline">Forgot password? Use magic link</button>
          </p>
        )}
      </div>
    </div>
  )
}

export default Account
