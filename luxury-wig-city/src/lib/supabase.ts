import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url    = import.meta.env.VITE_SUPABASE_URL
const anon   = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  // Soft warn in dev so the app still loads with mock data
  // eslint-disable-next-line no-console
  console.warn('[supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not set — auth and data fetching will fail.')
}

export const supabase = createClient<Database>(
  url ?? 'http://localhost:54321',
  anon ?? 'public-anon-key',
  {
    auth: {
      persistSession:    true,
      autoRefreshToken:  true,
      detectSessionInUrl: true
    }
  }
)

/** Naira currency formatter — used throughout the app. */
export const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0
  }).format(n || 0)

/** Build a canonical conversation_id from two user IDs. */
export const conversationId = (a: string, b: string) =>
  [a, b].sort().join('_')
