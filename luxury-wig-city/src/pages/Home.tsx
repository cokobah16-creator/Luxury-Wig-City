import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Wordmark } from '../components/Wordmark'
import { Button } from '../components/Button'
import { ProductCard } from '../components/ProductCard'
import { useProducts } from '../lib/queries'

const categories = [
  { name: 'Bone Straight', count: 26, slug: 'Bone Straight' },
  { name: 'Pixie Curl',    count: 14, slug: 'Pixie Curl' },
  { name: 'Frontal Wigs',  count: 38, slug: 'Frontal Wigs' },
  { name: 'Closure Wigs',  count: 22, slug: 'Closure Wigs' },
  { name: 'Braided Wigs',  count: 18, slug: 'Braided Wigs' }
]

const Home: React.FC = () => {
  const { data: bestSellers = [] } = useProducts({ isFeatured: true, limit: 4 })

  return (
    <div>
      {/* HERO — yellow background, big editorial display, exact brand */}
      <section className="relative bg-gold overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-16 lg:pt-16 lg:pb-24 grid lg:grid-cols-12 gap-8 items-center min-h-[80vh]">
          {/* Left: Mascot illustration (poster style) */}
          <div className="lg:col-span-5 relative reveal d-1">
            <div className="relative max-w-[420px] mx-auto">
              <Logo size={420} variant="mono-burgundy" className="w-full h-auto" />
            </div>
          </div>

          {/* Right: Tagline + CTAs */}
          <div className="lg:col-span-7 relative">
            {/* Wordmark */}
            <div className="reveal d-2 mb-8">
              <Wordmark size="md" color="burgundy" />
            </div>

            <h1 className="reveal d-3 font-display uppercase text-burgundy text-[60px] sm:text-[88px] lg:text-[120px] leading-[0.92] tracking-tight display-shadow">
              Because<br/>
              Your Hair<br/>
              Is The Crown
            </h1>

            <p className="reveal d-4 mt-8 font-serif italic text-burgundy/85 text-xl lg:text-2xl max-w-xl leading-snug">
              Premium wigs, vetted vendors, and AI-matched styles built for African beauty — delivered across Abuja and beyond.
            </p>

            <div className="reveal d-5 mt-10 flex flex-wrap items-center gap-4">
              <Button to="/shop" variant="primary" size="lg">
                Shop Wigs
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </Button>
              <Button to="/try-on" variant="secondary" size="lg">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"/></svg>
                Try On Virtually
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom decorative band */}
        <div className="bg-burgundy text-gold py-4 overflow-hidden">
          <div className="flex items-center gap-4 marquee-track" style={{ width: 'max-content' }}>
            {Array.from({ length: 2 }).map((_, repeat) => (
              <React.Fragment key={repeat}>
                {['Your Hair\'s BFF', '✦', 'Wig It Up', '✦', '100% Verified Vendors', '✦', 'Abuja Delivery', '✦', 'AI Wig Match', '✦'].map((label, i) => (
                  <span key={`${repeat}-${i}`} className="font-display uppercase text-2xl tracking-wider whitespace-nowrap px-4">
                    {label}
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED CATEGORIES */}
      <section className="py-20 lg:py-28 bg-offwhite">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-14">
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— The Collection —</div>
            <h2 className="font-display uppercase text-burgundy text-5xl lg:text-7xl tracking-tight display-shadow">
              Find Your Style
            </h2>
            <p className="font-serif italic text-burgundy/70 text-lg mt-4 max-w-xl mx-auto">
              From boardroom to wedding aisle. Every texture, every length, vetted and verified.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.name}
                to={`/shop?cat=${cat.slug}`}
                className="lift group relative aspect-[3/4] rounded-sm overflow-hidden bg-burgundy"
              >
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `radial-gradient(circle at ${30 + i * 10}% ${40 + i * 5}%, rgba(255,215,0,0.4) 0%, transparent 50%)`
                }} />
                <Logo size={200} variant="mono-gold" className="absolute -bottom-8 -right-8 opacity-30" />
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="font-serif italic text-gold/70 text-xs">No. 0{i + 1}</div>
                  <div>
                    <div className="font-display uppercase text-offwhite text-2xl leading-tight tracking-wide">
                      {cat.name}
                    </div>
                    <div className="text-gold/80 text-xs mt-2 tracking-wider uppercase">
                      {cat.count} styles
                    </div>
                    <div className="mt-4 inline-flex items-center gap-2 text-gold text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                      Explore
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-20 lg:py-28 bg-pearl">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="text-[11px] tracking-[0.3em] uppercase text-gold-600 font-bold mb-3">— Best Sellers —</div>
              <h2 className="font-display uppercase text-burgundy text-5xl lg:text-7xl tracking-tight display-shadow">
                The Crown Jewels
              </h2>
            </div>
            <Button to="/shop" variant="secondary" size="md">
              View All
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {bestSellers.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY LUXURY WIG CITY */}
      <section className="py-20 lg:py-28 bg-burgundy text-offwhite relative overflow-hidden">
        <Logo size={500} variant="mono-gold" className="absolute -top-20 -right-20 opacity-[0.04]" />
        <Logo size={500} variant="mono-gold" className="absolute -bottom-20 -left-20 opacity-[0.04]" />

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Why Luxury Wig City —</div>
            <h2 className="font-display uppercase text-gold text-5xl lg:text-7xl tracking-tight display-shadow">
              Your Hair's BFF
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                title: 'Verified Quality',
                body: 'Every wig is 100% human hair, hand-tied lace, and tested by our master stylists before shipping. Bad batches don\'t reach you.',
                icon: 'shield'
              },
              {
                num: '02',
                title: 'Same-Day Abuja',
                body: 'Order before noon, wear it tonight. Lagos and PH delivered in 48 hours. Tracked, insured, and luxe-packaged.',
                icon: 'delivery'
              },
              {
                num: '03',
                title: 'Custom Coloring',
                body: 'Book a consultation with our colorist. Hand-painted highlights, custom melts, and bridal-grade color matching.',
                icon: 'palette'
              }
            ].map(item => (
              <div key={item.num} className="border border-gold/20 rounded-sm p-8 hover:border-gold transition group">
                <div className="font-serif italic text-gold/60 text-3xl mb-4">{item.num}</div>
                <h3 className="font-display uppercase text-gold text-3xl tracking-wide mb-4">{item.title}</h3>
                <p className="text-offwhite/75 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DELIVERY + APPOINTMENT */}
      <section className="py-20 lg:py-28 bg-offwhite">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gold p-10 lg:p-14 rounded-sm relative overflow-hidden">
            <Logo size={300} variant="mono-burgundy" className="absolute -bottom-10 -right-10 opacity-15" />
            <div className="relative">
              <div className="text-[11px] tracking-[0.3em] uppercase text-burgundy font-bold mb-3">— Delivery —</div>
              <h3 className="font-display uppercase text-burgundy text-4xl lg:text-5xl mb-4 display-shadow">
                Doorstep Luxury
              </h3>
              <p className="text-burgundy/80 mb-6 leading-relaxed">
                Free delivery on Abuja orders above ₦150,000. Lagos &amp; Port Harcourt within 48 hours. Each wig ships in our signature gold &amp; burgundy box.
              </p>
              <Button to="/location" variant="primary" size="md">View Coverage Map</Button>
            </div>
          </div>

          <div className="bg-burgundy text-offwhite p-10 lg:p-14 rounded-sm relative overflow-hidden">
            <Logo size={300} variant="mono-gold" className="absolute -bottom-10 -right-10 opacity-15" />
            <div className="relative">
              <div className="text-[11px] tracking-[0.3em] uppercase text-gold font-bold mb-3">— Appointment —</div>
              <h3 className="font-display uppercase text-gold text-4xl lg:text-5xl mb-4 display-shadow">
                Visit The Showroom
              </h3>
              <p className="text-offwhite/80 mb-6 leading-relaxed">
                Book a private fitting at our Abuja showroom. Try on bestsellers, consult with our stylists, and walk out with the wig of your dreams.
              </p>
              <Button to="/contact" variant="gold" size="md">Book Consultation</Button>
            </div>
          </div>
        </div>
      </section>

      {/* WHATSAPP QUICK ORDER CTA */}
      <section className="py-20 bg-pearl">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Logo size={80} variant="gold-on-burgundy" className="mx-auto mb-6" />
          <h2 className="font-display uppercase text-burgundy text-4xl lg:text-6xl tracking-tight display-shadow mb-4">
            Quick Order on WhatsApp
          </h2>
          <p className="font-serif italic text-burgundy/70 text-lg mb-8 max-w-xl mx-auto">
            Don't have time to browse? Send us your style preference, and a stylist will curate options for you within minutes.
          </p>
          <Button href="https://wa.me/2348000000000?text=Hi%20Luxury%20Wig%20City" variant="primary" size="lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4zM12 22c-1.7 0-3.4-.5-4.9-1.4L3 22l1.4-4.1C3.5 16.4 3 14.7 3 13c0-5 4-9 9-9s9 4 9 9-4 9-9 9z"/></svg>
            Chat with us now
          </Button>
        </div>
      </section>
    </div>
  )
}

export default Home
