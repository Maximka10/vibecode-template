import "@/lib/startup/validateEnv";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMessage } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    console.log("[lead-public] incoming payload:", JSON.stringify(body));

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

    const ordersPayload = {
      template_name: company || "Новая заявка",
      template_id: "custom",
      status: "new",
      lead_status: "new",
      brief_json: { name, phone, telegram, whatsapp, company, service, budget, comment },
    };
    console.log("[lead-public] before orders insert, payload:", JSON.stringify(ordersPayload));

    const { data: order, error: insertError } = await admin
      .from("orders")
      .insert(ordersPayload)
      .select("id")
      .single();

    console.log("[lead-public] after orders insert — data:", JSON.stringify(order), "error:", JSON.stringify(insertError));

    if (insertError || !order) {
      console.error("[lead-public] insert error:", insertError?.message, insertError?.code, insertError?.details, insertError?.hint);
      return NextResponse.json(
        { ok: false, error: insertError?.message ?? "Не удалось создать заявку", code: insertError?.code, details: insertError?.details },
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

    console.log("[lead-public] before project_data upsert, payload:", JSON.stringify(projectPatch));

    const { error: pdError } = await admin
      .from("project_data")
      .upsert(projectPatch, { onConflict: "order_id" });

    console.log("[lead-public] after project_data upsert — error:", JSON.stringify(pdError));

    if (pdError) {
      console.warn("[lead-public] project_data upsert failed (non-fatal):", pdError.message);
    }

    // Send admin Telegram notification (fire-and-forget)
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) {
      console.warn("[lead-public] TELEGRAM_CHAT_ID missing — admin notification skipped");
    }
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
  } catch (error) {
    console.error("[lead-public]", error);
    return NextResponse.json(
      { ok: false, error: String(error), stack: error instanceof Error ? error.stack : null },
      { status: 500 }
    );
  }
}
