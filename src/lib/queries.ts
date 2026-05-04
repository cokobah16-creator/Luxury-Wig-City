import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Product, CartItem, Order, Review, WishlistItem, UserWig, Announcement, TryOnResult } from './database.types'

// ── Products ─────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string
  textures?: string[]
  minLength?: number
  maxLength?: number
  priceMax?: number
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating'
  isFeatured?: boolean
  excludeId?: string
  limit?: number
  search?: string
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let q = supabase.from('products').select('*').eq('status', 'active')

      if (filters.category)         q = q.eq('category', filters.category)
      if (filters.textures?.length) q = q.in('texture', filters.textures)
      if (filters.minLength != null) q = q.gte('length_inches', filters.minLength)
      if (filters.maxLength != null) q = q.lte('length_inches', filters.maxLength)
      if (filters.priceMax != null) q = q.lte('price', filters.priceMax)
      if (filters.isFeatured)       q = q.eq('is_featured', true)
      if (filters.excludeId)        q = q.neq('id', filters.excludeId)
      if (filters.search?.trim())   q = q.textSearch('search_vector', filters.search.trim(), { type: 'websearch' })
      if (filters.limit)            q = q.limit(filters.limit)

      if (filters.sort === 'price-asc')  q = q.order('price', { ascending: true })
      else if (filters.sort === 'price-desc') q = q.order('price', { ascending: false })
      else if (filters.sort === 'rating')     q = q.order('rating', { ascending: false })
      else q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false })

      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Product[]
    }
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('products').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data as Product | null
    },
    enabled: !!id
  })
}

export function useCanReview(productId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['can-review', user?.id, productId],
    queryFn: async () => {
      if (!user || !productId) return false
      const { count, error } = await supabase
        .from('orders').select('id', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .eq('payment_status', 'paid')
        .contains('items', [{ product_id: productId }])
      if (error) throw error
      return (count ?? 0) > 0
    },
    enabled: !!user && !!productId
  })
}

export function useMyReview(productId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-review', user?.id, productId],
    queryFn: async () => {
      if (!user || !productId) return null
      const { data, error } = await supabase
        .from('reviews').select('*')
        .eq('customer_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()
      if (error) throw error
      return data as Review | null
    },
    enabled: !!user && !!productId
  })
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return []
      const { data, error } = await supabase
        .from('reviews').select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Review[]
    },
    enabled: !!productId
  })
}

// ── Announcements ─────────────────────────────────────────────────────────────

export function useActiveAnnouncements() {
  return useQuery({
    queryKey: ['announcements', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements').select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      if (error) throw error
      return (data ?? []) as Announcement[]
    },
    staleTime: 5 * 60 * 1000
  })
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export function useCart() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('cart_items').select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as CartItem[]
    },
    enabled: !!user
  })
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useOrder(id: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase
        .from('orders').select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return data as Order | null
    },
    enabled: !!id && !!user
  })
}

export function useMyOrders() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('orders').select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Order[]
    },
    enabled: !!user
  })
}

export function useVendorOrders() {
  const { vendorProfile } = useAuth()
  return useQuery({
    queryKey: ['vendor', 'orders', vendorProfile?.id],
    queryFn: async () => {
      if (!vendorProfile) return []
      const { data, error } = await supabase
        .from('orders').select('*')
        .eq('vendor_id', vendorProfile.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Order[]
    },
    enabled: !!vendorProfile
  })
}

export function useVendorProducts() {
  const { vendorProfile } = useAuth()
  return useQuery({
    queryKey: ['vendor', 'products', vendorProfile?.id],
    queryFn: async () => {
      if (!vendorProfile) return []
      const { data, error } = await supabase
        .from('products').select('*')
        .eq('vendor_id', vendorProfile.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Product[]
    },
    enabled: !!vendorProfile
  })
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders').select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data ?? []) as Order[]
    }
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from('orders').select('total_amount, payment_status'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer')
      ])
      const orders = ordersRes.data ?? []
      const paid = orders.filter(o => o.payment_status === 'paid')
      const revenue = paid.reduce((s, o) => s + Number(o.total_amount ?? 0), 0)
      return {
        revenue,
        orderCount: orders.length,
        productCount: productsRes.count ?? 0,
        customerCount: customersRes.count ?? 0,
        avgOrder: paid.length ? Math.round(revenue / paid.length) : 0
      }
    }
  })
}

// ── Wishlist & Wardrobe ───────────────────────────────────────────────────────

export function useWishlist() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('wishlist_items').select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as WishlistItem[]
    },
    enabled: !!user
  })
}

export function useMyTryOns() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['try-ons', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('try_on_results').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as TryOnResult[]
    },
    enabled: !!user
  })
}

export function useUserWigs() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['user-wigs', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('user_wigs').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as UserWig[]
    },
    enabled: !!user
  })
}
