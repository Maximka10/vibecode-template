import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeInsertOrder } from "@/lib/supabase/safeInsert";

// Allowed camelCase body keys — maps to DB schema fields only
const ALLOWED_BODY_KEYS = new Set([
  "templateId",
  "templateName",
  "selectedOptions",
  "totalPrice",
  "primaryColor",
  "bgColor",
  "notes",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[lead] payload keys:", Object.keys(body));

    // Hard reject any field not in allowed set
    const unknown = Object.keys(body).filter((k) => !ALLOWED_BODY_KEYS.has(k));
    if (unknown.length > 0) {
      console.error("[lead] FIELD_NOT_IN_DB_SCHEMA:", unknown.join(", "));
      return NextResponse.json(
        { ok: false, error: `FIELD_NOT_IN_DB_SCHEMA: ${unknown.join(", ")}` },
        { status: 400 }
      );
    }

    const { templateId, templateName, selectedOptions, totalPrice, primaryColor, bgColor, notes } = body;

    // Step 1: resolve user from Bearer token
    const admin = createAdminClient();
    let userId: string | null = null;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
    if (token) {
      const { data: { user }, error: userError } = await admin.auth.getUser(token);
      if (userError) {
        console.warn("[lead] auth.getUser error:", userError.message);
      } else {
        userId = user?.id ?? null;
      }
    }
    console.log("[lead] resolved userId:", userId ?? "anonymous");

    // Step 2: insert via contract-validated wrapper
    const insert = await safeInsertOrder({
      template_id: templateId ?? templateName,
      template_name: templateName ?? null,
      selected_options: selectedOptions ?? null,
      total_price: totalPrice ?? null,
      primary_color: primaryColor ?? null,
      bg_color: bgColor ?? null,
      notes: notes ?? null,
      status: "new",
      user_id: userId,
    });

    if (!insert.ok) {
      console.error("[lead] insert failed:", insert.error);
      return NextResponse.json(
        { ok: false, savedToDb: false, error: insert.error },
        { status: insert.code === "FORBIDDEN" ? 400 : 500 }
      );
    }

    const orderId = insert.id;
    console.log("[lead] order created:", orderId);

    // Step 3: Telegram — non-blocking, only fires after confirmed insert
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_SITE_URL } = process.env;
    let telegramSent = false;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const siteUrl = NEXT_PUBLIC_SITE_URL ?? "https://vibecode-studio-pink.vercel.app";
      const lines = [
        `🆕 *Новая заявка* #${orderId.slice(0, 8)}`,
        `📐 Шаблон: *${templateName ?? "—"}*`,
        totalPrice ? `💰 ${Number(totalPrice).toLocaleString("ru-RU")} ₽` : null,
        notes ? `📝 ${notes}` : null,
        ``,
        `🔗 [Открыть заказ](${siteUrl}/admin/orders/${orderId})`,
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
          console.log("[lead] Telegram sent for order:", orderId);
        } else {
          console.error("[lead] Telegram failed:", await tgRes.text());
        }
      } catch (tgErr) {
        console.error("[lead] Telegram network error:", tgErr instanceof Error ? tgErr.message : tgErr);
      }
    } else {
      console.warn("[lead] Telegram not configured");
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
