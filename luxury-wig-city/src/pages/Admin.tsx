import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { useAuth } from '../contexts/AuthContext'
import { supabase, formatNaira } from '../lib/supabase'
import {
  useAdminStats,
  useAdminOrders,
  useAdminProducts,
  useAdminCustomers
} from '../lib/queries'
import type { OrderStatus } from '../lib/database.types'

const Admin: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth()
  const [view, setView] = useState<'overview' | 'products' | 'orders' | 'customers' | 'delivery'>('overview')
  const qc = useQueryClient()

  const { data: stats }                         = useAdminStats()
  const { data: orders = [],     isLoading: ordersLoading }    = useAdminOrders()
  const { data: products = [],   isLoading: productsLoading }  = useAdminProducts()
  const { data: customers = [],  isLoading: customersLoading } = useAdminCustomers()

  // Realtime: refresh order/product caches whenever rows change
  useEffect(() => {
    if (!isAdmin) return
    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },   () => {
        qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
        qc.invalidateQueries({ queryKey: ['admin', 'stats']  })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        qc.invalidateQueries({ queryKey: ['admin', 'products'] })
        qc.invalidateQueries({ queryKey: ['admin', 'stats']    })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [isAdmin, qc])

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Logo size={80} variant="gold-on-burgundy" className="animate-pulse" />
      </div>
    )
  }

  if (!isAdmin) return <Navigate to="/account" replace />

  const statCards = [
    { label: 'Revenue (MTD)', value: stats ? formatNaira(stats.revenue) : '—' },
    { label: 'Orders (MTD)',  value: stats ? String(stats.orderCount)   : '—' },
    { label: 'Active Wigs',   value: stats ? String(stats.activeProducts) : '—' },
    { label: 'Avg. Order',    value: stats ? formatNaira(stats.avgOrder) : '—' }
  ]

  return (
    <div className="bg-pearl min-h-screen">
      {/* Top bar */}
      <section className="bg-burgundy text-offwhite py-10">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center gap-4">
          <Logo size={56} variant="gold-on-burgundy" />
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold">— Admin Dashboard —</div>
            <h1 className="font-display uppercase text-gold text-3xl lg:text-4xl tracking-tight">Control Panel</h1>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-3 text-xs text-offwhite/70">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span>Live · Realtime sync</span>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-10 grid lg:grid-cols-12 gap-8">
        {/* Sidebar nav */}
        <aside className="lg:col-span-2">
          <nav className="space-y-1 lg:sticky lg:top-32">
            {([
              { id: 'overview'  as const, label: 'Overview' },
              { id: 'products'  as const, label: 'Products' },
              { id: 'orders'    as const, label: 'Orders' },
              { id: 'customers' as const, label: 'Customers' },
              { id: 'delivery'  as const, label: 'Delivery' }
            ]).map(item => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`w-full text-left px-4 py-3 rounded-sm text-sm font-semibold transition ${
                  view === item.id ? 'bg-burgundy text-offwhite' : 'text-burgundy hover:bg-offwhite'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main panel */}
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
                <OrdersTable orders={orders.slice(0, 6)} loading={ordersLoading} compact />
              </div>
            </div>
          )}

          {view === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display uppercase text-burgundy text-3xl">Products ({products.length})</h2>
                <Button variant="primary" size="md" disabled>+ Add Wig</Button>
              </div>
              <div className="bg-offwhite rounded-sm border border-burgundy/10 overflow-x-auto">
                {productsLoading ? (
                  <Skeleton rows={4} />
                ) : products.length === 0 ? (
                  <p className="p-8 text-center font-serif italic text-burgundy/60">No products yet — seed the catalogue once Supabase is provisioned.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold border-b border-burgundy/10">
                        <th className="p-4">Wig</th>
                        <th>Category</th>
                        <th>Vendor</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} className="border-b border-burgundy/5 hover:bg-pearl/40">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 bg-burgundy rounded-sm flex items-center justify-center shrink-0 overflow-hidden">
                                {p.images?.[0]
                                  ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                  : <Logo size={28} variant="mono-gold" className="opacity-70" />}
                              </div>
                              <div>
                                <div className="font-semibold text-burgundy">{p.name}</div>
                                <div className="text-xs text-burgundy/50">
                                  {p.length_inches ? `${p.length_inches}"` : '—'}{p.lace_type ? ` · ${p.lace_type}` : ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>{p.category}</td>
                          <td className="text-burgundy/70">{p.vendor_name ?? '—'}</td>
                          <td className="font-semibold">{formatNaira(p.price)}</td>
                          <td>{p.stock}</td>
                          <td>
                            <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${
                              p.status === 'active' ? 'bg-green-100 text-green-800'
                              : p.status === 'draft' ? 'bg-gold/20 text-gold-700'
                              : 'bg-red-100 text-red-800'
                            }`}>{p.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {view === 'orders' && (
            <div className="space-y-6">
              <h2 className="font-display uppercase text-burgundy text-3xl">Orders</h2>
              <div className="bg-offwhite rounded-sm border border-burgundy/10 overflow-x-auto">
                <OrdersTable orders={orders} loading={ordersLoading} />
              </div>
            </div>
          )}

          {view === 'customers' && (
            <div className="space-y-6">
              <h2 className="font-display uppercase text-burgundy text-3xl">Customers</h2>
              {customersLoading ? <Skeleton rows={4} /> : customers.length === 0 ? (
                <p className="p-8 text-center font-serif italic text-burgundy/60">No customers yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {customers.map(c => (
                    <div key={c.id} className="bg-offwhite p-5 rounded-sm border border-burgundy/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-burgundy text-gold flex items-center justify-center font-display italic font-bold">
                          {(c.full_name ?? '? ?').split(' ').map(p => p[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-burgundy">{c.full_name ?? 'Unnamed'}</div>
                          <div className="text-xs text-burgundy/40 mt-0.5">Joined {new Date(c.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {view === 'delivery' && (
            <div className="space-y-6">
              <h2 className="font-display uppercase text-burgundy text-3xl">Active Deliveries</h2>
              <div className="space-y-3">
                {orders.filter(o => o.status === 'out_for_delivery' || o.status === 'dispatched' || o.status === 'packed').map(o => (
                  <div key={o.id} className="bg-offwhite p-5 rounded-sm border border-burgundy/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-burgundy">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-burgundy">#{o.id.slice(0, 8).toUpperCase()} · {o.customer_name ?? '—'}</div>
                      <div className="text-xs text-burgundy/60 mt-0.5">{o.items.length} item(s) · {formatNaira(Number(o.total_amount))}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusPill[o.status]}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
                {orders.filter(o => ['out_for_delivery', 'dispatched', 'packed'].includes(o.status)).length === 0 && (
                  <p className="p-8 text-center font-serif italic text-burgundy/60">No deliveries in flight.</p>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

const statusPill: Record<OrderStatus, string> = {
  pending:           'bg-orange-100 text-orange-800',
  confirmed:         'bg-gold/20 text-gold-700',
  admin_confirmed:   'bg-gold/20 text-gold-700',
  packed:            'bg-burgundy/15 text-burgundy',
  dispatched:        'bg-burgundy/15 text-burgundy',
  out_for_delivery:  'bg-burgundy/15 text-burgundy',
  delivered:         'bg-green-100 text-green-800',
  cancelled:         'bg-red-100 text-red-800'
}

interface OrderRow {
  id:             string
  customer_name:  string | null
  items:          unknown[]
  total_amount:   number
  status:         OrderStatus
  created_at:     string
}

const OrdersTable: React.FC<{ orders: OrderRow[]; loading?: boolean; compact?: boolean }> = ({ orders, loading, compact }) => {
  if (loading) return <Skeleton rows={4} />
  if (orders.length === 0) {
    return <p className="p-8 text-center font-serif italic text-burgundy/60">No orders yet.</p>
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold border-b border-burgundy/10">
          <th className={compact ? 'py-2' : 'p-4'}>Order</th>
          <th>Customer</th>
          {!compact && <th>Items</th>}
          <th>Total</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(o => (
          <tr key={o.id} className="border-b border-burgundy/5">
            <td className={compact ? 'py-3 font-semibold text-burgundy' : 'p-4 font-semibold text-burgundy'}>
              #{o.id.slice(0, 8).toUpperCase()}
            </td>
            <td>{o.customer_name ?? '—'}</td>
            {!compact && <td>{o.items.length}</td>}
            <td className="font-semibold">{formatNaira(Number(o.total_amount))}</td>
            <td>
              <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusPill[o.status]}`}>
                {o.status.replace(/_/g, ' ')}
              </span>
            </td>
            <td className="text-burgundy/60">{new Date(o.created_at).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const Skeleton: React.FC<{ rows: number }> = ({ rows }) => (
  <div className="p-4 space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-pearl rounded-sm animate-pulse" />
    ))}
  </div>
)

export default Admin
