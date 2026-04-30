import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { wigs, formatNaira } from '../data/wigs'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'

const Cart: React.FC = () => {
  // Mock cart with first 2 wigs
  const [items, setItems] = useState([
    { wig: wigs[0], qty: 1 },
    { wig: wigs[3], qty: 2 }
  ])

  const updateQty = (id: string, delta: number) =>
    setItems(prev => prev.map(it =>
      it.wig.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it
    ))

  const remove = (id: string) =>
    setItems(prev => prev.filter(it => it.wig.id !== id))

  const subtotal = items.reduce((s, it) => s + it.wig.price * it.qty, 0)
  const delivery = subtotal > 150000 ? 0 : 5000
  const total = subtotal + delivery

  return (
    <div className="bg-offwhite min-h-screen">
      <section className="bg-burgundy text-offwhite py-14">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Your Bag —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
            Cart
          </h1>
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
              {items.map(({ wig, qty }) => (
                <div key={wig.id} className="flex gap-4 p-4 bg-pearl rounded-sm">
                  <div className="w-24 h-32 bg-burgundy rounded-sm shrink-0 flex items-center justify-center">
                    <Logo size={60} variant="mono-gold" className="opacity-70" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] tracking-widest uppercase text-burgundy/60">{wig.category}</div>
                        <h3 className="font-display uppercase text-burgundy text-xl">{wig.name}</h3>
                        <div className="text-xs text-burgundy/60 mt-1">{wig.length}" · {wig.laceType}</div>
                      </div>
                      <button onClick={() => remove(wig.id)} className="text-burgundy/40 hover:text-burgundy">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-burgundy/20 rounded-full">
                        <button onClick={() => updateQty(wig.id, -1)} className="px-3 py-1 hover:bg-offwhite rounded-l-full">−</button>
                        <span className="px-3 py-1 font-semibold text-sm">{qty}</span>
                        <button onClick={() => updateQty(wig.id, 1)} className="px-3 py-1 hover:bg-offwhite rounded-r-full">+</button>
                      </div>
                      <span className="font-display text-burgundy text-xl">{formatNaira(wig.price * qty)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <aside className="lg:col-span-4">
            <div className="bg-burgundy text-offwhite p-8 rounded-sm sticky top-32">
              <h2 className="font-display uppercase text-gold text-2xl mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm pb-4 border-b border-offwhite/15">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
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

              <Button
                href="https://wa.me/2348000000000?text=I%20want%20to%20order%20from%20my%20cart"
                variant="secondary"
                size="lg"
                fullWidth
                className="mt-4 !text-gold !border-gold/40 hover:!bg-gold hover:!text-burgundy"
              >
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
