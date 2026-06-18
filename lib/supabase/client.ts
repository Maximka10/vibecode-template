import { createBrowserClient } from '@supabase/ssr'
import { config } from '@/lib/config'

export function createClient() {
  if (!config.supabase.isConfigured) return null
  return createBrowserClient(config.supabase.url, config.supabase.anonKey)
}
