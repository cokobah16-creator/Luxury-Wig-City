import React from 'react'
import { Logo } from '../components/Logo'
import { Wordmark } from '../components/Wordmark'
import { Button } from '../components/Button'

const zones = [
  { name: 'Wuse · Maitama · Asokoro', time: 'Same-day', fee: 'Free above ₦150K' },
  { name: 'Garki · Central · Utako',  time: 'Same-day', fee: 'Free above ₦150K' },
  { name: 'Gwarinpa · Jabi · Mabushi', time: '24 hours', fee: '₦3,500' },
  { name: 'Lugbe · Kubwa · Karu',     time: '24-48 hours', fee: '₦5,000' },
  { name: 'Lagos (Mainland & Island)', time: '48 hours', fee: '₦8,000' },
  { name: 'Port Harcourt',            time: '48-72 hours', fee: '₦10,000' }
]

const Location: React.FC = () => {
  return (
    <div className="bg-offwhite">
      {/* Hero — recreating the LOCATION poster from brand kit */}
      <section className="bg-burgundy text-offwhite py-20 lg:py-32 relative overflow-hidden">
        <Logo size={500} variant="mono-gold" className="absolute -top-20 -left-20 opacity-[0.06]" />
        <Logo size={500} variant="mono-gold" className="absolute -bottom-20 -right-20 opacity-[0.06]" />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 text-center">
          <Wordmark size="md" color="gold" brand="luxury wig city" className="mx-auto mb-8" />
          <h1 className="font-display uppercase text-gold text-7xl sm:text-8xl lg:text-[180px] leading-none tracking-tight display-shadow">
            Location
          </h1>
          <Logo size={120} variant="gold-on-burgundy" className="mx-auto mt-12" />
        </div>
      </section>

      {/* Showroom info */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— The Showroom —</div>
            <h2 className="font-display uppercase text-burgundy text-5xl lg:text-6xl tracking-tight display-shadow leading-none">
              Visit Us In Abuja
            </h2>
            <p className="font-serif italic text-lg text-burgundy/70 mt-6">
              Try on bestsellers, consult with our master stylists, and walk out wearing your crown.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Address</div>
                  <div className="font-semibold text-burgundy">Plot 1234, Aminu Kano Crescent, Wuse 2</div>
                  <div className="text-sm text-burgundy/70">Abuja, FCT, Nigeria</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Hours</div>
                  <div className="text-burgundy">Mon – Sat · 10:00 – 19:00</div>
                  <div className="text-sm text-burgundy/70">Sunday by appointment</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-burgundy/10 flex items-center justify-center text-burgundy shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div>
                  <div className="text-[11px] tracking-[0.2em] uppercase text-burgundy/70 font-bold">Contact</div>
                  <div className="text-burgundy">+234 800 000 0000</div>
                  <div className="text-sm text-burgundy/70">hello@luxurywigcity.ng</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="primary" size="md">Book Consultation</Button>
              <Button href="https://wa.me/2348000000000" variant="secondary" size="md">
                WhatsApp Us
              </Button>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="relative aspect-square bg-pearl rounded-sm overflow-hidden border border-burgundy/10">
            <div className="absolute inset-0 opacity-30">
              <div className="grid grid-cols-12 grid-rows-12 h-full w-full">
                {Array.from({ length: 144 }).map((_, i) => (
                  <div key={i} className="border border-burgundy/10" />
                ))}
              </div>
            </div>
            {/* Roads */}
            <div className="absolute top-1/3 left-0 w-full h-1.5 bg-burgundy/15 -rotate-3" />
            <div className="absolute top-2/3 left-0 w-full h-1 bg-burgundy/10 rotate-2" />
            <div className="absolute top-0 left-1/2 h-full w-1.5 bg-burgundy/15 rotate-2" />
            {/* Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <div className="relative">
                <Logo size={60} variant="gold-on-burgundy" className="drop-shadow-2xl" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-burgundy rounded-full" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-offwhite/95 backdrop-blur p-3 rounded-sm text-center">
              <div className="font-display uppercase text-burgundy text-sm">Luxury Wig City</div>
              <div className="text-xs text-burgundy/60 mt-0.5">Wuse 2, Abuja</div>
            </div>
            <p className="absolute top-4 right-4 text-[10px] text-burgundy/40 italic">Map preview · Google Maps integration in Phase 2</p>
          </div>
        </div>
      </section>

      {/* Delivery zones */}
      <section className="py-20 bg-pearl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— Delivery Coverage —</div>
            <h2 className="font-display uppercase text-burgundy text-5xl lg:text-6xl tracking-tight display-shadow">
              We Deliver Crowns
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map(zone => (
              <div key={zone.name} className="bg-offwhite border border-burgundy/10 rounded-sm p-6 hover:border-burgundy transition">
                <div className="font-display uppercase text-burgundy text-lg mb-3">{zone.name}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-burgundy/70">⏱ {zone.time}</span>
                  <span className="text-gold-600 font-bold">{zone.fee}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center mt-10 font-serif italic text-burgundy/60">
            International shipping available on request — speak to our team for a quote.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Location
