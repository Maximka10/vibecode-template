import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      templateId,
      templateName,
      clientName,
      clientPhone,
      clientTelegram,
      clientEmail,
      businessType,
      selectedServices,
      budget,
      notes,
      selectedOptions,
      totalPrice,
      primaryColor,
      bgColor,
    } = body;

    const admin = createAdminClient();
    let orderId: string | null = null;
    let savedToDb = false;
    let dbError: string | null = null;

    const { data, error } = await admin
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
        budget: budget ?? null,
        notes: notes ?? null,
        selected_options: selectedOptions ?? null,
        primary_color: primaryColor ?? null,
        bg_color: bgColor ?? null,
        total_price: totalPrice ?? null,
        status: "new",
      })
      .select("id")
      .single();

    if (error) {
      dbError = error.message;
    } else {
      savedToDb = true;
      orderId = data.id;
    }

    // Telegram notification
    const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, NEXT_PUBLIC_SITE_URL } = process.env;
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const siteUrl = NEXT_PUBLIC_SITE_URL ?? "https://vibecode-studio-pink.vercel.app";
      const projectLink = orderId ? `${siteUrl}/admin?order=${orderId}` : siteUrl;

      const servicesList = Array.isArray(selectedServices)
        ? selectedServices.join(", ")
        : selectedServices ?? "—";

      const lines = [
        `🆕 *Новая заявка* #${orderId?.slice(0, 8) ?? "—"}`,
        ``,
        `👤 *Клиент:* ${clientName ?? "—"}`,
        `📞 *Телефон:* ${clientPhone ?? "—"}`,
        `✈️ *Telegram:* ${clientTelegram ? `@${clientTelegram.replace("@", "")}` : "—"}`,
        `📧 *Email:* ${clientEmail ?? "—"}`,
        ``,
        `🏪 *Бизнес:* ${businessType ?? "—"}`,
        `📐 *Шаблон:* ${templateName ?? "—"}`,
        `🛠 *Услуги:* ${servicesList}`,
        `💰 *Бюджет:* ${budget ? `${Number(budget).toLocaleString("ru-RU")} ₽` : "—"}`,
        notes ? `💬 *Комментарий:* ${notes}` : null,
        ``,
        `🔗 [Открыть заказ](${projectLink})`,
      ]
        .filter((l) => l !== null)
        .join("\n");

      await fetch(
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
      ).catch(() => null);
    }

    return NextResponse.json({ ok: true, savedToDb, dbError, orderId });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
