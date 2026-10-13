const EMAIL = "shuaibahmedin@gmail.com";

const LINKS = [
  { label: "GitHub",      href: "https://github.com/IbnuEyni" },
  { label: "LinkedIn",    href: "https://www.linkedin.com/in/amir-ahmedin-812349264/" },
  { label: "HuggingFace", href: "https://huggingface.co/shuaibam" },
  { label: "Email",       href: `mailto:${EMAIL}` },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-12">
      {/* ── Contact CTA ── */}
      <section id="contact" className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center scroll-mt-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">Contact</p>
        <h2 className="text-3xl font-bold text-white">Let&apos;s build something</h2>
        <p className="mt-3 text-gray-400 text-sm">
          Open to AI engineering roles and contract work on agent systems, evaluation, and automation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={`mailto:${EMAIL}`}
            className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
          >
            Email me
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-medium transition-colors"
          >
            Download Résumé
          </a>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800/60">
        <div className="text-center sm:text-left">
          <p className="text-sm text-gray-400">Amir Ahmedin Temam · AI Engineer · Kigali, Rwanda</p>
          <p className="text-xs text-gray-600 mt-1">
            © {new Date().getFullYear()} · Built with Next.js &amp; Flask
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-sm text-gray-500 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
