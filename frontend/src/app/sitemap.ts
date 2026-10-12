import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic"; // read SITE_URL at runtime, not build time

export default function sitemap(): MetadataRoute.Sitemap {
  const site = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return [
    { url: `${site}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${site}/resume.pdf`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
