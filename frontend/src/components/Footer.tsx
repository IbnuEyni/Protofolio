export default function Footer() {
  return (
    <footer className="border-t border-gray-800 mt-12">
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Amir Ahmedin. Built with Next.js &amp; Flask.
        </p>
        <div className="flex gap-6">
          <a
            href="https://github.com/Amir-Ahmedin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/amir-ahmedin-812349264/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="mailto:shuaibahmedin@gmail.com"
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
