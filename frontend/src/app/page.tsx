import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureStrips from "@/components/FeatureStrips";
import Experience from "@/components/Experience";
import Projects from "@/components/ProjectsServer";
import Skills from "@/components/Skills";
import SkillsNetwork from "@/components/SkillsNetwork";
import PerformanceDashboard from "@/components/PerformanceDashboard";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

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
        <SkillsNetwork />
        <div className="border-t border-gray-800/60" />
        <PerformanceDashboard />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
