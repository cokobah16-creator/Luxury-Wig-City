import React, { useState } from 'react'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'

const Checkout: React.FC = () => {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', city: 'Abuja', notes: ''
  })
  const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value })

  return (
    <div className="bg-offwhite min-h-screen">
      <section className="bg-burgundy text-offwhite py-14">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Almost There —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
            Checkout
          </h1>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Contact info */}
          <div>
            <h2 className="font-display uppercase text-burgundy text-2xl mb-5">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Full Name" value={form.name} onChange={handle('name')} placeholder="Precious Okoh" />
              <Field label="Phone" value={form.phone} onChange={handle('phone')} placeholder="+234 800 000 0000" />
              <Field label="Email" value={form.email} onChange={handle('email')} placeholder="precious@example.com" wide />
            </div>
          </div>

          {/* Delivery */}
          <div>
            <h2 className="font-display uppercase text-burgundy text-2xl mb-5">Delivery</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Address" value={form.address} onChange={handle('address')} placeholder="Plot 123, Wuse 2" wide />
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">City</label>
                <select value={form.city} onChange={handle('city')} className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none">
                  <option>Abuja</option>
                  <option>Lagos</option>
                  <option>Port Harcourt</option>
                  <option>Other (we'll quote)</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Delivery Notes</label>
              <textarea value={form.notes} onChange={handle('notes')} rows={3} placeholder="Gate code, landmarks, preferred time..." className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none" />
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="font-display uppercase text-burgundy text-2xl mb-5">Payment</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <PayOption icon="card" label="Card / Bank" desc="Paystack secure checkout" />
              <PayOption icon="bank" label="Bank Transfer" desc="GT Bank · Wema · Access" />
              <PayOption icon="whatsapp" label="WhatsApp Confirm" desc="Pay on delivery" />
              <PayOption icon="wallet" label="Flutterwave" desc="Card · USSD · Mobile money" />
            </div>
            <p className="text-xs text-burgundy/50 mt-3 italic">
              Backend integration pending — Paystack &amp; Flutterwave wiring scheduled for Phase 2.
            </p>
          </div>
        </div>

        {/* Order summary */}
        <aside className="lg:col-span-4">
          <div className="bg-pearl p-8 rounded-sm sticky top-32">
            <h2 className="font-display uppercase text-burgundy text-2xl mb-6">Order Summary</h2>
            <div className="space-y-3 text-sm pb-4 border-b border-burgundy/15">
              <div className="flex justify-between"><span>Subtotal</span><span>₦775,000</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className="text-gold-600 font-bold">Free</span></div>
            </div>
            <div className="flex justify-between items-baseline mt-4 mb-6">
              <span className="font-display uppercase text-burgundy text-xl">Total</span>
              <span className="font-display text-burgundy text-3xl">₦775,000</span>
            </div>
            <Button variant="primary" size="lg" fullWidth>Place Order</Button>
            <div className="flex items-center gap-2 mt-4 text-xs text-burgundy/60 justify-center">
              <Logo size={20} variant="mono-burgundy" />
              <span>100% secure · 7-day returns</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

const Field: React.FC<{
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; wide?: boolean
}> = ({ label, value, onChange, placeholder, wide }) => (
  <div className={wide ? 'sm:col-span-2' : ''}>
    <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">{label}</label>
    <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none" />
  </div>
)

const PayOption: React.FC<{ icon: string; label: string; desc: string }> = ({ label, desc }) => (
  <label className="flex items-start gap-3 p-4 border-2 border-burgundy/15 rounded-sm cursor-pointer hover:border-burgundy transition">
    <input type="radio" name="pay" className="mt-1 accent-burgundy" />
    <div>
      <div className="font-semibold text-burgundy">{label}</div>
      <div className="text-xs text-burgundy/60 mt-0.5">{desc}</div>
    </div>
  </label>
)

export default Checkout
