import React, { useState } from 'react'
import { Button } from '../components/Button'
import { Logo } from '../components/Logo'
import { useCart } from '../lib/queries'
import { useCreateOrder } from '../lib/mutations'
import { useAuth } from '../contexts/AuthContext'
import { formatNaira } from '../lib/supabase'
import { calcDelivery, NIGERIAN_PHONE_REGEX, EMAIL_REGEX } from '../lib/constants'
import { useSeo } from '../lib/useSeo'

const Checkout: React.FC = () => {
  useSeo({ title: 'Checkout', noIndex: true })
  const { user, profile } = useAuth()
  const { data: cartItems = [] } = useCart()
  const createOrder = useCreateOrder()

  const [form, setForm] = useState({
    name:    profile?.full_name ?? '',
    phone:   '',
    email:   user?.email ?? '',
    address: '',
    city:    'Abuja',
    notes:   ''
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handle = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value })
  const blur = (k: string) => () => setTouched(t => ({ ...t, [k]: true }))

  const errors: Record<string, string | null> = {
    name:    form.name.trim().length < 2 ? 'Please enter your full name' : null,
    phone:   !NIGERIAN_PHONE_REGEX.test(form.phone.replace(/\s+/g, '')) ? 'Enter a valid Nigerian number, e.g. 08012345678' : null,
    email:   form.email && !EMAIL_REGEX.test(form.email) ? 'Enter a valid email address' : null,
    address: form.address.trim().length < 5 ? 'Please enter a delivery address' : null
  }
  const isValid = !errors.name && !errors.phone && !errors.email && !errors.address

  const subtotal = cartItems.reduce((s, i) => s + Number(i.price) * i.quantity, 0)
  const delivery  = calcDelivery(subtotal)
  const total     = subtotal + delivery

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ name: true, phone: true, email: true, address: true })
    if (!isValid) return
    await createOrder.mutateAsync({
      cartItems,
      shipping: {
        name:    form.name,
        phone:   form.phone,
        email:   form.email,
        address: form.address,
        city:    form.city
      }
    })
  }

  return (
    <div className="bg-offwhite min-h-screen">
      <section className="bg-burgundy text-offwhite py-14">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Almost There —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">Checkout</h1>
        </div>
      </section>

      <form onSubmit={handlePlaceOrder}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <div>
              <h2 className="font-display uppercase text-burgundy text-2xl mb-5">Contact</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Full Name *" value={form.name} onChange={handle('name')} onBlur={blur('name')} placeholder="Precious Okoh" required error={touched.name ? errors.name : null} />
                <Field label="Phone *" value={form.phone} onChange={handle('phone')} onBlur={blur('phone')} placeholder="08012345678 or +2348012345678" required type="tel" error={touched.phone ? errors.phone : null} />
                <Field label="Email" value={form.email} onChange={handle('email')} onBlur={blur('email')} placeholder="precious@example.com" wide type="email" error={touched.email ? errors.email : null} />
              </div>
            </div>

            <div>
              <h2 className="font-display uppercase text-burgundy text-2xl mb-5">Delivery</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Address *" value={form.address} onChange={handle('address')} onBlur={blur('address')} placeholder="Plot 123, Wuse 2" wide required error={touched.address ? errors.address : null} />
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

            <div>
              <h2 className="font-display uppercase text-burgundy text-2xl mb-5">Payment</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <PayOption label="Card / Bank" desc="Paystack secure checkout" />
                <PayOption label="Bank Transfer" desc="GT Bank · Wema · Access" />
                <PayOption label="WhatsApp Confirm" desc="Pay on delivery" />
                <PayOption label="Flutterwave" desc="Card · USSD · Mobile money" />
              </div>
              <p className="text-xs text-burgundy/50 mt-3 italic">
                Payment gateway wiring coming in Phase 4. Place your order now and our team will confirm payment details via WhatsApp.
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="bg-pearl p-8 rounded-sm sticky top-32">
              <h2 className="font-display uppercase text-burgundy text-2xl mb-6">Order Summary</h2>
              {cartItems.length === 0 ? (
                <p className="font-serif italic text-burgundy/60 text-sm">Your cart is empty.</p>
              ) : (
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-burgundy/80 truncate mr-2">{item.product_name} ×{item.quantity}</span>
                      <span className="font-semibold shrink-0">{formatNaira(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3 text-sm pb-4 border-b border-burgundy/15">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatNaira(subtotal)}</span></div>
                <div className="flex justify-between"><span>Delivery</span><span className={delivery === 0 ? 'text-gold-600 font-bold' : ''}>{delivery === 0 ? 'Free' : formatNaira(delivery)}</span></div>
              </div>
              <div className="flex justify-between items-baseline mt-4 mb-6">
                <span className="font-display uppercase text-burgundy text-xl">Total</span>
                <span className="font-display text-burgundy text-3xl">{formatNaira(total)}</span>
              </div>
              <Button type="submit" variant="primary" size="lg" fullWidth disabled={createOrder.isPending || cartItems.length === 0 || !isValid}>
                {createOrder.isPending ? 'Placing Order…' : 'Place Order'}
              </Button>
              {!isValid && Object.keys(touched).length > 0 && (
                <p className="text-xs text-burgundy/70 text-center mt-3" role="status">
                  Please fix the highlighted fields above.
                </p>
              )}
              <div className="flex items-center gap-2 mt-4 text-xs text-burgundy/60 justify-center">
                <Logo size={20} variant="mono-burgundy" />
                <span>100% secure · 7-day returns</span>
              </div>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}

const Field: React.FC<{
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder?: string; wide?: boolean; required?: boolean
  type?: string; error?: string | null
}> = ({ label, value, onChange, onBlur, placeholder, wide, required, type = 'text', error }) => {
  const showErr = !!error
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">{label}</label>
      <input
        type={type} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} required={required}
        aria-invalid={showErr || undefined}
        aria-describedby={showErr ? `${label}-err` : undefined}
        className={`w-full mt-2 px-4 py-3 border rounded-sm bg-offwhite outline-none transition ${
          showErr ? 'border-red-500 focus:border-red-600' : 'border-burgundy/20 focus:border-burgundy'
        }`}
      />
      {showErr && (
        <p id={`${label}-err`} className="mt-1.5 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

const PayOption: React.FC<{ label: string; desc: string }> = ({ label, desc }) => (
  <label className="flex items-start gap-3 p-4 border-2 border-burgundy/15 rounded-sm cursor-pointer hover:border-burgundy transition">
    <input type="radio" name="pay" className="mt-1 accent-burgundy" />
    <div>
      <div className="font-semibold text-burgundy">{label}</div>
      <div className="text-xs text-burgundy/60 mt-0.5">{desc}</div>
    </div>
  </label>
)

export default Checkout
