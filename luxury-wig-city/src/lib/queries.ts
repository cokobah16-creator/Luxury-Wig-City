import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type {
  Product,
  ProductCategory,
  ProductTexture,
  CartItem,
  Order,
  Review,
  WishlistItem,
  Profile
} from './database.types'

export interface ProductFilters {
  category?:    ProductCategory | null
  textures?:    ProductTexture[]
  lengthMin?:   number
  lengthMax?:   number
  priceMax?:    number
  sort?:        'featured' | 'price-asc' | 'price-desc' | 'rating'
  search?:      string
  isFeatured?:  boolean
  excludeId?:   string
  limit?:       number
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async (): Promise<Product[]> => {
      let q = supabase.from('products').select('*').eq('status', 'active')
      if (filters.category)              q = q.eq('category', filters.category)
      if (filters.textures?.length)      q = q.in('texture', filters.textures)
      if (filters.lengthMin != null)     q = q.gte('length_inches', filters.lengthMin)
      if (filters.lengthMax != null)     q = q.lte('length_inches', filters.lengthMax)
      if (filters.priceMax != null)      q = q.lte('price', filters.priceMax)
      if (filters.isFeatured)            q = q.eq('is_featured', true)
      if (filters.excludeId)             q = q.neq('id', filters.excludeId)
      if (filters.search)                q = q.textSearch('search_vector', filters.search)

      if (filters.sort === 'price-asc')       q = q.order('price',  { ascending: true })
      else if (filters.sort === 'price-desc') q = q.order('price',  { ascending: false })
      else if (filters.sort === 'rating')     q = q.order('rating', { ascending: false })
      else q = q.order('is_featured', { ascending: false }).order('created_at', { ascending: false })

      if (filters.limit) q = q.limit(filters.limit)

      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Product[]
    }
  })
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      if (!id) return null
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return (data as Product | null) ?? null
    },
    enabled: !!id
  })
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async (): Promise<Review[]> => {
      if (!productId) return []
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Review[]
    },
    enabled: !!productId
  })
}

export function useCart(userId: string | undefined) {
  return useQuery({
    queryKey: ['cart', userId],
    queryFn: async (): Promise<CartItem[]> => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as CartItem[]
    },
    enabled: !!userId
  })
}

export function useMyOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-orders', userId],
    queryFn: async (): Promise<Order[]> => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Order[]
    },
    enabled: !!userId
  })
}

export function useMyWishlist(userId: string | undefined) {
  return useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async (): Promise<WishlistItem[]> => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as WishlistItem[]
    },
    enabled: !!userId
  })
}

// ── Admin queries ───────────────────────────────────────────────────────

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return (data ?? []) as Order[]
    }
  })
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Product[]
    }
  })
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as Profile[]
    }
  })
}

export interface AdminStats {
  revenue:        number
  orderCount:     number
  activeProducts: number
  avgOrder:       number
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async (): Promise<AdminStats> => {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const since = startOfMonth.toISOString()

      const [orders, productCount] = await Promise.all([
        supabase.from('orders').select('total_amount').gte('created_at', since),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ])
      if (orders.error)       throw orders.error
      if (productCount.error) throw productCount.error

      const monthOrders = (orders.data ?? []) as Array<{ total_amount: number }>
      const revenue    = monthOrders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0)
      const orderCount = monthOrders.length
      const avgOrder   = orderCount > 0 ? revenue / orderCount : 0

      return {
        revenue,
        orderCount,
        activeProducts: productCount.count ?? 0,
        avgOrder
      }
    }
  })
}
