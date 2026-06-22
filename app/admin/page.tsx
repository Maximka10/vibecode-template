import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import AdminOrdersClient from './AdminOrdersClient'

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient()
  if (!supabase) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
        <p className="text-zinc-400">Supabase не настроен</p>
      </main>
    )
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
        <p className="text-zinc-400">Admin client недоступен</p>
      </main>
    )
  }

  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: orders } = await admin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminOrdersClient orders={orders ?? []} />
}
