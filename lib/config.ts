export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    get isConfigured() {
      return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    },
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN ?? '',
    chatId: process.env.TELEGRAM_CHAT_ID ?? '',
    username: process.env.NEXT_PUBLIC_TELEGRAM_USERNAME ?? '',
    get isConfigured() {
      return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID)
    },
  },
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    adminEmail: process.env.ADMIN_EMAIL ?? '',
  },
} as const
