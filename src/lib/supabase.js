import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!URL || URL === 'VENDOS_URL_KETU') {
  console.error('⚠️ Vendos VITE_SUPABASE_URL në skedarin .env')
}

export const supabase = createClient(URL, KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
})
