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

    // ── Step 1: Resolve user from Bearer token — REQUIRED ─────────────────────
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim() ?? null;

    console.log("[lead] auth header exists:", !!authHeader);
    console.log("[lead] token exists:", !!token);

    if (!token) {
      console.warn("[lead] no Bearer token — rejecting anonymous order");
      return NextResponse.json(
        { ok: false, error: "AUTH_USER_NOT_RESOLVED" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    // ── Step 2: Verify admin client can bypass RLS ────────────────────────────
    const { error: rslTestError } = await admin.from("orders").select("id").limit(1);
    if (rslTestError) {
      console.error("[lead] admin RLS bypass test FAILED — SUPABASE_SERVICE_ROLE_KEY may be wrong:", rslTestError.message);
    } else {
      console.log("[lead] admin RLS bypass test passed — service role active");
    }

    // ── Step 3: Validate token and resolve userId ─────────────────────────────
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) {
      console.warn("[lead] auth.getUser failed:", userError?.message ?? "no user returned");
      return NextResponse.json(
        { ok: false, error: "AUTH_USER_NOT_RESOLVED" },
        { status: 401 }
      );
    }

    const userId = user.id;
    console.log("[lead] resolved userId:", userId);

    // ── Step 4: Build and log insert payload ──────────────────────────────────
    const insertPayload = {
      template_id: templateId ?? templateName,
      template_name: templateName ?? null,
      selected_options: selectedOptions ?? null,
      total_price: totalPrice ?? null,
      primary_color: primaryColor ?? null,
      bg_color: bgColor ?? null,
      notes: notes ?? null,
      status: "new" as const,
      user_id: userId,
    };

    console.log("[lead] insert payload:", {
      user_id: insertPayload.user_id,
      template_id: insertPayload.template_id,
      status: insertPayload.status,
    });

    // ── Step 5: Insert via contract-validated wrapper ─────────────────────────
    const insert = await safeInsertOrder(insertPayload);

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
