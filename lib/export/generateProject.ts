import { SiteSection, SectionType } from "@/types/sections";

export type SiteJson = {
  meta: { title: string; description: string; domain: string };
  branding: { primary: string; secondary: string };
  company: { name: string; description: string; address: string; working_hours: string };
  contacts: { phone: string; email: string; telegram: string };
  sections: SiteSection[];
};

// ── Component templates ───────────────────────────────────────────────────────

const COMPONENT_TEMPLATES: Record<SectionType, (s: SiteSection) => string> = {
  hero: (s) => `import { SiteSection } from "@/types";

export default function Hero({ section }: { section: SiteSection }) {
  const { title, subtitle, cta_text } = section.content as {
    title?: string; subtitle?: string; cta_text?: string;
  };
  return (
    <section
      className="px-8 py-20 text-white"
      style={{ background: \`linear-gradient(135deg, var(--primary), var(--secondary))\` }}
    >
      <div className="mx-auto max-w-4xl">
        {title && <h1 className="text-4xl font-black leading-tight sm:text-5xl">{title}</h1>}
        {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed opacity-85">{subtitle}</p>}
        {cta_text && (
          <a
            href="#contacts"
            className="mt-8 inline-block rounded-full border-2 border-white/40 bg-white/20 px-8 py-3 font-bold backdrop-blur-sm transition hover:bg-white/30"
          >
            {cta_text}
          </a>
        )}
      </div>
    </section>
  );
}
`,

  about: (s) => `import { SiteSection } from "@/types";

export default function About({ section }: { section: SiteSection }) {
  const { title, text } = section.content as { title?: string; text?: string };
  return (
    <section className="px-8 py-16 bg-white" id="about">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-6 text-3xl font-black text-slate-800">{title}</h2>}
        {text && <p className="text-lg leading-relaxed text-slate-600 whitespace-pre-line">{text}</p>}
      </div>
    </section>
  );
}
`,

  services: (s) => `import { SiteSection } from "@/types";

export default function Services({ section }: { section: SiteSection }) {
  const { title, items } = section.content as { title?: string; items?: string[] };
  if (!items?.length) return null;
  return (
    <section className="px-8 py-16 bg-slate-50" id="services">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-8 text-3xl font-black text-slate-800">{title}</h2>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 h-1 w-10 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
              <p className="font-semibold text-slate-800">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  gallery: (s) => `import { SiteSection } from "@/types";
import Image from "next/image";

export default function Gallery({ section }: { section: SiteSection }) {
  const { title, images } = section.content as { title?: string; images?: string[] };
  if (!images?.length) return null;
  return (
    <section className="px-8 py-16 bg-white" id="gallery">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-8 text-3xl font-black text-slate-800">{title}</h2>}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
              <Image src={src} alt={\`Gallery \${i + 1}\`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  reviews: (s) => `import { SiteSection } from "@/types";

type Review = { author: string; text: string; rating: number };

export default function Reviews({ section }: { section: SiteSection }) {
  const { title, items } = section.content as { title?: string; items?: Review[] };
  if (!items?.length) return null;
  return (
    <section className="px-8 py-16 bg-slate-50" id="reviews">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-8 text-3xl font-black text-slate-800">{title}</h2>}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((r, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="text-yellow-500">{"★".repeat(r.rating ?? 5)}</p>
              <p className="mt-3 leading-relaxed text-slate-600">"{r.text}"</p>
              <p className="mt-4 text-sm font-semibold text-slate-500">— {r.author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  faq: (s) => `"use client";
import { useState } from "react";
import { SiteSection } from "@/types";

type FAQItem = { question: string; answer: string };

export default function FAQ({ section }: { section: SiteSection }) {
  const { title, items } = section.content as { title?: string; items?: FAQItem[] };
  const [open, setOpen] = useState<number | null>(null);
  if (!items?.length) return null;
  return (
    <section className="px-8 py-16 bg-white" id="faq">
      <div className="mx-auto max-w-3xl">
        {title && <h2 className="mb-8 text-3xl font-black text-slate-800">{title}</h2>}
        <div className="space-y-3">
          {items.map((f, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-slate-800 hover:bg-slate-50"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{f.question}</span>
                <span className="ml-4 text-slate-400">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="border-t border-slate-100 px-6 py-4 text-slate-600">{f.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  pricing: (s) => `import { SiteSection } from "@/types";

type Plan = { name: string; price: string; features: string[] };

export default function Pricing({ section }: { section: SiteSection }) {
  const { title, plans } = section.content as { title?: string; plans?: Plan[] };
  if (!plans?.length) return null;
  return (
    <section className="px-8 py-16 bg-slate-50" id="pricing">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-8 text-3xl font-black text-slate-800">{title}</h2>}
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((p, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-bold text-slate-800">{p.name}</p>
              <p className="mt-2 text-3xl font-black" style={{ color: "var(--primary)" }}>{p.price}</p>
              <ul className="mt-4 space-y-2">
                {(p.features ?? []).map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                    <span style={{ color: "var(--primary)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  cta: (s) => `import { SiteSection } from "@/types";

export default function CTA({ section }: { section: SiteSection }) {
  const { title, subtitle, cta_text } = section.content as {
    title?: string; subtitle?: string; cta_text?: string;
  };
  return (
    <section
      className="px-8 py-20 text-center text-white"
      style={{ background: \`linear-gradient(135deg, var(--primary), var(--secondary))\` }}
    >
      <div className="mx-auto max-w-2xl">
        {title && <h2 className="text-3xl font-black">{title}</h2>}
        {subtitle && <p className="mt-3 text-lg opacity-80">{subtitle}</p>}
        {cta_text && (
          <a
            href="#contacts"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 font-bold transition hover:opacity-90"
            style={{ color: "var(--primary)" }}
          >
            {cta_text}
          </a>
        )}
      </div>
    </section>
  );
}
`,

  contacts: (s) => `import { SiteSection } from "@/types";

export default function Contacts({ section }: { section: SiteSection }) {
  const { title, phone, email, telegram, address, working_hours } = section.content as {
    title?: string; phone?: string; email?: string; telegram?: string;
    address?: string; working_hours?: string;
  };
  const items = [
    phone && { icon: "📞", label: "Телефон", value: phone, href: \`tel:\${phone}\` },
    email && { icon: "✉️", label: "Email", value: email, href: \`mailto:\${email}\` },
    telegram && { icon: "💬", label: "Telegram", value: telegram, href: \`https://t.me/\${telegram.replace("@", "")}\` },
    address && { icon: "📍", label: "Адрес", value: address, href: null },
    working_hours && { icon: "🕐", label: "Режим работы", value: working_hours, href: null },
  ].filter(Boolean) as { icon: string; label: string; value: string; href: string | null }[];

  return (
    <section className="px-8 py-16 bg-white" id="contacts">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-8 text-3xl font-black text-slate-800">{title}</h2>}
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="mt-1 font-semibold text-slate-700 hover:underline" style={{ color: "var(--primary)" }}>{item.value}</a>
                ) : (
                  <p className="mt-1 font-semibold text-slate-700">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
`,

  map: (s) => `import { SiteSection } from "@/types";

export default function Map({ section }: { section: SiteSection }) {
  const { title, address, embed_url } = section.content as {
    title?: string; address?: string; embed_url?: string;
  };
  return (
    <section className="px-8 py-16 bg-slate-50" id="map">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-4 text-3xl font-black text-slate-800">{title}</h2>}
        {address && <p className="mb-6 text-slate-600">📍 {address}</p>}
        {embed_url ? (
          <iframe src={embed_url} className="h-72 w-full rounded-2xl border-0" loading="lazy" allowFullScreen />
        ) : (
          <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
            Карта будет здесь
          </div>
        )}
      </div>
    </section>
  );
}
`,

  footer: (s) => `import { SiteSection } from "@/types";

export default function Footer({ section }: { section: SiteSection }) {
  const { company_name, links } = section.content as { company_name?: string; links?: string[] };
  return (
    <footer className="px-8 py-8 bg-slate-900 text-slate-400">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
        <span className="font-semibold" style={{ color: "var(--primary)" }}>{company_name}</span>
        <div className="flex flex-wrap gap-6 text-sm">
          {(links ?? []).map((l, i) => <span key={i}>{l}</span>)}
        </div>
        <p className="w-full text-center text-xs text-slate-600 sm:w-auto sm:text-left">
          © {new Date().getFullYear()} {company_name}. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
`,
};

// ── File generators ───────────────────────────────────────────────────────────

function genPackageJson(siteName: string): string {
  return JSON.stringify({
    name: siteName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "my-site",
    version: "0.1.0",
    private: true,
    scripts: { dev: "next dev", build: "next build", start: "next start" },
    dependencies: {
      next: "14.2.30",
      react: "^18",
      "react-dom": "^18",
    },
    devDependencies: {
      "@types/node": "^20",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      autoprefixer: "^10",
      postcss: "^8",
      tailwindcss: "^3",
      typescript: "^5",
    },
  }, null, 2);
}

function genNextConfig(): string {
  return `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
`;
}

function genTsConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2017",
      lib: ["dom", "dom.iterable", "esnext"],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: "esnext",
      moduleResolution: "bundler",
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: "preserve",
      incremental: true,
      plugins: [{ name: "next" }],
      paths: { "@/*": ["./*"] },
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"],
  }, null, 2);
}

function genTailwindConfig(primary: string, secondary: string): string {
  return `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "${primary}",
        secondary: "${secondary}",
      },
    },
  },
  plugins: [],
};

export default config;
`;
}

function genPostcssConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
}

function genGlobalsCSS(primary: string, secondary: string): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: ${primary};
  --secondary: ${secondary};
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}
`;
}

function genTypes(): string {
  return `export type SiteSection = {
  id: string;
  type: string;
  enabled: boolean;
  content: Record<string, unknown>;
};
`;
}

function genLayout(site: SiteJson): string {
  return `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: ${JSON.stringify(site.meta.title || site.company.name || "Сайт компании")},
  description: ${JSON.stringify(site.meta.description || site.company.description || "")},
  ${site.meta.domain ? `metadataBase: new URL("https://${site.meta.domain}"),` : ""}
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
`;
}

function genPage(sections: SiteSection[]): string {
  const enabled = sections.filter((s) => s.enabled);
  const imports = enabled
    .map((s) => {
      const name = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      return `import ${name} from "@/components/sections/${name}";`;
    })
    .join("\n");
  const sectionComponents = enabled
    .map((s) => {
      const name = s.type.charAt(0).toUpperCase() + s.type.slice(1);
      return `      <${name} section={siteData.sections.find(sec => sec.id === ${JSON.stringify(s.id)}) ?? siteData.sections[0]} />`;
    })
    .join("\n");

  return `import siteData from "@/content/site.json";
${imports}

export default function Home() {
  return (
    <main>
${sectionComponents}
    </main>
  );
}
`;
}

function genReadme(site: SiteJson): string {
  return `# ${site.company.name || "Сайт компании"}

Сгенерировано автоматически — [Vibecode Studio](https://vibecode-studio-pink.vercel.app)

## Запуск

\`\`\`bash
npm install
npm run dev
\`\`\`

Откройте [http://localhost:3000](http://localhost:3000)

## Деплой

\`\`\`bash
npm run build
npm start
\`\`\`

Или задеплойте на [Vercel](https://vercel.com).

## Структура

- \`app/\` — Next.js App Router
- \`components/sections/\` — компоненты секций
- \`content/site.json\` — контент сайта (редактируйте здесь)
`;
}

// ── Main generator ─────────────────────────────────────────────────────────────

export function generateProject(site: SiteJson): Record<string, string> {
  const files: Record<string, string> = {};
  const primary = site.branding.primary || "#6366f1";
  const secondary = site.branding.secondary || "#8b5cf6";
  const enabledSections = site.sections.filter((s) => s.enabled);

  // Config files
  files["package.json"] = genPackageJson(site.company.name);
  files["next.config.mjs"] = genNextConfig();
  files["tsconfig.json"] = genTsConfig();
  files["tailwind.config.ts"] = genTailwindConfig(primary, secondary);
  files["postcss.config.js"] = genPostcssConfig();
  files[".gitignore"] = "node_modules\n.next\n.env.local\n";
  files["README.md"] = genReadme(site);

  // Types
  files["types/index.ts"] = genTypes();

  // Content
  files["content/site.json"] = JSON.stringify(site, null, 2);

  // App shell
  files["app/layout.tsx"] = genLayout(site);
  files["app/page.tsx"] = genPage(enabledSections);
  files["app/globals.css"] = genGlobalsCSS(primary, secondary);

  // Section components
  for (const section of enabledSections) {
    const type = section.type as SectionType;
    const tpl = COMPONENT_TEMPLATES[type];
    if (tpl) {
      const name = type.charAt(0).toUpperCase() + type.slice(1);
      files[`components/sections/${name}.tsx`] = tpl(section);
    }
  }

  // Public placeholder
  files["public/.gitkeep"] = "";

  return files;
}
