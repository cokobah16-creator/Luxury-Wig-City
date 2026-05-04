import React, { useEffect, useCallback } from 'react'

interface LightboxProps {
  images: string[]
  alt: string
  index: number
  onClose: () => void
  onIndexChange: (i: number) => void
}

export const Lightbox: React.FC<LightboxProps> = ({ images, alt, index, onClose, onIndexChange }) => {
  const next = useCallback(() => onIndexChange((index + 1) % images.length), [index, images.length, onIndexChange])
  const prev = useCallback(() => onIndexChange((index - 1 + images.length) % images.length), [index, images.length, onIndexChange])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, next, prev])

  if (!images.length) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} — image ${index + 1} of ${images.length}`}
      className="fixed inset-0 z-[100] bg-burgundy-900/95 flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-offwhite/10 hover:bg-gold hover:text-burgundy text-offwhite flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); prev() }}
            aria-label="Previous image"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-offwhite/10 hover:bg-gold hover:text-burgundy text-offwhite flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); next() }}
            aria-label="Next image"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-offwhite/10 hover:bg-gold hover:text-burgundy text-offwhite flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      <img
        src={images[index]}
        alt={alt}
        onClick={e => e.stopPropagation()}
        className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-luxe"
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-offwhite/70 text-xs tracking-[0.18em] uppercase font-semibold">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}

export default Lightbox
