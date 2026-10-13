import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureStrips from "@/components/FeatureStrips";
import Experience from "@/components/Experience";
import Projects from "@/components/ProjectsServer";
import Skills from "@/components/Skills";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidgetLazy";

export const dynamic = "force-dynamic";

// schema.org Person — lets search engines show a rich profile result
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Amir Ahmedin Temam",
  jobTitle: "AI Engineer",
  description:
    "AI Engineer specializing in multi-agent systems, evaluation benchmarks, and production automation pipelines.",
  address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Carnegie Mellon University Africa" },
    { "@type": "CollegeOrUniversity", name: "Addis Ababa University" },
  ],
  knowsAbout: ["Multi-agent systems", "LangGraph", "Retrieval-augmented generation", "LLM evaluation", "Python"],
  sameAs: [
    "https://github.com/IbnuEyni",
    "https://www.linkedin.com/in/amir-ahmedin-812349264/",
    "https://huggingface.co/shuaibam",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-indigo-600 focus:text-white focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

          {/* ── Feature Strips ──────────────────────────────────── */}
          <FeatureStrips />

          {/* ── Full sections ───────────────────────────────────── */}
          <div className="border-t border-gray-800/60 mt-20" />
          <Experience />
          <div className="border-t border-gray-800/60" />
          <Projects />
          <div className="border-t border-gray-800/60" />
          <Skills />
          <div className="border-t border-gray-800/60" />
          <PerformanceDashboard />
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
