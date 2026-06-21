import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessage } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Имя и телефон обязательны" },
        { status: 400 }
      );
    }

    const telegram = typeof body.telegram === "string" ? body.telegram.trim() : null;
    const whatsapp = typeof body.whatsapp === "string" ? body.whatsapp.trim() : null;
    const company = typeof body.company === "string" ? body.company.trim() : null;
    const service = typeof body.service === "string" ? body.service.trim() : null;
    const budget = typeof body.budget === "string" ? body.budget.trim() : null;
    const comment = typeof body.comment === "string" ? body.comment.trim() : null;

    const admin = createAdminClient();

    const { data: order, error: insertError } = await admin
      .from("orders")
      .insert({
        template_name: company || "Новая заявка",
        template_id: "custom",
        status: "new",
        lead_status: "new",
        brief_json: { name, phone, telegram, whatsapp, company, service, budget, comment },
      })
      .select("id")
      .single();

    if (insertError || !order) {
      console.error("[lead-public] insert error:", insertError?.message);
      return NextResponse.json(
        { ok: false, error: "Не удалось создать заявку" },
        { status: 500 }
      );
    }

    const orderId = order.id as string;

    // Populate project_data with contact fields
    const projectPatch: Record<string, unknown> = { order_id: orderId };
    if (name) projectPatch.company_name = company || name;
    if (phone) projectPatch.phone = phone;
    if (telegram) projectPatch.telegram = telegram;
    if (whatsapp) projectPatch.whatsapp = whatsapp;

    const { error: pdError } = await admin
      .from("project_data")
      .upsert(projectPatch, { onConflict: "order_id" });
    if (pdError) {
      console.warn("[lead-public] project_data upsert failed (non-fatal):", pdError.message);
    }

    // Send admin Telegram notification (fire-and-forget)
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (chatId) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
      const lines = [
        "🔥 Новая заявка",
        "",
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Telegram: ${telegram || "—"}`,
        `Услуга: ${service || "—"}`,
        `Комментарий: ${comment || "—"}`,
        "",
        `Открыть CRM: ${siteUrl}/admin/orders/${orderId}`,
      ].join("\n");

      sendMessage(Number(chatId), lines, { parse_mode: "Markdown", disable_web_page_preview: true }).catch(
        (err) => console.error("[lead-public] telegram failed (non-fatal):", err instanceof Error ? err.message : err)
      );
    }

    const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? null;

    return NextResponse.json({ ok: true, orderId, botUsername });
  } catch (e) {
    console.error("[lead-public] unhandled error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
