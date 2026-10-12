import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic"; // read SITE_URL at runtime, not build time

export default function robots(): MetadataRoute.Robots {
  const site = process.env.SITE_URL;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ...(site ? { sitemap: `${site.replace(/\/$/, "")}/sitemap.xml` } : {}),
  };
}
