import React, { useState } from 'react'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { wigs, formatNaira } from '../data/wigs'

const Admin: React.FC = () => {
  const [view, setView] = useState<'overview' | 'products' | 'orders' | 'customers' | 'delivery'>('overview')

  const stats = [
    { label: 'Revenue (MTD)', value: '₦4,285,000', delta: '+18%' },
    { label: 'Orders (MTD)',  value: '24',          delta: '+6'   },
    { label: 'Active Wigs',   value: wigs.length.toString(), delta: '+2' },
    { label: 'Avg. Order',    value: '₦178,541',    delta: '+₦12k' }
  ]

  const orders = [
    { id: '#LWC-3284', customer: 'Adaeze Onyeka',     items: 1, total: 285000, status: 'Processing', date: 'Apr 28' },
    { id: '#LWC-3283', customer: 'Chiamaka Nwosu',    items: 2, total: 410000, status: 'Out for Delivery', date: 'Apr 28' },
    { id: '#LWC-3282', customer: 'Folake Ibrahim',    items: 1, total: 165000, status: 'Delivered', date: 'Apr 27' },
    { id: '#LWC-3281', customer: 'Tomi Adelaja',      items: 3, total: 685000, status: 'Pending Payment', date: 'Apr 27' },
    { id: '#LWC-3280', customer: 'Ngozi Eze',         items: 1, total: 245000, status: 'Delivered', date: 'Apr 26' }
  ]

  const customers = [
    { name: 'Adaeze Onyeka',  email: 'adaeze@example.com',  orders: 6, lifetime: 1840000, location: 'Abuja' },
    { name: 'Chiamaka Nwosu', email: 'chi@example.com',     orders: 4, lifetime: 1240000, location: 'Lagos' },
    { name: 'Folake Ibrahim', email: 'folake@example.com',  orders: 3, lifetime:  725000, location: 'Abuja' },
    { name: 'Tomi Adelaja',   email: 'tomi@example.com',    orders: 2, lifetime:  890000, location: 'Lagos' }
  ]

  const statusColors: Record<string, string> = {
    'Processing':         'bg-gold/20 text-gold-700',
    'Out for Delivery':   'bg-burgundy/15 text-burgundy',
    'Delivered':          'bg-green-100 text-green-800',
    'Pending Payment':    'bg-orange-100 text-orange-800'
  }

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
            <span>Live · Last sync 2 min ago</span>
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
          {/* OVERVIEW */}
          {view === 'overview' && (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                  <div key={s.label} className="bg-offwhite p-5 rounded-sm border border-burgundy/10">
                    <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold">{s.label}</div>
                    <div className="font-display text-burgundy text-3xl mt-2">{s.value}</div>
                    <div className="text-xs text-gold-700 font-bold mt-1">{s.delta}</div>
                  </div>
                ))}
              </div>

              <div className="bg-offwhite p-6 rounded-sm border border-burgundy/10">
                <h3 className="font-display uppercase text-burgundy text-xl mb-4">Recent Orders</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold border-b border-burgundy/10">
                        <th className="py-2">Order</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 4).map(o => (
                        <tr key={o.id} className="border-b border-burgundy/5">
                          <td className="py-3 font-semibold text-burgundy">{o.id}</td>
                          <td>{o.customer}</td>
                          <td className="font-semibold">{formatNaira(o.total)}</td>
                          <td><span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusColors[o.status]}`}>{o.status}</span></td>
                          <td className="text-burgundy/60">{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-burgundy text-offwhite p-6 rounded-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-gold font-bold">— Phase 2 —</div>
                    <h3 className="font-display uppercase text-gold text-xl mt-1">Connect Your Backend</h3>
                    <p className="text-sm text-offwhite/80 mt-2 max-w-lg">
                      Wire this dashboard to Supabase to unlock real-time data, automated order tracking, and inventory sync.
                    </p>
                  </div>
                  <Button variant="gold" size="md">View Roadmap</Button>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {view === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display uppercase text-burgundy text-3xl">Products ({wigs.length})</h2>
                <Button variant="primary" size="md">+ Add Wig</Button>
              </div>
              <div className="bg-offwhite rounded-sm border border-burgundy/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold border-b border-burgundy/10">
                      <th className="p-4">Wig</th>
                      <th>Category</th>
                      <th>Vendor</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {wigs.map(w => (
                      <tr key={w.id} className="border-b border-burgundy/5 hover:bg-pearl/40">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-12 bg-burgundy rounded-sm flex items-center justify-center shrink-0">
                              <Logo size={28} variant="mono-gold" className="opacity-70" />
                            </div>
                            <div>
                              <div className="font-semibold text-burgundy">{w.name}</div>
                              <div className="text-xs text-burgundy/50">{w.length}" · {w.laceType}</div>
                            </div>
                          </div>
                        </td>
                        <td>{w.category}</td>
                        <td className="text-burgundy/70">{w.vendor}</td>
                        <td className="font-semibold">{formatNaira(w.price)}</td>
                        <td>{Math.floor(Math.random() * 8) + 2}</td>
                        <td><span className="text-[10px] px-2 py-1 rounded bg-green-100 text-green-800 font-semibold uppercase tracking-wider">Live</span></td>
                        <td className="pr-4 text-right"><button className="text-burgundy/60 hover:text-burgundy text-xs underline">Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {view === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display uppercase text-burgundy text-3xl">Orders</h2>
                <select className="text-sm border border-burgundy/20 rounded-full px-4 py-2 bg-offwhite focus:border-burgundy outline-none">
                  <option>All statuses</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Out for Delivery</option>
                  <option>Delivered</option>
                </select>
              </div>
              <div className="bg-offwhite rounded-sm border border-burgundy/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-burgundy/60 font-bold border-b border-burgundy/10">
                      <th className="p-4">Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-burgundy/5 hover:bg-pearl/40">
                        <td className="p-4 font-semibold text-burgundy">{o.id}</td>
                        <td>{o.customer}</td>
                        <td>{o.items}</td>
                        <td className="font-semibold">{formatNaira(o.total)}</td>
                        <td><span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusColors[o.status]}`}>{o.status}</span></td>
                        <td className="text-burgundy/60">{o.date}</td>
                        <td className="pr-4 text-right"><button className="text-burgundy/60 hover:text-burgundy text-xs underline">View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {view === 'customers' && (
            <div className="space-y-6">
              <h2 className="font-display uppercase text-burgundy text-3xl">Customers</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {customers.map(c => (
                  <div key={c.email} className="bg-offwhite p-5 rounded-sm border border-burgundy/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-burgundy text-gold flex items-center justify-center font-display italic font-bold">
                          {c.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-burgundy">{c.name}</div>
                          <div className="text-xs text-burgundy/60">{c.email}</div>
                          <div className="text-xs text-burgundy/40 mt-0.5">📍 {c.location}</div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded bg-gold/20 text-gold-700 font-bold uppercase tracking-wider">VIP</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-burgundy/5">
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/50 font-bold">Orders</div>
                        <div className="font-display text-burgundy text-xl">{c.orders}</div>
                      </div>
                      <div>
                        <div className="text-[10px] tracking-[0.2em] uppercase text-burgundy/50 font-bold">Lifetime</div>
                        <div className="font-display text-burgundy text-xl">{formatNaira(c.lifetime)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DELIVERY */}
          {view === 'delivery' && (
            <div className="space-y-6">
              <h2 className="font-display uppercase text-burgundy text-3xl">Active Deliveries</h2>
              <div className="space-y-3">
                {orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Processing').map(o => (
                  <div key={o.id} className="bg-offwhite p-5 rounded-sm border border-burgundy/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-burgundy">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-burgundy">{o.id} · {o.customer}</div>
                      <div className="text-xs text-burgundy/60 mt-0.5">{o.items} item(s) · {formatNaira(o.total)}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded font-semibold uppercase tracking-wider ${statusColors[o.status]}`}>{o.status}</span>
                    <button className="text-burgundy/60 hover:text-burgundy text-xs underline">Track</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Admin
