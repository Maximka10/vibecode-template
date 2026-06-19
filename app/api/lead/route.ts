import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeInsertOrder } from "@/lib/supabase/safeInsert";

// Allowed camelCase keys from the frontend (mapped to snake_case before DB write)
const ALLOWED_BODY_KEYS = new Set([
  "templateId", "templateName", "clientName", "clientPhone", "clientTelegram",
  "clientEmail", "businessType", "selectedServices", "notes", "selectedOptions",
  "totalPrice", "primaryColor", "bgColor",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Reject unknown/forbidden camelCase keys before any processing
    const unknown = Object.keys(body).filter((k) => !ALLOWED_BODY_KEYS.has(k));
    if (unknown.length > 0) {
      return NextResponse.json(
        { ok: false, error: `Unknown fields: ${unknown.join(", ")}` },
        { status: 400 }
      );
    }

    const {
      templateId,
      templateName,
      clientName,
      clientPhone,
      clientTelegram,
      clientEmail,
      businessType,
      selectedServices,
      notes,
      selectedOptions,
      totalPrice,
      primaryColor,
      bgColor,
    } = body;

    // Step 1: resolve authenticated user from Bearer token
    const admin = createAdminClient();
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();
    if (token) {
      const { data: { user }, error: userError } = await admin.auth.getUser(token);
      if (userError) {
        console.warn("[lead] auth.getUser error:", userError.message);
      } else {
        userId = user?.id ?? null;
      }
    }

    // Step 2: validated insert via contract layer
    const insert = await safeInsertOrder({
      template_id: templateId ?? templateName,
      template_name: templateName ?? null,
      client_name: clientName ?? null,
      client_phone: clientPhone ?? null,
      client_telegram: clientTelegram ?? null,
      client_email: clientEmail ?? null,
      business_type: businessType ?? null,
      selected_services: selectedServices ?? null,
      notes: notes ?? null,
      selected_options: selectedOptions ?? null,
      primary_color: primaryColor ?? null,
      bg_color: bgColor ?? null,
      total_price: totalPrice ?? null,
      status: "new",
      user_id: userId,
    });

    if (!insert.ok) {
      return NextResponse.json(
        { ok: false, savedToDb: false, error: insert.error },
        { status: insert.fields ? 400 : 500 }
      );
    }

    const orderId = insert.id;

    // Step 3: Telegram — only fires after confirmed insert, never blocks response
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_SITE_URL } = process.env;
    let telegramSent = false;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const siteUrl = NEXT_PUBLIC_SITE_URL ?? "https://vibecode-studio-pink.vercel.app";
      const projectLink = `${siteUrl}/admin/orders/${orderId}`;

      const lines = [
        `🆕 *Новая заявка* #${orderId.slice(0, 8)}`,
        ``,
        `👤 ${clientName ?? "—"}`,
        clientPhone ? `📞 ${clientPhone}` : null,
        clientTelegram ? `✈️ @${clientTelegram.replace("@", "")}` : null,
        clientEmail ? `📧 ${clientEmail}` : null,
        ``,
        `📐 Шаблон: *${templateName ?? "—"}*`,
        businessType ? `🏪 ${businessType}` : null,
        totalPrice ? `💰 ${Number(totalPrice).toLocaleString("ru-RU")} ₽` : null,
        ``,
        `🔗 [Открыть заказ в системе](${projectLink})`,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const tgRes = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: lines,
              parse_mode: "Markdown",
              disable_web_page_preview: true,
            }),
          }
        );
        if (tgRes.ok) {
          telegramSent = true;
        } else {
          console.error("[lead] Telegram failed:", await tgRes.text());
        }
      } catch (tgErr) {
        console.error("[lead] Telegram network error:", tgErr instanceof Error ? tgErr.message : tgErr);
      }
    } else {
      console.warn("[lead] Telegram not configured — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing");
    }

    return NextResponse.json({ ok: true, savedToDb: true, orderId, telegramSent });
  } catch (e) {
    console.error("[lead] unhandled error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
