import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { useAuth } from '../contexts/AuthContext'
import { useApplyAsVendor, type VendorApplication, type VendorCategory } from '../lib/mutations'
import { useSeo } from '../lib/useSeo'
import { EMAIL_REGEX, NIGERIAN_PHONE_REGEX } from '../lib/constants'

const CATEGORIES: VendorCategory[] = [
  'Mixed', 'Bone Straight', 'Bouncy Hair', 'Pixie Curl', 'Closure Wigs',
  'Frontal Wigs', 'Braided Wigs', 'Colored Wigs', 'Short Wigs', 'Custom Wigs'
]

const SellWithUs: React.FC = () => {
  useSeo({
    title: 'Sell with Luxury Wig City',
    description: 'Become a verified vendor on Luxury Wig City. Apply in 5 minutes — list your wigs to a curated audience of luxury shoppers.'
  })

  const navigate = useNavigate()
  const { user, vendorProfile, isVendor } = useAuth()
  const apply = useApplyAsVendor()

  const [form, setForm] = useState<VendorApplication>({
    store_name: '',
    store_category: '',
    store_tagline: '',
    description: '',
    business_email: '',
    business_address: '',
    phone: '',
    instagram: ''
  })
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const set = <K extends keyof VendorApplication>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value as VendorApplication[K] })
  const blur = (k: string) => () => setTouched(t => ({ ...t, [k]: true }))

  const errors: Record<string, string | null> = {
    store_name:     form.store_name.trim().length < 2 ? 'Enter your store name' : null,
    store_category: !form.store_category ? 'Pick a category' : null,
    business_email: form.business_email && !EMAIL_REGEX.test(form.business_email) ? 'Enter a valid email' : null,
    phone:          form.phone && !NIGERIAN_PHONE_REGEX.test(form.phone.replace(/\s+/g, '')) ? 'Enter a valid Nigerian number' : null
  }
  const isValid = !errors.store_name && !errors.store_category && !errors.business_email && !errors.phone

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ store_name: true, store_category: true, business_email: true, phone: true })
    if (!isValid) return
    await apply.mutateAsync(form)
    navigate('/account')
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="bg-offwhite">
      {/* Hero */}
      <section className="bg-burgundy text-offwhite py-16 lg:py-24 relative overflow-hidden">
        <Logo size={400} variant="mono-gold" className="absolute -top-20 -right-20 opacity-[0.08]" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Become a Vendor —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow leading-none">
            Sell luxury wigs
            <br />
            to luxury shoppers
          </h1>
          <p className="font-serif italic text-offwhite/80 text-lg mt-6 max-w-2xl">
            Curated audience. Verified vendors only. Same-day Abuja delivery handled by our network. You focus on the hair — we handle everything else.
          </p>
        </div>
      </section>

      {/* Why */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 grid md:grid-cols-3 gap-8">
        {[
          { kicker: '01', title: 'Verified marketplace',  body: 'Every vendor is vetted. Every wig is reviewed. Customers shop here because they trust the standard.' },
          { kicker: '02', title: 'Built for luxury',       body: 'Editorial product pages, AI try-on, and a checkout that converts. Your wigs get the showcase they deserve.' },
          { kicker: '03', title: 'You keep the spotlight', body: 'Your store name appears on every listing. Customers can follow you, message you, and reorder from you directly.' }
        ].map(b => (
          <div key={b.kicker}>
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-2">{b.kicker}</div>
            <h2 className="font-display uppercase text-burgundy text-2xl mb-3">{b.title}</h2>
            <p className="text-burgundy/70 font-serif">{b.body}</p>
          </div>
        ))}
      </section>

      {/* Application */}
      <section className="bg-pearl py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— Apply in 5 minutes —</div>
          <h2 className="font-display uppercase text-burgundy text-3xl lg:text-4xl mb-8">Vendor application</h2>

          {!user ? (
            <div className="bg-offwhite p-6 rounded-sm flex flex-wrap items-center justify-between gap-4 border border-burgundy/10">
              <p className="text-sm text-burgundy/80">Sign in or create an account, then come back to apply.</p>
              <Button to="/account" variant="primary" size="md">Sign in</Button>
            </div>
          ) : isVendor ? (
            <div className="bg-offwhite p-6 rounded-sm border border-burgundy/10">
              <h3 className="font-display uppercase text-burgundy text-xl mb-2">You're already a vendor</h3>
              <p className="text-sm text-burgundy/70 mb-5">Welcome back. Head to your dashboard to manage products and orders.</p>
              <Button to="/vendor" variant="primary" size="md">Open vendor dashboard</Button>
            </div>
          ) : vendorProfile?.status === 'pending' ? (
            <div className="bg-offwhite p-6 rounded-sm border border-burgundy/10">
              <h3 className="font-display uppercase text-burgundy text-xl mb-2">Application received</h3>
              <p className="text-sm text-burgundy/70 mb-1">Store: <span className="font-semibold text-burgundy">{vendorProfile.store_name}</span></p>
              <p className="text-sm text-burgundy/70 mb-5">We're reviewing your application — expect a response within 48 hours.</p>
              <Button to="/account" variant="secondary" size="md">Back to account</Button>
            </div>
          ) : vendorProfile?.status === 'rejected' ? (
            <div className="bg-offwhite p-6 rounded-sm border border-burgundy/10">
              <h3 className="font-display uppercase text-burgundy text-xl mb-2">Application not approved</h3>
              {vendorProfile.rejection_reason && (
                <p className="text-sm text-burgundy/70 mb-2"><span className="font-semibold">Reason:</span> {vendorProfile.rejection_reason}</p>
              )}
              <p className="text-sm text-burgundy/70 mb-5">If something has changed since, please reach out and we'll re-open the review.</p>
              <Button to="/contact" variant="secondary" size="md">Contact us</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-offwhite p-6 lg:p-8 rounded-sm border border-burgundy/10 space-y-5">
              <Field label="Store name *" value={form.store_name} onChange={set('store_name')} onBlur={blur('store_name')}
                placeholder="e.g. Crown Hair Atelier" error={touched.store_name ? errors.store_name : null} />

              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Primary category *</label>
                <select
                  value={form.store_category}
                  onChange={set('store_category')}
                  onBlur={blur('store_category')}
                  className={`w-full mt-2 px-4 py-3 border rounded-sm bg-pearl outline-none ${
                    touched.store_category && errors.store_category ? 'border-red-500' : 'border-burgundy/20 focus:border-burgundy'
                  }`}
                >
                  <option value="">Choose one</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {touched.store_category && errors.store_category && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.store_category}</p>
                )}
              </div>

              <Field label="Store tagline" value={form.store_tagline ?? ''} onChange={set('store_tagline')}
                placeholder="One line that captures your brand" maxLength={80} />

              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">About your store</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={set('description')}
                  rows={4}
                  maxLength={500}
                  placeholder="What do you do best? How long have you been making wigs? Where do you source from?"
                  className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-pearl focus:border-burgundy outline-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Business email" value={form.business_email ?? ''} onChange={set('business_email')} onBlur={blur('business_email')}
                  type="email" placeholder="hello@yourbrand.com" error={touched.business_email ? errors.business_email : null} />
                <Field label="WhatsApp / phone" value={form.phone ?? ''} onChange={set('phone')} onBlur={blur('phone')}
                  type="tel" placeholder="08012345678" error={touched.phone ? errors.phone : null} />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Instagram handle" value={form.instagram ?? ''} onChange={set('instagram')}
                  placeholder="@yourbrand" />
                <Field label="Business address" value={form.business_address ?? ''} onChange={set('business_address')}
                  placeholder="Wuse 2, Abuja" />
              </div>

              <p className="text-xs text-burgundy/60 italic font-serif">
                After we approve your application, you'll be able to upload your CAC certificate and government ID from your dashboard. We need them before your first payout.
              </p>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" disabled={apply.isPending || !isValid}>
                  {apply.isPending ? 'Submitting…' : 'Submit application'}
                </Button>
                <Link to="/contact" className="ml-4 text-sm text-burgundy/70 hover:text-burgundy underline">
                  Have questions? Talk to us first.
                </Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

const Field: React.FC<{
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder?: string; type?: string; maxLength?: number; error?: string | null
}> = ({ label, value, onChange, onBlur, placeholder, type = 'text', maxLength, error }) => {
  const showErr = !!error
  return (
    <div>
      <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">{label}</label>
      <input
        type={type} value={value} onChange={onChange} onBlur={onBlur}
        placeholder={placeholder} maxLength={maxLength}
        aria-invalid={showErr || undefined}
        className={`w-full mt-2 px-4 py-3 border rounded-sm bg-pearl outline-none ${
          showErr ? 'border-red-500 focus:border-red-600' : 'border-burgundy/20 focus:border-burgundy'
        }`}
      />
      {showErr && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default SellWithUs
