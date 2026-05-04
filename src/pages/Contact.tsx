import React, { useState } from 'react'
import { Logo } from '../components/Logo'
import { Button } from '../components/Button'
import { waLink } from '../lib/constants'

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const handle = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  return (
    <div className="bg-offwhite">
      <section className="bg-burgundy text-offwhite py-14 lg:py-20 relative overflow-hidden">
        <Logo size={400} variant="mono-gold" className="absolute -top-20 -right-20 opacity-[0.08]" />
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Contact —</div>
          <h1 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
            Let's Talk
          </h1>
          <p className="font-serif italic text-offwhite/80 text-lg mt-4 max-w-xl">
            Questions, custom requests, partnership? Reach out — we usually respond within an hour.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 grid lg:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          <h2 className="font-display uppercase text-burgundy text-3xl mb-6">Send a Message</h2>
          <form className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Name</label>
                <input value={form.name} onChange={handle('name')} className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none" />
              </div>
              <div>
                <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Phone</label>
                <input value={form.phone} onChange={handle('phone')} className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Email</label>
              <input value={form.email} onChange={handle('email')} type="email" className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none" />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Message</label>
              <textarea value={form.message} onChange={handle('message')} rows={5} className="w-full mt-2 px-4 py-3 border border-burgundy/20 rounded-sm bg-offwhite focus:border-burgundy outline-none" />
            </div>
            <Button variant="primary" size="lg" type="submit">Send Message</Button>
          </form>
        </div>

        {/* Info */}
        <div className="bg-burgundy text-offwhite p-10 lg:p-12 rounded-sm relative overflow-hidden">
          <Logo size={300} variant="mono-gold" className="absolute -bottom-10 -right-10 opacity-15" />
          <div className="relative">
            <h2 className="font-display uppercase text-gold text-3xl mb-6">Other Ways to Reach Us</h2>

            <div className="space-y-6">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="block p-4 bg-offwhite/5 hover:bg-offwhite/10 rounded-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-burgundy">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4zM12 22c-1.7 0-3.4-.5-4.9-1.4L3 22l1.4-4.1C3.5 16.4 3 14.7 3 13c0-5 4-9 9-9s9 4 9 9-4 9-9 9z"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold">WhatsApp</div>
                    <div className="text-sm text-offwhite/70">+234 800 000 0000</div>
                  </div>
                </div>
              </a>

              <a href="https://instagram.com/luxurywigcity" target="_blank" rel="noopener noreferrer" className="block p-4 bg-offwhite/5 hover:bg-offwhite/10 rounded-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-burgundy">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 5.2c2.5 0 4.6 2.1 4.6 4.6s-2.1 4.6-4.6 4.6S7.4 14.5 7.4 12 9.5 7.4 12 7.4zm0 1.8c-1.5 0-2.8 1.3-2.8 2.8s1.3 2.8 2.8 2.8 2.8-1.3 2.8-2.8-1.3-2.8-2.8-2.8z"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold">Instagram</div>
                    <div className="text-sm text-offwhite/70">@luxurywigcity</div>
                  </div>
                </div>
              </a>

              <a href="mailto:hello@luxurywigcity.ng" className="block p-4 bg-offwhite/5 hover:bg-offwhite/10 rounded-sm transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-burgundy">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <div className="font-semibold">Email</div>
                    <div className="text-sm text-offwhite/70">hello@luxurywigcity.ng</div>
                  </div>
                </div>
              </a>
            </div>

            <div className="mt-10 pt-6 border-t border-offwhite/15 text-sm text-offwhite/70">
              <strong className="text-gold uppercase tracking-wider text-xs">Response Time</strong>
              <p className="mt-2">WhatsApp · within 30 minutes (Mon–Sat)<br/>Email · within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact
