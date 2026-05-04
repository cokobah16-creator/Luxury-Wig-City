import React from 'react'

interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none'
}

/** Pulsing placeholder rectangle. Compose into bigger layouts. */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', rounded = 'sm' }) => {
  const r = rounded === 'none' ? '' : `rounded-${rounded}`
  return <div aria-hidden="true" className={`bg-burgundy/10 animate-pulse ${r} ${className}`} />
}

/** Product card skeleton — same shape as ProductCard for grid placeholders. */
export const ProductCardSkeleton: React.FC = () => (
  <div className="block">
    <Skeleton className="aspect-[3/4] w-full" />
  </div>
)

/** Cart line item skeleton. */
export const CartItemSkeleton: React.FC = () => (
  <div className="flex gap-4 p-4 bg-pearl rounded-sm">
    <Skeleton className="w-24 h-32 shrink-0" />
    <div className="flex-1 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
      <div className="flex justify-between mt-6">
        <Skeleton className="h-8 w-24" rounded="full" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  </div>
)

/** Order row skeleton for Account / order tracking. */
export const OrderRowSkeleton: React.FC = () => (
  <div className="bg-pearl p-6 rounded-sm border border-burgundy/10 space-y-3">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
    <Skeleton className="h-3 w-3/4" />
  </div>
)

export default Skeleton
