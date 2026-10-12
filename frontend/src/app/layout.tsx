import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amir Ahmedin — AI Engineer",
  description:
    "AI Engineer specializing in multi-agent systems, evaluation benchmarks, and production automation pipelines. 9 agent systems shipped in 12 weeks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
