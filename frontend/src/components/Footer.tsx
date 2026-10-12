const LINKS = [
  { label: "GitHub",      href: "https://github.com/IbnuEyni" },
  { label: "LinkedIn",    href: "https://www.linkedin.com/in/amir-ahmedin-812349264/" },
  { label: "HuggingFace", href: "https://huggingface.co/shuaibam" },
  { label: "Email",       href: "mailto:shuaibamir69@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-12">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
