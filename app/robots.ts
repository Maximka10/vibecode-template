import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibecode.studio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard", "/preview-frame", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
