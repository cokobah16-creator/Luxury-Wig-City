import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { useAuth } from '../contexts/AuthContext'
import type { CartItem, Product } from './database.types'

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

      const { error: orderErr } = await supabase.from('orders').insert(inserts)
      if (orderErr) throw orderErr

      const { error: clearErr } = await supabase
        .from('cart_items').delete().eq('customer_id', user.id)
      if (clearErr) throw clearErr
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] })
      qc.invalidateQueries({ queryKey: ['my-orders'] })
      toast.success('Order placed!')
      navigate('/account?view=orders')
    },
    onError: (e: Error) => toast.error(e.message)
  })
}
