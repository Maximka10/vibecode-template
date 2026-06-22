import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";

export type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

function Block({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "h":
      return <h3 className="mt-6 text-base font-bold text-white">{block.text}</h3>;
    case "list":
      return (
        <ul className="mt-3 space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/60">
              <span className="mt-0.5 shrink-0 text-cyan-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return <p className="mt-3 text-sm leading-relaxed text-white/60">{block.text}</p>;
  }
}

export function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <Navbar />

      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-120px] h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/15 via-blue-600/8 to-transparent blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 pb-12 pt-28 sm:pt-32">
          <Link href="/" className="text-xs text-white/40 transition hover:text-white/70">
            ← На главную
          </Link>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-xs text-white/35">Редакция от {updated}</p>
          {intro && <p className="mt-6 text-sm leading-relaxed text-white/55">{intro}</p>}
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-14">
        <div className="space-y-10">
          {sections.map((section, i) => (
            <section key={i}>
              <h2 className="flex items-baseline gap-3 text-lg font-black text-white">
                <span className="text-sm font-black text-cyan-400">{i + 1}.</span>
                {section.heading}
              </h2>
              <div className="mt-1 pl-7">
                {section.blocks.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/4 p-6 text-sm text-white/55">
          <p className="font-semibold text-white/80">Остались вопросы?</p>
          <p className="mt-2">
            Напишите нам через{" "}
            <Link href="/templates" className="text-cyan-400 underline-offset-2 hover:underline">
              форму заявки
            </Link>{" "}
            или в личном кабинете — ответим в течение рабочего дня.
          </p>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
