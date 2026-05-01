import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { useAuth } from '../contexts/AuthContext'
import { useAdminStats, useAdminOrders } from '../lib/queries'
import { supabase } from '../lib/supabase'
import { formatNaira } from '../lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

const statusColors: Record<string, string> = {
  pending:          'bg-gold/20 text-gold-700',
  confirmed:        'bg-blue-100 text-blue-800',
  admin_confirmed:  'bg-blue-100 text-blue-800',
  packed:           'bg-purple-100 text-purple-800',
  dispatched:       'bg-burgundy/15 text-burgundy',
  out_for_delivery: 'bg-burgundy/15 text-burgundy',
  delivered:        'bg-green-100 text-green-800',
  cancelled:        'bg-red-100 text-red-800'
}

const Admin: React.FC = () => {
  const { isAdmin, loading } = useAuth()
  const [view, setView] = useState<'overview' | 'orders' | 'delivery'>('overview')
  const qc = useQueryClient()

  const { data: stats }         = useAdminStats()
  const { data: orders = [] }   = useAdminOrders()

  // Realtime: invalidate orders on any change
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
        qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [qc])

  if (loading) return null
  if (!isAdmin) return <Navigate to="/account" replace />

  const statCards = [
    { label: 'Revenue (All)',  value: stats ? formatNaira(stats.revenue)    : '—' },
    { label: 'Total Orders',   value: stats ? String(stats.orderCount)       : '—' },
    { label: 'Active Products',value: stats ? String(stats.productCount)     : '—' },
    { label: 'Customers',      value: stats ? String(stats.customerCount)    : '—' }
  ]

  const activeDeliveries = orders.filter(o => o.status === 'out_for_delivery' || o.status === 'dispatched')

  return (
    <div className="bg-pearl min-h-screen">
      <section className="bg-burgundy text-offwhite py-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center gap-4">
          <Logo size={56} variant="gold-on-burgundy" />
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold">— Admin Dashboard —</div>
            <h1 className="font-display uppercase text-gold text-3xl lg:text-4xl tracking-tight">Control Panel</h1>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-3 text-xs text-offwhite/70">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>Live · Realtime</span>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 grid lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-2">
          <nav className="space-y-1 lg:sticky lg:top-32">
            {([
              { id: 'overview'  as const, label: 'Overview' },
              { id: 'orders'    as const, label: 'Orders' },
              { id: 'delivery'  as const, label: 'Delivery' }
            ]).map(item => (
              <button key={item.id} onClick={() => setView(item.id)}
                className={`w-full text-left px-4 py-3 rounded-sm text-sm font-semibold transition ${view === item.id ? 'bg-burgundy text-offwhite' : 'text-burgundy hover:bg-offwhite'}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="lg:col-span-10">
          {view === 'overview' && (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(s => (
                  <div key={s.label} className="bg-offwhite p-5 rounded-sm border border-burgundy/10">
                    <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold">{s.label}</div>
                    <div className="font-display text-burgundy text-3xl mt-2">{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-offwhite p-6 rounded-sm border border-burgundy/10">
                <h3 className="font-display uppercase text-burgundy text-xl mb-4">Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className="font-serif italic text-burgundy/50 text-sm">No orders yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold border-b border-burgundy/10">
                          <th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} className="border-b border-burgundy/5">
                            <td className="py-3 font-semibold text-burgundy font-mono text-xs">#{o.id.slice(0,8).toUpperCase()}</td>
                            <td>{o.customer_name ?? o.customer_email ?? '—'}</td>
                            <td className="font-semibold">{formatNaira(Number(o.total_amount))}</td>
                            <td><span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusColors[o.status] ?? ''}`}>{o.status.replace(/_/g,' ')}</span></td>
                            <td className="text-burgundy/60">{new Date(o.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-burgundy text-offwhite p-6 rounded-sm">
                <div className="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">— Phase 4 —</div>
                <h3 className="font-display uppercase text-gold text-xl mt-1">Flutterwave Payments</h3>
                <p className="text-sm text-offwhite/80 mt-2">Payment gateway integration coming next. Orders will auto-confirm on successful payment.</p>
              </div>
            </div>
          )}

          {view === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-display uppercase text-burgundy text-3xl">All Orders ({orders.length})</h2>
              {orders.length === 0 ? (
                <p className="font-serif italic text-burgundy/50">No orders yet.</p>
              ) : (
                <div className="bg-offwhite rounded-sm border border-burgundy/10 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold border-b border-burgundy/10">
                        <th className="p-4">Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-b border-burgundy/5 hover:bg-pearl/40">
                          <td className="p-4 font-semibold text-burgundy font-mono text-xs">#{o.id.slice(0,8).toUpperCase()}</td>
                          <td>{o.customer_name ?? o.customer_email ?? '—'}</td>
                          <td className="font-semibold">{formatNaira(Number(o.total_amount))}</td>
                          <td><span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{o.payment_status}</span></td>
                          <td><span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusColors[o.status] ?? ''}`}>{o.status.replace(/_/g,' ')}</span></td>
                          <td className="text-burgundy/60 pr-4">{new Date(o.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {view === 'delivery' && (
            <div className="space-y-6">
              <h2 className="font-display uppercase text-burgundy text-3xl">Active Deliveries ({activeDeliveries.length})</h2>
              {activeDeliveries.length === 0 ? (
                <p className="font-serif italic text-burgundy/50">No active deliveries.</p>
              ) : (
                <div className="space-y-3">
                  {activeDeliveries.map(o => (
                    <div key={o.id} className="bg-offwhite p-5 rounded-sm border border-burgundy/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-burgundy">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-burgundy">#{o.id.slice(0,8).toUpperCase()} · {o.customer_name ?? '—'}</div>
                        <div className="text-xs text-burgundy/60 mt-0.5">{formatNaira(Number(o.total_amount))} · {o.shipping_city}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusColors[o.status] ?? ''}`}>{o.status.replace(/_/g,' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Admin
