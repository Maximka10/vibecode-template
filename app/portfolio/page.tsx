import { createAdminClient } from "@/lib/supabase/admin";

type PortfolioItem = {
  id: string;
  template_name: string | null;
  portfolio_industry: string | null;
  portfolio_description: string | null;
  portfolio_screenshot_url: string | null;
  project_url: string | null;
};

async function getPortfolio(): Promise<PortfolioItem[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select(
        "id, template_name, portfolio_industry, portfolio_description, portfolio_screenshot_url, project_url"
      )
      .eq("is_portfolio", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[portfolio/page] fetch error:", error.message);
      return [];
    }
    return (data ?? []) as PortfolioItem[];
  } catch {
    return [];
  }
}

export default async function PortfolioPage() {
  const items = await getPortfolio();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight">Наши работы</h1>
          <p className="text-white/50 text-sm">
            Проекты, реализованные командой Vibecode Studio
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/8 bg-white/4 py-20 text-center">
            <p className="text-white/30 text-sm">Работы скоро появятся</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition hover:border-white/20"
              >
                {/* Screenshot */}
                {item.portfolio_screenshot_url ? (
                  <div className="aspect-video overflow-hidden bg-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.portfolio_screenshot_url}
                      alt={item.template_name ?? "Работа"}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-slate-900 flex items-center justify-center">
                    <span className="text-4xl opacity-20">🖥</span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 space-y-3">
                  {item.portfolio_industry && (
                    <span className="inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400">
                      {item.portfolio_industry}
                    </span>
                  )}
                  <h2 className="font-bold text-base leading-snug">
                    {item.template_name ?? "Без названия"}
                  </h2>
                  {item.portfolio_description && (
                    <p className="text-sm text-white/50 line-clamp-3">
                      {item.portfolio_description}
                    </p>
                  )}
                  {item.project_url && (
                    <a
                      href={item.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                    >
                      Посмотреть сайт →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
