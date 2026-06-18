import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export async function createServerSupabaseClient() {
  if (!config.supabase.isConfigured) return null
  const cookieStore = await cookies()
  return createServerClient(config.supabase.url, config.supabase.anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    },
  })
}
