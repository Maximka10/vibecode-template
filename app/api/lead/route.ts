import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  let dbError: null | string = null
  let savedToDb = false
  let orderId: string | null = null

  try {
    const body = await req.json()
    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

    if (token && config.supabase.isConfigured) {
      const admin = createAdminClient()
      if (admin) {
        const { data: { user } } = await admin.auth.getUser(token)
        if (user) {
          const { data: order, error } = await admin.from('orders').insert({
            user_id: user.id,
            template_id: body.templateId,
            template_name: body.templateName,
            selected_options: body.selectedOptions,
            total_price: body.totalPrice ?? 0,
            primary_color: body.primaryColor,
            bg_color: body.bgColor,
            status: 'new',
          }).select('id').single()
          if (!error && order) {
            savedToDb = true
            orderId = order.id
          } else {
            dbError = error?.message ?? 'DB insert failed'
          }
        }
      }
    }

    if (config.telegram.isConfigured) {
      const text = orderId
        ? `Новая заявка #${orderId.slice(0, 8)}: ${body.templateName}\nОткрой админ-панель для работы с заявкой`
        : `Новая заявка: ${body.templateName}\nАвторизация не выполнена, заявка не сохранена в БД`
      await fetch(
        `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: config.telegram.chatId, text }),
        }
      ).catch((e) => { dbError = String(e) })
    }

    return NextResponse.json({ ok: true, savedToDb, orderId, dbError })
  } catch (e) {
    return NextResponse.json(
      { ok: false, savedToDb: false, orderId: null, dbError: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    )
  }
}
