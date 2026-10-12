import type { Metadata } from "next";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

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
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
