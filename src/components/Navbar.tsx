import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { Wordmark } from './Wordmark'
import { useCart } from '../lib/queries'

const navLinks = [
  { to: '/',         label: 'Home' },
  { to: '/shop',     label: 'Shop' },
  { to: '/try-on',   label: 'Try On' },
  { to: '/location', label: 'Location' },
  { to: '/contact',  label: 'Contact' }
]

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data: cartItems = [] } = useCart()
  const cartCount = cartItems.reduce((n, i) => n + i.quantity, 0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus()
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
  }, [searchOpen])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchTerm.trim()
    if (!q) return
    navigate(`/shop?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchTerm('')
  }

  return (
    <>
      {/* Top announcement strip */}
      <div className="bg-burgundy text-offwhite text-xs tracking-[0.18em] uppercase">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="font-medium">Free Abuja delivery on orders above ₦150,000</span>
          <Link to="/shop" className="text-gold hover:underline ml-2">Shop now →</Link>
        </div>
      </div>

      {/* Main nav */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-offwhite/85 backdrop-blur-lg border-b border-burgundy/10' : 'bg-offwhite'}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 flex items-center gap-6">
          {/* Brand mark + wordmark */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <Logo size={48} variant="gold-on-burgundy" />
            <div className="hidden sm:block">
              <Wordmark size="sm" color="burgundy" />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-9 ml-auto text-sm font-medium tracking-wide">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `transition-colors hover:text-burgundy ${isActive ? 'text-burgundy font-semibold' : 'text-ink/80'}`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Action icons */}
          <div className="flex items-center gap-1 lg:ml-4">
            <button onClick={() => setSearchOpen(o => !o)} className="p-2.5 hover:bg-pearl rounded-full transition" aria-label="Search" aria-expanded={searchOpen}>
              <svg className="w-5 h-5 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <Link to="/account" className="p-2.5 hover:bg-pearl rounded-full transition" aria-label="Account">
              <svg className="w-5 h-5 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link to="/cart" className="p-2.5 hover:bg-pearl rounded-full transition relative" aria-label="Cart">
              <svg className="w-5 h-5 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-burgundy text-[10px] rounded-full flex items-center justify-center font-bold">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>

            {/* Mobile toggle */}
            <button
              className="p-2.5 lg:hidden hover:bg-pearl rounded-full"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5 text-burgundy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <path d="M18 6 6 18M6 6l12 12" />
                  : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Search overlay */}
        {searchOpen && (
          <div className="border-t border-burgundy/10 bg-offwhite">
            <form onSubmit={submitSearch} className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex items-center gap-3">
              <svg className="w-5 h-5 text-burgundy/60 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref={searchInputRef}
                type="search"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search wigs, textures, lengths…"
                className="flex-1 bg-transparent text-base text-ink placeholder-burgundy/40 outline-none"
                aria-label="Search products"
              />
              <button type="submit" className="text-xs tracking-[0.18em] uppercase font-semibold text-burgundy hover:text-burgundy-700 px-3 py-1.5">
                Search
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search" className="p-1.5 text-burgundy/60 hover:text-burgundy">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </form>
          </div>
        )}

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-burgundy/10 bg-offwhite">
            <nav className="px-6 py-4 flex flex-col gap-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-base font-medium text-ink hover:text-burgundy border-b border-burgundy/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  )
}

export default Navbar
