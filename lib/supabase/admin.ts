import { createClient } from '@supabase/supabase-js'
import { config } from '@/lib/config'

export function createAdminClient() {
  if (!config.supabase.isConfigured || !config.supabase.serviceRoleKey) return null
  return createClient(config.supabase.url, config.supabase.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
