import { createAdminClient } from "@/lib/supabase/admin";

async function checkDB() {
  try {
    const admin = createAdminClient();
    const { error } = await admin.from("orders").select("id").limit(1);
    return error ? { ok: false, msg: "DB query failed" } : { ok: true, msg: "Connected" };
  } catch { return { ok: false, msg: "Cannot reach database" }; }
}

async function checkStorage() {
  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.getBucket("order-files");
    return error ? { ok: false, msg: "Bucket 'order-files' not found" } : { ok: true, msg: "Bucket exists" };
  } catch { return { ok: false, msg: "Storage unreachable" }; }
}

async function checkTables() {
  const admin = createAdminClient();
  const tables = ["orders", "project_data", "site_builds", "section_templates", "project_templates"];
  const results: { table: string; ok: boolean; msg: string }[] = [];
  for (const table of tables) {
    const { error } = await admin.from(table as never).select("id").limit(1);
    results.push({ table, ok: !error, msg: error ? "Error" : "OK" });
  }
  return results;
}

export default async function DiagnosticsPage() {
  const [db, storage, tables] = await Promise.all([checkDB(), checkStorage(), checkTables()]);

  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasTelegramToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const hasTelegramChat = !!process.env.TELEGRAM_CHAT_ID;

  const StatusDot = ({ ok }: { ok: boolean }) => (
    <span className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
  );

  return (
    <div className="min-h-screen bg-[#0f1117] p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-white">Диагностика системы</h1>

        <div className="space-y-4">
          {/* Database */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <StatusDot ok={db.ok} />
              <span className="font-medium">База данных</span>
              <span className={`ml-auto text-sm ${db.ok ? "text-green-400" : "text-red-400"}`}>{db.msg}</span>
            </div>
          </div>

          {/* Storage */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <StatusDot ok={storage.ok} />
              <span className="font-medium">Хранилище файлов</span>
              <span className={`ml-auto text-sm ${storage.ok ? "text-green-400" : "text-red-400"}`}>{storage.msg}</span>
            </div>
          </div>

          {/* AI */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <StatusDot ok={hasAnthropicKey} />
              <span className="font-medium">AI (Anthropic)</span>
              <span className={`ml-auto text-sm ${hasAnthropicKey ? "text-green-400" : "text-yellow-400"}`}>
                {hasAnthropicKey ? "Ключ настроен" : "ANTHROPIC_API_KEY не задан"}
              </span>
            </div>
          </div>

          {/* Telegram */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <StatusDot ok={hasTelegramToken && hasTelegramChat} />
              <span className="font-medium">Telegram Bot</span>
              <span className={`ml-auto text-sm ${hasTelegramToken && hasTelegramChat ? "text-green-400" : "text-yellow-400"}`}>
                {hasTelegramToken && hasTelegramChat ? "Настроен" : "Токен или chat_id не задан"}
              </span>
            </div>
          </div>

          {/* Tables */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h2 className="mb-4 font-medium">Таблицы базы данных</h2>
            <div className="space-y-2">
              {tables.map((t) => (
                <div key={t.table} className="flex items-center gap-3 text-sm">
                  <StatusDot ok={t.ok} />
                  <span className="font-mono text-white/70">{t.table}</span>
                  <span className={`ml-auto ${t.ok ? "text-green-400" : "text-red-400"}`}>{t.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
