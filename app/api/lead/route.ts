import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

    // =========================
    // 1. CREATE SUPABASE USER CONTEXT
    // =========================
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // =========================
    // 2. INSERT ORDER
    // =========================
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id, // 🔥 FIX: critical ownership fix

        template_id: templateId ?? templateName,
        template_name: templateName,

        client_name: clientName ?? null,
        client_phone: clientPhone ?? null,
        client_telegram: clientTelegram ?? null,
        client_email: clientEmail ?? null,

        business_type: businessType ?? null,
        selected_services: selectedServices ?? null,
        selected_options: selectedOptions ?? null,

        budget: budget ?? null,
        notes: notes ?? null,

        primary_color: primaryColor ?? null,
        bg_color: bgColor ?? null,

        total_price: totalPrice ?? null,
        status: "new",
        user_id: userId,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    const orderId = data.id;

    // =========================
    // 3. TELEGRAM NOTIFICATION (UNCHANGED LOGIC)
    // =========================
    const {
      TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID,
      NEXT_PUBLIC_SITE_URL,
    } = process.env;

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      const siteUrl =
        NEXT_PUBLIC_SITE_URL ??
        "https://vibecode-studio-pink.vercel.app";

      const projectLink = `${siteUrl}/admin/orders/${orderId}`;

      const servicesList = Array.isArray(selectedServices)
        ? selectedServices.join(", ")
        : selectedServices ?? "—";

      const message = [
        `🆕 *Новая заявка* #${orderId.slice(0, 8)}`,
        ``,
        `👤 *Клиент:* ${clientName ?? "—"}`,
        `📞 *Телефон:* ${clientPhone ?? "—"}`,
        `✈️ *Telegram:* ${
          clientTelegram ? `@${clientTelegram.replace("@", "")}` : "—"
        }`,
        `📧 *Email:* ${clientEmail ?? "—"}`,
        ``,
        `🏪 *Бизнес:* ${businessType ?? "—"}`,
        `📐 *Шаблон:* ${templateName ?? "—"}`,
        `🛠 *Услуги:* ${servicesList}`,
        `💰 *Бюджет:* ${
          budget ? `${Number(budget).toLocaleString("ru-RU")} ₽` : "—"
        }`,
        notes ? `💬 *Комментарий:* ${notes}` : null,
        ``,
        `🔗 [Открыть заказ в системе](${projectLink})`,
      ]
        .filter(Boolean)
        .join("\n");

      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
            disable_web_page_preview: true,
          }),
        }
      ).catch(() => null);
    }

    // =========================
    // 4. RESPONSE
    // =========================
    return NextResponse.json({
      ok: true,
      orderId,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
