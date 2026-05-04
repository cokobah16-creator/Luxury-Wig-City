import React, { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  beforeSrc: string
  afterSrc: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

/** Click-and-drag (or keyboard-arrow) before/after image comparison slider. */
export const BeforeAfter: React.FC<Props> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Before',
  afterLabel  = 'After',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const draggingRef = useRef(false)

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, pct)))
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingRef.current) return
      const x = 'touches' in e ? e.touches[0]?.clientX : (e as MouseEvent).clientX
      if (typeof x === 'number') updateFromClientX(x)
    }
    const onUp = () => { draggingRef.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [updateFromClientX])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft')  setPosition(p => Math.max(0, p - 5))
    if (e.key === 'ArrowRight') setPosition(p => Math.min(100, p + 5))
    if (e.key === 'Home')       setPosition(0)
    if (e.key === 'End')        setPosition(100)
  }

  return (
    <div
      ref={containerRef}
      className={`relative aspect-[4/5] bg-burgundy rounded-sm overflow-hidden select-none touch-none ${className}`}
      onMouseDown={e => { draggingRef.current = true; updateFromClientX(e.clientX) }}
      onTouchStart={e => { draggingRef.current = true; const x = e.touches[0]?.clientX; if (typeof x === 'number') updateFromClientX(x) }}
    >
      {/* After image (full) */}
      <img src={afterSrc} alt={afterLabel} draggable={false} className="absolute inset-0 w-full h-full object-cover" />

      {/* Before image, clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
        aria-hidden="true"
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          draggable={false}
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerRef.current?.clientWidth ?? '100%', maxWidth: 'none' }}
        />
      </div>

      {/* Labels */}
      <span className="absolute top-3 left-3 px-2 py-1 bg-burgundy/80 text-gold text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm pointer-events-none">{beforeLabel}</span>
      <span className="absolute top-3 right-3 px-2 py-1 bg-gold text-burgundy text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm pointer-events-none">{afterLabel}</span>

      {/* Divider + handle */}
      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-label="Compare before and after"
        onKeyDown={onKeyDown}
        className="absolute top-0 bottom-0 w-px bg-gold/80 cursor-col-resize focus-visible:outline-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gold text-burgundy flex items-center justify-center shadow-luxe ring-4 ring-burgundy/20">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 5l-7 7 7 7M15 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default BeforeAfter
