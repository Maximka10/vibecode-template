import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ORDER_ALLOWED_INSERT_KEYS } from "@/types/orders";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Reject unknown/forbidden fields before any DB operation
    const ALLOWED_BODY_KEYS = new Set([
      "templateId", "templateName", "clientName", "clientPhone", "clientTelegram",
      "clientEmail", "businessType", "selectedServices", "notes", "selectedOptions",
      "totalPrice", "primaryColor", "bgColor",
    ]);
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

    const admin = createAdminClient();

    // Step 1: resolve authenticated user from Bearer token
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

    // Step 2: insert order — if this fails, do NOT send Telegram
    const { data, error: insertError } = await admin
      .from("orders")
      .insert({
        template_id: templateId ?? templateName,
        template_name: templateName,
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
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[lead] INSERT failed:", insertError.message);
      return NextResponse.json(
        { ok: false, savedToDb: false, error: insertError.message },
        { status: 500 }
      );
    }

    const orderId = data.id;

    // Step 3: send Telegram — only runs after confirmed insert
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
          const tgErr = await tgRes.text();
          console.error("TELEGRAM SENT: failed —", tgErr);
        }
      } catch (tgErr) {
        console.error("TELEGRAM SENT: network error —", tgErr instanceof Error ? tgErr.message : tgErr);
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
