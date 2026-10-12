import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

// self-hosted at build time — no render-blocking request to Google Fonts
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], variable: "--font-inter" });

const title = "Amir Ahmedin — AI Engineer";
const description =
  "AI Engineer specializing in multi-agent systems, evaluation benchmarks, and production automation pipelines. 9 agent systems shipped in 12 weeks.";

export const metadata: Metadata = {
  // SITE_URL makes the OG image URL absolute; set it to the public domain in production
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title,
  description,
  authors: [{ name: "Amir Ahmedin Temam" }],
  keywords: ["AI Engineer", "Multi-Agent Systems", "LangGraph", "RAG", "LLM Evaluation", "Kigali"],
  openGraph: { type: "website", title, description, siteName: "Amir Ahmedin" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable}`}>
      <body className="bg-gray-950 text-gray-100 antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
