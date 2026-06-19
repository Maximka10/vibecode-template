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

    // ── Step 2: Verify service role is ACTUALLY active ────────────────────────
    // admin.auth.admin calls only work with service_role key, never anon.
    // If this fails → SUPABASE_SERVICE_ROLE_KEY is wrong/missing.
    const { error: srTestError } = await admin.auth.admin.listUsers({ perPage: 1 });
    if (srTestError) {
      console.error(
        "[lead] SERVICE_ROLE VERIFICATION FAILED — admin.auth.admin.listUsers() rejected.",
        "This means SUPABASE_SERVICE_ROLE_KEY is wrong or anon key is being used instead.",
        "Error:", srTestError.message
      );
    } else {
      console.log("[lead] service_role verified — admin.auth.admin.listUsers() succeeded");
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

    // auth.uid() equivalent — this is what Supabase RLS sees as the caller identity
    const authUid = user.id;
    console.log("[lead] auth.uid() =", authUid);
    console.log("[lead] user.email =", user.email);
    console.log("[lead] user.role  =", user.role);

    // ── Step 4: Build insert payload ──────────────────────────────────────────
    const insertPayload = {
      template_id: templateId ?? templateName,
      template_name: templateName ?? null,
      selected_options: selectedOptions ?? null,
      total_price: totalPrice ?? null,
      primary_color: primaryColor ?? null,
      bg_color: bgColor ?? null,
      notes: notes ?? null,
      status: "new" as const,
      user_id: authUid,
    };

    // ── Explicit comparison: auth.uid() must equal payload.user_id ────────────
    const uidMatch = insertPayload.user_id === authUid;
    console.log("[lead] auth.uid() === payload.user_id:", uidMatch, {
      "auth.uid()": authUid,
      "payload.user_id": insertPayload.user_id,
    });
    if (!uidMatch) {
      console.error("[lead] MISMATCH: auth.uid() does not equal payload.user_id — aborting");
      return NextResponse.json({ ok: false, error: "AUTH_UID_MISMATCH" }, { status: 500 });
    }

    // ── Full payload log (no PII beyond user_id) ──────────────────────────────
    console.log("[lead] full insert payload:", {
      user_id: insertPayload.user_id,
      template_id: insertPayload.template_id,
      template_name: insertPayload.template_name,
      status: insertPayload.status,
      total_price: insertPayload.total_price,
      has_notes: !!insertPayload.notes,
      has_selected_options: !!insertPayload.selected_options,
    });

    const userId = authUid;

    // ── Step 5: Insert via contract-validated wrapper ─────────────────────────
    const insert = await safeInsertOrder(insertPayload);

    if (!insert.ok) {
      return NextResponse.json(
        {
          ok: false,
          debug: {
            supabaseError: "rawError" in insert ? insert.rawError : null,
            payload: "payload" in insert ? insert.payload : insertPayload,
            payloadKeys: Object.keys(insertPayload),
            userId,
            insertError: insert.error,
            insertCode: insert.code,
          },
        },
        { status: 500 }
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
