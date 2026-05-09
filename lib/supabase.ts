import { createClient } from '@supabase/supabase-js'
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

// Real values load from `.env.local` at runtime; fallbacks satisfy `next build` when env is absent (e.g. CI).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:54321'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'anon-placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)
