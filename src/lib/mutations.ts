import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from '../contexts/AuthContext'
import type { CartItem, Product, ProductCategory } from './database.types'

// ── Cart mutations ────────────────────────────────────────────────────────────

export function useAddToCart() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      product, quantity = 1, length, cap_size, color
    }: {
      product: Product
      quantity?: number
      length?: string | null
      cap_size?: string | null
      color?: string | null
    }) => {
      if (!user) throw new Error('Sign in to add to cart')

      // Check for existing item with same variant combo
      const { data: existing } = await supabase
        .from('cart_items').select('id, quantity')
        .eq('customer_id', user.id)
        .eq('product_id', product.id)
        .is('length', length ?? null)
        .is('cap_size', cap_size ?? null)
        .is('color', color ?? null)
        .maybeSingle()

      if (existing) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('cart_items').insert({
          customer_id: user.id,
          product_id: product.id,
          quantity,
          length: length ?? null,
          cap_size: cap_size ?? null,
          color: color ?? null,
          price: product.discount_price ?? product.price,
          product_name: product.name,
          product_image: product.images?.[0] ?? null,
          vendor_id: product.vendor_id ?? null,
          vendor_name: product.vendor_name ?? null
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Added to bag')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}

export function useUpdateCartQty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      if (quantity < 1) return
      const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] })
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] })
  })
}

// ── Vendor product mutations ──────────────────────────────────────────────────

export interface VendorProductInput {
  id?: string
  name: string
  description?: string
  category: ProductCategory
  price: number
  discount_price?: number | null
  stock: number
  texture?: string | null
  length_inches?: number | null
  lace_type?: string | null
  primary_color?: string | null
  images?: string[]
  status?: 'active' | 'draft'
}

export function useUpsertVendorProduct() {
  const { vendorProfile } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: VendorProductInput) => {
      if (!vendorProfile) throw new Error('Apply as a vendor first')
      if (!input.name.trim())  throw new Error('Product name is required')
      if (input.price <= 0)    throw new Error('Price must be greater than zero')
      if (input.stock < 0)     throw new Error('Stock cannot be negative')

      const row = {
        vendor_id:      vendorProfile.id,
        vendor_name:    vendorProfile.store_name,
        name:           input.name.trim(),
        description:    input.description?.trim() || null,
        category:       input.category,
        price:          input.price,
        discount_price: input.discount_price ?? null,
        stock:          input.stock,
        texture:        input.texture ?? null,
        length_inches:  input.length_inches ?? null,
        lace_type:      input.lace_type ?? null,
        primary_color:  input.primary_color ?? null,
        images:         input.images ?? [],
        status:         input.status ?? 'active'
      }

      if (input.id) {
        const { error } = await supabase.from('products').update(row).eq('id', input.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(row)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product saved')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}

export function useDeleteVendorProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor', 'products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product removed')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}

// ── Vendor application ────────────────────────────────────────────────────────

export type VendorCategory = ProductCategory | 'Mixed'

export interface VendorApplication {
  store_name: string
  store_category: VendorCategory | ''
  store_tagline?: string
  description?: string
  business_email?: string
  business_address?: string
  phone?: string
  instagram?: string
}

export function useApplyAsVendor() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: VendorApplication) => {
      if (!user) throw new Error('Sign in to apply')
      if (!input.store_name.trim()) throw new Error('Store name is required')
      if (!input.store_category)    throw new Error('Pick a category')

      const { error } = await supabase.from('vendor_profiles').insert({
        user_id:          user.id,
        store_name:       input.store_name.trim(),
        store_category:   input.store_category as VendorCategory,
        store_tagline:    input.store_tagline?.trim() || null,
        description:      input.description?.trim() || null,
        business_email:   input.business_email?.trim() || null,
        business_address: input.business_address?.trim() || null,
        phone:            input.phone?.trim() || null,
        instagram:        input.instagram?.trim() || null,
        status:           'pending'
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast.success('Application submitted — we\'ll be in touch within 48 hours.')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}

// ── Try-On ────────────────────────────────────────────────────────────────────

export function useGenerateTryOn() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ file, productId }: { file: File; productId: string }) => {
      if (!user) throw new Error('Sign in to use try-on')
      if (file.size > 8 * 1024 * 1024) throw new Error('Photo must be under 8 MB')
      if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')

      // 1. Upload selfie to user-uploads bucket
      const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
      const objectName = `${user.id}/${crypto.randomUUID()}-source.${ext}`
      const { error: upErr } = await supabase.storage
        .from('user-uploads').upload(objectName, file, {
          contentType: file.type,
          upsert: false
        })
      if (upErr) throw new Error(upErr.message)
      const { data: pub } = supabase.storage.from('user-uploads').getPublicUrl(objectName)
      const sourceUrl = pub.publicUrl

      // 2. Invoke edge function — 130 s client timeout (function itself aborts at 120 s)
      const invokeController = new AbortController()
      const invokeTimer = setTimeout(() => invokeController.abort(), 130_000)
      let data: { result_id: string; generated_url: string } | null = null
      let invokeError: Error | null = null
      try {
        const result = await supabase.functions.invoke<{ result_id: string; generated_url: string }>(
          'try-on-generate',
          { body: { source_url: sourceUrl, product_id: productId } }
        )
        if (result.error) invokeError = new Error(result.error.message)
        else data = result.data
      } catch (e) {
        invokeError = e instanceof Error ? e : new Error('Try-on request failed')
      } finally {
        clearTimeout(invokeTimer)
      }
      if (invokeController.signal.aborted) throw new Error('The AI is taking too long — please try again in a moment.')
      if (invokeError) throw invokeError
      if (!data) throw new Error('No response from try-on service')
      return { ...data, source_url: sourceUrl }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['try-ons'] })
    },
    onError: (e: Error) => toast.error(e.message)
  })
}

export function useDeleteTryOn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('try_on_results').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['try-ons'] })
      toast.success('Look deleted')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export function useSubscribeNewsletter() {
  return useMutation({
    mutationFn: async ({ email, source = 'footer' }: { email: string; source?: string }) => {
      const trimmed = email.trim().toLowerCase()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) throw new Error('Enter a valid email')
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: trimmed, source })
      if (error && !error.message.toLowerCase().includes('duplicate')) throw error
    },
    onSuccess: () => toast.success("You're on the list — welcome."),
    onError: (e: Error) => toast.error(e.message)
  })
}

// ── Review mutations ──────────────────────────────────────────────────────────

export function useAddReview() {
  const { user, profile } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }) => {
      if (!user) throw new Error('Sign in to leave a review')
      if (rating < 1 || rating > 5) throw new Error('Rating must be 1–5')
      const { error } = await supabase.from('reviews').insert({
        product_id:    productId,
        customer_id:   user.id,
        customer_name: profile?.full_name ?? null,
        rating,
        comment: comment.trim() || null
      })
      if (error) throw error
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['reviews', vars.productId] })
      qc.invalidateQueries({ queryKey: ['my-review', user?.id, vars.productId] })
      qc.invalidateQueries({ queryKey: ['product', vars.productId] })
      toast.success('Review posted — thank you!')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}

// ── Order mutations ───────────────────────────────────────────────────────────

export interface ShippingDetails {
  name: string
  phone: string
  email: string
  address: string
  city: string
  state?: string
}

export function useCreateOrder() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      cartItems,
      shipping
    }: {
      cartItems: CartItem[]
      shipping: ShippingDetails
    }) => {
      if (!user) throw new Error('Not signed in')
      if (!cartItems.length) throw new Error('Cart is empty')

      // Group by vendor_id (null vendor → platform order)
      const groups: Record<string, CartItem[]> = {}
      for (const item of cartItems) {
        const key = item.vendor_id ?? '__platform__'
        if (!groups[key]) groups[key] = []
        groups[key].push(item)
      }

      const inserts = Object.entries(groups).map(([vendorKey, items]) => ({
        customer_id: user.id,
        customer_name: shipping.name,
        customer_email: shipping.email,
        vendor_id: vendorKey === '__platform__' ? null : vendorKey,
        vendor_name: items[0].vendor_name ?? null,
        items: items.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          price: i.price,
          quantity: i.quantity,
          length: i.length,
          cap_size: i.cap_size,
          color: i.color,
          image_url: i.product_image
        })),
        total_amount: items.reduce((s, i) => s + Number(i.price) * i.quantity, 0),
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_state: shipping.state ?? null,
        phone: shipping.phone,
        is_platform_order: vendorKey === '__platform__'
      }))

      const { data: created, error: orderErr } = await supabase
        .from('orders').insert(inserts).select('id')
      if (orderErr) throw orderErr

      const { error: clearErr } = await supabase
        .from('cart_items').delete().eq('customer_id', user.id)
      if (clearErr) throw clearErr

      return (created ?? []).map(o => o.id) as string[]
    },
    onSuccess: (orderIds) => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Order placed!')
      const firstId = orderIds[0]
      navigate(firstId ? `/orders/${firstId}` : '/account?view=orders')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}
