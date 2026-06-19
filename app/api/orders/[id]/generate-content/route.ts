import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserWithRole } from "@/lib/auth/getUserWithRole";
import Anthropic from "@anthropic-ai/sdk";

export async function GET() {
  return NextResponse.json({ available: !!process.env.ANTHROPIC_API_KEY });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await getUserWithRole();
  if (!auth) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  if (auth.role !== "admin") return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  if (process.env.AI_ENABLED === 'false') {
    return NextResponse.json({ ok: false, error: "AI временно недоступен. Обратитесь к администратору." }, { status: 503 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "AI_NOT_CONFIGURED" }, { status: 503 });

  const admin = createAdminClient();
  const [orderRes, pdRes] = await Promise.all([
    admin.from("orders").select("template_name, notes").eq("id", id).single(),
    admin.from("project_data").select("company_name, company_description, services, content_edits").eq("order_id", id).maybeSingle(),
  ]);

  const order = orderRes.data;
  const pd = pdRes.data;
  const companyName = pd?.company_name || order?.template_name || "Компания";
  const description = pd?.company_description || "";
  const services = (pd?.services ?? []).join(", ");

  const prompt = `Ты помогаешь создать контент для сайта компании. Используй только предоставленные данные.

Компания: ${companyName}
Описание: ${description || "(не указано)"}
Услуги: ${services || "(не указаны)"}
Заметки клиента: ${order?.notes || "(нет)"}

Сгенерируй контент для следующих секций сайта на русском языке. Ответь ТОЛЬКО валидным JSON объектом следующей структуры:

{
  "hero": {
    "title": "краткий заголовок 3-6 слов",
    "subtitle": "подзаголовок 10-20 слов",
    "cta_text": "текст кнопки 2-4 слова"
  },
  "about": {
    "title": "заголовок раздела",
    "text": "2-3 абзаца о компании"
  },
  "cta": {
    "title": "призыв к действию",
    "subtitle": "краткое пояснение",
    "cta_text": "текст кнопки"
  },
  "faq": {
    "title": "Часто задаваемые вопросы",
    "items": [
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." },
      { "question": "...", "answer": "..." }
    ]
  },
  "reviews": {
    "title": "Отзывы клиентов",
    "items": [
      { "author": "Имя Фамилия", "text": "текст отзыва", "rating": 5 },
      { "author": "Имя Фамилия", "text": "текст отзыва", "rating": 5 }
    ]
  }
}`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ ok: false, error: "Failed to parse AI response" }, { status: 500 });

    const generated = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ ok: true, generated });
  } catch {
    return NextResponse.json({ ok: false, error: "Генерация контента не удалась. Попробуйте ещё раз." }, { status: 500 });
  }
}
