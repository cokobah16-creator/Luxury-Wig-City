import React, { useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { Skeleton } from '../components/Skeleton'
import { useAuth } from '../contexts/AuthContext'
import { useOrder } from '../lib/queries'
import { supabase, formatNaira } from '../lib/supabase'
import { waLink } from '../lib/constants'
import { useSeo } from '../lib/useSeo'
import type { OrderStatus } from '../lib/database.types'

const TIMELINE: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'pending',          label: 'Order placed',     description: 'We’ve received your order.' },
  { status: 'confirmed',        label: 'Payment confirmed',description: 'Your payment has been confirmed.' },
  { status: 'packed',           label: 'Packed',           description: 'Your wig is boxed and ready to leave.' },
  { status: 'dispatched',       label: 'Dispatched',       description: 'On its way to your delivery zone.' },
  { status: 'out_for_delivery', label: 'Out for delivery', description: 'Our courier is heading to you.' },
  { status: 'delivered',        label: 'Delivered',        description: 'Wear it like a crown.' }
]

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending:          0,
  confirmed:        1,
  admin_confirmed:  1,
  packed:           2,
  dispatched:       3,
  out_for_delivery: 4,
  delivered:        5,
  cancelled:        -1
}

const OrderTracking: React.FC = () => {
  useSeo({ title: 'Track Order', noIndex: true })
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()
  const qc = useQueryClient()
  const { data: order, isLoading, error } = useOrder(id)

  // Realtime: refresh this order when it changes
  useEffect(() => {
    if (!id) return
    const channel = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, () => {
        qc.invalidateQueries({ queryKey: ['order', id] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, qc])

  if (authLoading) return null
  if (!user) return <Navigate to="/account" replace />

  if (isLoading) {
    return (
      <div className="bg-offwhite min-h-screen">
        <section className="bg-burgundy text-offwhite py-14">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-12 space-y-3">
            <Skeleton className="h-3 w-40 bg-offwhite/20" />
            <Skeleton className="h-16 w-64 bg-offwhite/20" />
          </div>
        </section>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10" aria-busy="true" aria-label="Loading order">
          <div className="lg:col-span-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-5">
                <Skeleton className="w-8 h-8" rounded="full" />
                <div className="flex-1 space-y-2 pb-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
          <aside className="lg:col-span-4">
            <Skeleton className="h-80 w-full" />
          </aside>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-offwhite min-h-screen flex flex-col items-center justify-center text-center px-6">
        <Logo size={80} variant="mono-burgundy" className="opacity-50 mb-6" />
        <h1 className="font-display uppercase text-burgundy text-3xl mb-2">Order not found</h1>
        <p className="font-serif italic text-burgundy/60 mb-6">We couldn’t locate this order on your account.</p>
        <Button to="/account?view=orders" variant="primary" size="md">View my orders</Button>
      </div>
    )
  }

  const isCancelled = order.status === 'cancelled'
  const currentIdx = STATUS_INDEX[order.status] ?? 0

  return (
    <div className="bg-offwhite min-h-screen">
      <section className="bg-burgundy text-offwhite py-14">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Order #{order.id.slice(0, 8).toUpperCase()} —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
            {isCancelled ? 'Cancelled' : 'Tracking'}
          </h1>
          <p className="font-serif italic text-offwhite/80 text-lg mt-4">
            Placed {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10">
        {/* Timeline */}
        <div className="lg:col-span-8">
          <h2 className="font-display uppercase text-burgundy text-2xl mb-8">Status</h2>

          {isCancelled ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded-sm">
              <div className="text-red-800 font-semibold mb-2">This order was cancelled.</div>
              <p className="text-sm text-red-700">If this wasn’t you, please reach out so we can help.</p>
            </div>
          ) : (
            <ol className="space-y-0" aria-label="Order status timeline">
              {TIMELINE.map((step, i) => {
                const isDone    = i <  currentIdx
                const isCurrent = i === currentIdx
                const isFuture  = i >  currentIdx
                return (
                  <li key={step.status} className="flex gap-5 pb-8 relative">
                    {/* Connector line */}
                    {i < TIMELINE.length - 1 && (
                      <span
                        className={`absolute left-[15px] top-8 bottom-0 w-px ${isDone ? 'bg-burgundy' : 'bg-burgundy/15'}`}
                        aria-hidden="true"
                      />
                    )}
                    {/* Dot */}
                    <span
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition ${
                        isDone    ? 'bg-burgundy text-gold' :
                        isCurrent ? 'bg-gold text-burgundy ring-4 ring-gold/30 animate-pulse' :
                                    'bg-pearl text-burgundy/30 border border-burgundy/15'
                      }`}
                      aria-hidden="true"
                    >
                      {isDone ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7"/></svg>
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </span>
                    <div className={`flex-1 ${isFuture ? 'opacity-50' : ''}`}>
                      <div className={`font-semibold ${isCurrent ? 'text-burgundy' : 'text-ink'}`}>
                        {step.label}
                        {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-gold-700 font-bold">Now</span>}
                      </div>
                      <div className="text-sm text-burgundy/60 mt-1">{step.description}</div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}

          {/* Items */}
          <h2 className="font-display uppercase text-burgundy text-2xl mt-12 mb-5">Items</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => {
              const variantLine = [item.length, item.cap_size, item.color].filter(Boolean).join(' · ')
              return (
                <Link
                  key={i}
                  to={`/shop/${item.product_id}`}
                  className="flex gap-4 p-4 bg-pearl rounded-sm hover:bg-pearl/70 transition"
                >
                  <div className="w-20 h-24 bg-burgundy rounded-sm shrink-0 flex items-center justify-center overflow-hidden">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.product_name} loading="lazy" className="w-full h-full object-cover" />
                      : <Logo size={48} variant="mono-gold" className="opacity-70" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-burgundy truncate">{item.product_name}</div>
                    {variantLine && <div className="text-xs text-burgundy/60 mt-1">{variantLine}</div>}
                    <div className="text-xs text-burgundy/60 mt-1">Qty {item.quantity}</div>
                  </div>
                  <div className="font-display text-burgundy text-lg">{formatNaira(Number(item.price) * item.quantity)}</div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Summary sidebar */}
        <aside className="lg:col-span-4">
          <div className="bg-burgundy text-offwhite p-8 rounded-sm sticky top-32">
            <h2 className="font-display uppercase text-gold text-2xl mb-6">Summary</h2>

            <div className="space-y-3 text-sm pb-4 border-b border-offwhite/15">
              <div className="flex justify-between"><span>Total</span><span className="font-display text-gold text-xl">{formatNaira(Number(order.total_amount))}</span></div>
              <div className="flex justify-between"><span>Payment</span>
                <span className={`uppercase text-[10px] tracking-[0.2em] font-bold px-2 py-1 rounded-sm ${
                  order.payment_status === 'paid'   ? 'bg-green-100 text-green-800' :
                  order.payment_status === 'failed' ? 'bg-red-100 text-red-800'     :
                                                      'bg-gold/20 text-gold'
                }`}>{order.payment_status}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-offwhite/85">
              <div className="text-[11px] tracking-[0.2em] uppercase text-gold font-bold">Delivering to</div>
              <div>{order.customer_name}</div>
              {order.shipping_address && <div className="text-offwhite/70">{order.shipping_address}</div>}
              {order.shipping_city && <div className="text-offwhite/70">{order.shipping_city}{order.shipping_state ? `, ${order.shipping_state}` : ''}</div>}
              {order.phone && <div className="text-offwhite/70">{order.phone}</div>}
            </div>

            <div className="mt-6 space-y-3">
              <Button
                href={waLink(`Hi, I'd like an update on my order #${order.id.slice(0, 8).toUpperCase()}`)}
                variant="gold"
                size="md"
                fullWidth
              >
                Get help on WhatsApp
              </Button>
              <Button to="/account?view=orders" variant="secondary" size="md" fullWidth className="!text-gold !border-gold/40 hover:!bg-gold hover:!text-burgundy">
                Back to my orders
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default OrderTracking
