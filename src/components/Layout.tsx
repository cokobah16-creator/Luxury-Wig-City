import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'
import { waLink } from '../lib/constants'

export const Layout: React.FC = () => {
  const location = useLocation()
  return (
  <div className="min-h-screen flex flex-col">
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:bg-burgundy focus:text-gold focus:px-4 focus:py-2 focus:rounded-sm focus:text-sm focus:font-semibold"
    >
      Skip to content
    </a>
    <Navbar />
    <main id="main-content" className="flex-1">
      <ErrorBoundary key={location.pathname}>
        <Outlet />
      </ErrorBoundary>
    </main>
    <Footer />

    {/* WhatsApp floating CTA */}
    <a
      href={waLink('Hi Luxury Wig City')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-burgundy hover:bg-burgundy-700 rounded-full shadow-luxe flex items-center justify-center transition group"
      aria-label="WhatsApp"
    >
      <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4zM12 22c-1.7 0-3.4-.5-4.9-1.4L3 22l1.4-4.1C3.5 16.4 3 14.7 3 13c0-5 4-9 9-9s9 4 9 9-4 9-9 9z"/>
      </svg>
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full ring-2 ring-offwhite animate-pulse" />
    </a>
  </div>
  )
}

export default Layout
