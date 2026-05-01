import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { CartItem, OrderLineItem, Product } from './database.types'

interface AddToCartArgs {
  product:   Product
  quantity?: number
  length?:   string | null
  cap_size?: string | null
  color?:    string | null
}

export function useAddToCart(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      product, quantity = 1, length = null, cap_size = null, color = null
    }: AddToCartArgs) => {
      if (!userId) throw new Error('Sign in to add items to your cart.')
      const row = {
        customer_id:   userId,
        product_id:    product.id,
        quantity,
        length,
        cap_size,
        color,
        price:         product.discount_price ?? product.price,
        product_name:  product.name,
        product_image: product.images?.[0] ?? null,
        vendor_id:     product.vendor_id,
        vendor_name:   product.vendor_name
      }
      const { error } = await supabase
        .from('cart_items')
        .upsert(row, { onConflict: 'customer_id,product_id,length,cap_size,color' })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart', userId] })
  })
}

export function useUpdateCartQty(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart', userId] })
  })
}

export function useRemoveCartItem(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cart', userId] })
  })
}

export interface ShippingDetails {
  name:    string
  email:   string
  phone:   string
  address: string
  city:    string
  notes?:  string
}

interface CreateOrderArgs {
  cart:     CartItem[]
  shipping: ShippingDetails
}

/**
 * Splits a cart by vendor — schema enforces one order per vendor — and
 * inserts N orders rows. On success, clears the customer's cart and returns
 * the new order IDs.
 */
export function useCreateOrder(userId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ cart, shipping }: CreateOrderArgs): Promise<string[]> => {
      if (!userId) throw new Error('Sign in to place an order.')
      if (cart.length === 0) throw new Error('Your cart is empty.')

      const groups = new Map<string | null, CartItem[]>()
      for (const item of cart) {
        const key = item.vendor_id ?? null
        const list = groups.get(key) ?? []
        list.push(item)
        groups.set(key, list)
      }

      const orders = Array.from(groups.entries()).map(([vendor_id, items]) => {
        const total = items.reduce((s, it) => s + Number(it.price) * it.quantity, 0)
        const lineItems: OrderLineItem[] = items.map(it => ({
          product_id:   it.product_id,
          product_name: it.product_name ?? '',
          price:        Number(it.price),
          quantity:     it.quantity,
          length:       it.length    ?? undefined,
          cap_size:     it.cap_size  ?? undefined,
          color:        it.color     ?? undefined,
          image_url:    it.product_image ?? undefined
        }))
        return {
          customer_id:      userId,
          customer_name:    shipping.name,
          customer_email:   shipping.email,
          vendor_id,
          vendor_name:      items[0]?.vendor_name ?? null,
          items:            lineItems,
          total_amount:     total,
          shipping_address: shipping.address,
          shipping_city:    shipping.city,
          phone:            shipping.phone,
          status:           'pending',
          payment_status:   'pending'
        }
      })

      const { data, error } = await supabase.from('orders').insert(orders).select('id')
      if (error) throw error

      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', userId)
      if (clearError) throw clearError

      return ((data ?? []) as Array<{ id: string }>).map(o => o.id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart',      userId] })
      qc.invalidateQueries({ queryKey: ['my-orders', userId] })
    }
  })
}
