import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { CartItemSkeleton, Skeleton } from '../components/Skeleton'
import { useCart } from '../lib/queries'
import { useUpdateCartQty, useRemoveCartItem } from '../lib/mutations'
import { formatNaira } from '../lib/supabase'
import { calcDelivery, waLink } from '../lib/constants'

const Cart: React.FC = () => {
  const { data: items = [], isLoading } = useCart()
  const updateQty  = useUpdateCartQty()
  const removeItem = useRemoveCartItem()

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0)
  const delivery  = calcDelivery(subtotal)
  const total     = subtotal + delivery

  if (isLoading) {
    return (
      <div className="bg-offwhite min-h-screen">
        <section className="bg-burgundy text-offwhite py-14">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Your Bag —</div>
            <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">Cart</h1>
          </div>
        </section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-4" aria-busy="true" aria-label="Loading cart">
            <CartItemSkeleton />
            <CartItemSkeleton />
            <CartItemSkeleton />
          </div>
          <aside className="lg:col-span-4">
            <Skeleton className="h-72 w-full" />
          </aside>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-offwhite min-h-screen">
      <section className="bg-burgundy text-offwhite py-14">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Your Bag —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">Cart</h1>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <Logo size={100} variant="mono-burgundy" className="mx-auto mb-6 opacity-50" />
              <h2 className="font-display uppercase text-burgundy text-3xl mb-3">Your bag is empty</h2>
              <p className="font-serif italic text-burgundy/60 mb-6">Time to find your crown.</p>
              <Button to="/shop" variant="primary" size="lg">Shop Wigs</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const variantLine = [item.length, item.cap_size, item.color].filter(Boolean).join(' · ')
                return (
                  <div key={item.id} className="flex gap-4 p-4 bg-pearl rounded-sm">
                    <Link to={`/shop/${item.product_id}`} className="w-24 h-32 bg-burgundy rounded-sm shrink-0 flex items-center justify-center overflow-hidden">
                      {item.product_image
                        ? <img src={item.product_image} alt={item.product_name ?? ''} loading="lazy" decoding="async" width={96} height={128} className="w-full h-full object-cover" />
                        : <Logo size={60} variant="mono-gold" className="opacity-70" />
                      }
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display uppercase text-burgundy text-xl">{item.product_name}</h3>
                          {variantLine && <div className="text-xs text-burgundy/60 mt-1">{variantLine}</div>}
                          {item.vendor_name && <div className="text-xs text-burgundy/50 mt-0.5">by {item.vendor_name}</div>}
                        </div>
                        <button onClick={() => removeItem.mutate(item.id)} disabled={removeItem.isPending} className="text-burgundy/40 hover:text-burgundy">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-burgundy/20 rounded-full">
                          <button onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity - 1 })} disabled={item.quantity <= 1 || updateQty.isPending} className="px-3 py-1 hover:bg-offwhite rounded-l-full disabled:opacity-40">−</button>
                          <span className="px-3 py-1 font-semibold text-sm">{item.quantity}</span>
                          <button onClick={() => updateQty.mutate({ id: item.id, quantity: item.quantity + 1 })} disabled={updateQty.isPending} className="px-3 py-1 hover:bg-offwhite rounded-r-full">+</button>
                        </div>
                        <span className="font-display text-burgundy text-xl">{formatNaira(Number(item.price) * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <aside className="lg:col-span-4">
            <div className="bg-burgundy text-offwhite p-8 rounded-sm sticky top-32">
              <h2 className="font-display uppercase text-gold text-2xl mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm pb-4 border-b border-offwhite/15">
                <div className="flex justify-between"><span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span><span>{formatNaira(subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span>{delivery === 0 ? 'Free' : formatNaira(delivery)}</span></div>
              </div>
              <div className="flex justify-between items-baseline mt-4 mb-6">
                <span className="font-display uppercase text-gold text-xl">Total</span>
                <span className="font-display text-gold text-3xl">{formatNaira(total)}</span>
              </div>
              <Button to="/checkout" variant="gold" size="lg" fullWidth>
                Checkout
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Button>
              <div className="mt-4 text-center text-offwhite/70 text-xs">— or —</div>
              <Button href={waLink('I want to order from my cart')} variant="secondary" size="lg" fullWidth className="mt-4 !text-gold !border-gold/40 hover:!bg-gold hover:!text-burgundy">
                Order via WhatsApp
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}

export default Cart
