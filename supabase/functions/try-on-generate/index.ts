// =====================================================================
// Luxury Wig City — AI Try-On Edge Function
// =====================================================================
// POST /functions/v1/try-on-generate
//   { source_url: string, product_id: string }
// → { result_id: string, generated_url: string }
//
// 1. Authenticates the caller (Supabase JWT)
// 2. Rate-limits to 5 generations per user per hour
// 3. Looks up product metadata to build a structured prompt
// 4. Calls fal.ai's image-editing model (Flux Kontext) with the selfie
//    as the reference and a prompt that PRESERVES the customer's face
// 5. Stores the generated image back to the user-uploads bucket
// 6. Inserts/updates a try_on_results row with consent timestamp + 30-day expiry
//
// Required env vars (set via `supabase secrets set …`):
//   - SUPABASE_URL              (auto-provided)
//   - SUPABASE_SERVICE_ROLE_KEY (auto-provided)
//   - FAL_KEY                   (your fal.ai API key — get one at fal.ai)
// =====================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

const FAL_KEY = Deno.env.get('FAL_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const RATE_LIMIT_PER_HOUR = 5
const FAL_MODEL = 'fal-ai/flux-pro/kontext'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface ProductRow {
  id: string
  name: string
  description: string | null
  category: string
  texture: string | null
  length_inches: number | null
  density: number | null
  lace_type: string | null
  primary_color: string | null
  images: string[] | null
}

function buildPrompt(p: ProductRow): string {
  const bits: string[] = []

  // Core identity-preservation contract
  bits.push(
    'Edit the uploaded selfie by replacing only the person\'s current hair with the selected wig style.',
    'Preserve the person\'s exact face, facial features, skin tone, expression, body, clothing, and background.',
    'Do not beautify, smooth, or alter the face. Do not change the nose, eyes, lips, jawline, face shape, or complexion.',
    'Only modify the hair / wig area.'
  )

  // Wig description from structured metadata
  const adjectives: string[] = []
  if (p.length_inches) adjectives.push(`${p.length_inches}-inch`)
  if (p.texture)       adjectives.push(p.texture.toLowerCase())
  if (p.primary_color) adjectives.push(p.primary_color.toLowerCase())
  const wigDescription = adjectives.length
    ? adjectives.join(' ')
    : (p.category?.toLowerCase() ?? 'luxury')

  const laceLine    = p.lace_type ? `Use a ${p.lace_type.toLowerCase()} construction so the hairline reads as a real lace front.` : 'The hairline should look natural and lace-front quality.'
  const densityLine = p.density   ? `Apply approximately ${p.density}% density.` : ''

  bits.push(
    `Apply a realistic luxury ${wigDescription} wig (${p.name}).`,
    laceLine,
    densityLine,
    'Blend the hairline naturally with the forehead, match lighting and shadows, and make the wig look like it is actually being worn by the person.',
    'Avoid plastic, doll-like, or over-saturated results. Keep the look photographic, editorial, and premium.'
  )

  return bits.filter(Boolean).join(' ')
}

async function callFal(sourceUrl: string, prompt: string, referenceUrl: string | null): Promise<string> {
  if (!FAL_KEY) throw new Error('FAL_KEY is not configured. Set it via `supabase secrets set FAL_KEY=…`.')

  const body: Record<string, unknown> = {
    image_url: sourceUrl,
    prompt,
    guidance_scale: 3.5,
    num_inference_steps: 30,
    output_format: 'jpeg',
    safety_tolerance: '2'
  }
  if (referenceUrl) body.reference_image_url = referenceUrl

  const res = await fetch(`https://fal.run/${FAL_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`fal.ai returned ${res.status}: ${text.slice(0, 400)}`)
  }
  const data = await res.json() as { images?: Array<{ url: string }>; image?: { url: string } }
  const url = data.images?.[0]?.url ?? data.image?.url
  if (!url) throw new Error('fal.ai returned no image URL')
  return url
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST')    return new Response('Method not allowed', { status: 405, headers: cors })

  try {
    // ── Auth ─────────────────────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonError('Missing Authorization header', 401)
    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } }
    })
    const { data: userData, error: userErr } = await userClient.auth.getUser()
    if (userErr || !userData.user) return jsonError('Not authenticated', 401)
    const user = userData.user

    // ── Body ─────────────────────────────────────────────────────────────
    const { source_url, product_id } = await req.json() as { source_url?: string; product_id?: string }
    if (!source_url) return jsonError('source_url required', 400)
    if (!product_id) return jsonError('product_id required', 400)

    // ── Rate limit ───────────────────────────────────────────────────────
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recent } = await admin
      .from('try_on_results').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since)
    if ((recent ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return jsonError(`Rate limit reached: max ${RATE_LIMIT_PER_HOUR} try-ons per hour. Try again later.`, 429)
    }

    // ── Lookup product ───────────────────────────────────────────────────
    const { data: product, error: prodErr } = await admin
      .from('products').select('*').eq('id', product_id).maybeSingle<ProductRow>()
    if (prodErr || !product) return jsonError('Product not found', 404)

    // ── Insert pending row ───────────────────────────────────────────────
    const prompt = buildPrompt(product)
    const { data: pending, error: insErr } = await admin
      .from('try_on_results')
      .insert({
        user_id:      user.id,
        product_id:   product.id,
        product_name: product.name,
        source_url,
        status:       'pending',
        prompt,
        consent_given_at: new Date().toISOString()
      })
      .select('id')
      .single()
    if (insErr || !pending) return jsonError(insErr?.message ?? 'Could not create try-on record', 500)

    try {
      // ── Generate ─────────────────────────────────────────────────────────
      const referenceUrl = product.images?.[0] ?? null
      const generatedUrl = await callFal(source_url, prompt, referenceUrl)

      // ── Persist generated image to our own storage so it doesn't expire ──
      const fileBytes = new Uint8Array(await (await fetch(generatedUrl)).arrayBuffer())
      const path = `${user.id}/${pending.id}-tryon.jpg`
      const { error: upErr } = await admin.storage
        .from('user-uploads').upload(path, fileBytes, {
          contentType: 'image/jpeg',
          upsert: true
        })
      if (upErr) throw new Error(`Storage upload failed: ${upErr.message}`)
      const { data: pub } = admin.storage.from('user-uploads').getPublicUrl(path)
      const ourUrl = pub.publicUrl

      await admin.from('try_on_results').update({
        status:        'complete',
        generated_url: ourUrl
      }).eq('id', pending.id)

      return jsonOk({ result_id: pending.id, generated_url: ourUrl, prompt })
    } catch (genErr) {
      const message = (genErr as Error).message
      await admin.from('try_on_results').update({
        status: 'failed',
        error_message: message
      }).eq('id', pending.id)
      return jsonError(message, 502)
    }
  } catch (e) {
    return jsonError((e as Error).message, 500)
  }
})

function jsonOk(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })
}
