import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function POST(req: NextRequest) {
  let dbError: null | string = null;
  let savedToDb = false;
  try {
    const body = await req.json();
    const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (token) { savedToDb = true; }
    if (config.telegram.isConfigured) {
      await fetch(
        `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: config.telegram.chatId,
            text: `Новая заявка: ${body.templateName}\nЗаявка сохранена — открой админ-панель для чата`,
          }),
        }
      ).catch((e) => { dbError = String(e); });
    }
    return NextResponse.json({ ok: true, savedToDb, dbError });
  } catch (e) {
    return NextResponse.json(
      { ok: false, savedToDb: false, dbError: e instanceof Error ? e.message : String(e) },
      { status: 400 }
    );
  }
}
