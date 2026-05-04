import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { Wordmark } from './Wordmark'
import { waLink } from '../lib/constants'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-burgundy text-offwhite/85 pt-20 pb-8 mt-20 relative overflow-hidden">
      {/* Brand pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
        <div className="grid grid-cols-12 gap-8 p-8 h-full">
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <Logo size={36} variant="mono-gold" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10">
        {/* Top — big tagline */}
        <div className="text-center mb-16">
          <Wordmark size="md" color="gold" className="mx-auto" />
          <p className="font-display uppercase text-3xl sm:text-4xl text-gold mt-6 tracking-wider display-shadow">
            Your Hair's BFF
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-5">
              <Logo size={56} variant="gold-on-burgundy" />
              <Wordmark size="sm" color="gold" />
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Africa's most trusted wig marketplace. Vetted vendors. Verified hair. Confidence delivered to your door.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/luxurywigcity" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-offwhite/10 hover:bg-gold hover:text-burgundy flex items-center justify-center transition">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 5.2c2.5 0 4.6 2.1 4.6 4.6s-2.1 4.6-4.6 4.6S7.4 14.5 7.4 12 9.5 7.4 12 7.4zm0 1.8c-1.5 0-2.8 1.3-2.8 2.8s1.3 2.8 2.8 2.8 2.8-1.3 2.8-2.8-1.3-2.8-2.8-2.8zm5.8-2.2c0 .6-.5 1.1-1.1 1.1s-1.1-.5-1.1-1.1.5-1.1 1.1-1.1 1.1.5 1.1 1.1z"/></svg>
              </a>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-offwhite/10 hover:bg-gold hover:text-burgundy flex items-center justify-center transition">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4zM12 22c-1.7 0-3.4-.5-4.9-1.4L3 22l1.4-4.1C3.5 16.4 3 14.7 3 13c0-5 4-9 9-9s9 4 9 9-4 9-9 9z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-offwhite/10 hover:bg-gold hover:text-burgundy flex items-center justify-center transition">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.6 6.3c0 .2 0 .4 0 .5 0 5.5-4.2 11.8-11.8 11.8-2.3 0-4.5-.7-6.3-1.8.3 0 .6.1.9.1 1.9 0 3.7-.7 5.1-1.8-1.8 0-3.4-1.2-3.9-2.9.3 0 .5.1.8.1.4 0 .7 0 1.1-.2-1.9-.4-3.4-2.1-3.4-4.1v-.1c.5.3 1.2.5 1.9.5-1.1-.7-1.9-2-1.9-3.5 0-.8.2-1.5.6-2.1 2 2.5 5.1 4.2 8.6 4.4-.1-.3-.1-.6-.1-1 0-2.3 1.9-4.2 4.2-4.2 1.2 0 2.3.5 3.1 1.3 1-.2 1.9-.5 2.7-1-.3 1-1 1.8-1.9 2.3.9-.1 1.7-.3 2.5-.7-.6.9-1.3 1.6-2.2 2.3z"/></svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-2">
            <div className="text-[11px] tracking-[0.2em] uppercase text-gold font-bold mb-5">Shop</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop?cat=Bone+Straight" className="hover:text-gold transition">Bone Straight</Link></li>
              <li><Link to="/shop?cat=Pixie+Curl" className="hover:text-gold transition">Pixie Curl</Link></li>
              <li><Link to="/shop?cat=Frontal+Wigs" className="hover:text-gold transition">Frontal Wigs</Link></li>
              <li><Link to="/shop?cat=Closure+Wigs" className="hover:text-gold transition">Closure Wigs</Link></li>
              <li><Link to="/shop?cat=Braided+Wigs" className="hover:text-gold transition">Braided Wigs</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <div className="text-[11px] tracking-[0.2em] uppercase text-gold font-bold mb-5">Experience</div>
            <ul className="space-y-3 text-sm">
              <li><Link to="/try-on" className="hover:text-gold transition">AI Try-On</Link></li>
              <li><Link to="/location" className="hover:text-gold transition">Visit Showroom</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition">Book Consultation</Link></li>
              <li><a href={waLink()} className="hover:text-gold transition">WhatsApp Order</a></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <div className="text-[11px] tracking-[0.2em] uppercase text-gold font-bold mb-5">Help</div>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-gold transition">Wig Care Guide</a></li>
              <li><a href="#" className="hover:text-gold transition">Shipping &amp; Returns</a></li>
              <li><a href="#" className="hover:text-gold transition">FAQ</a></li>
              <li><a href="#" className="hover:text-gold transition">Size Guide</a></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <div className="text-[11px] tracking-[0.2em] uppercase text-gold font-bold mb-5">Brand</div>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-gold transition">Our Story</a></li>
              <li><a href="#" className="hover:text-gold transition">Press</a></li>
              <li><a href="#" className="hover:text-gold transition">Privacy</a></li>
              <li><a href="#" className="hover:text-gold transition">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-offwhite/10 pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-offwhite/60">
          <div>© 2026 Luxury Wig City Ltd. — Abuja · Lagos</div>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <span className="text-gold">✦</span>
            <span>in Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
