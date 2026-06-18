import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      templateId,
      templateName,
      selectedOptions,
      totalPrice,
      primaryColor,
      bgColor,
      email,
      phone,
      comment,
    } = body;

    const admin = createAdminClient();
    let savedToDb = false;
    let dbError: string | null = null;

    const { error } = await admin.from("orders").insert({
      template_id: templateId ?? templateName,
      template_name: templateName,
      selected_options: selectedOptions ?? null,
      total_price: totalPrice ?? null,
      primary_color: primaryColor ?? null,
      bg_color: bgColor ?? null,
      notes: [email && `email: ${email}`, phone && `phone: ${phone}`, comment]
        .filter(Boolean)
        .join("\n") || null,
      status: "new",
    });

    if (error) {
      dbError = error.message;
    } else {
      savedToDb = true;
    }

    // Notify via Telegram if configured
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const text = [
        `🆕 Новая заявка: ${templateName}`,
        email && `📧 ${email}`,
        phone && `📞 ${phone}`,
        comment && `💬 ${comment}`,
      ]
        .filter(Boolean)
        .join("\n");

      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
        }
      ).catch(() => null);
    }

    return NextResponse.json({ ok: true, savedToDb, dbError });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
