/**
 * App-wide constants. Update these in one place rather than searching the codebase.
 */

// WhatsApp business number (international format, no +). Used in tel: and wa.me links.
export const WHATSAPP_NUMBER = '2348000000000'

export const waLink = (message?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`

// Delivery
export const FREE_DELIVERY_THRESHOLD_NGN = 150_000
export const DELIVERY_FEE_NGN = 5_000

export const calcDelivery = (subtotal: number) =>
  subtotal > FREE_DELIVERY_THRESHOLD_NGN ? 0 : DELIVERY_FEE_NGN

// Validation
export const NIGERIAN_PHONE_REGEX = /^(\+234|0)[789][01]\d{8}$/
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
