import BentoCard from "../BentoCard";

export default function HeroBentoCard() {
  return (
    <BentoCard accent="indigo" className="lg:col-span-2 lg:row-span-2">
      <div className="flex flex-col justify-between h-full">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Available for opportunities
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Amir 
          </h1>
          <p className="text-xl font-medium text-indigo-400 mt-1">
            Software &amp; AI Engineer
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mt-4 max-w-sm">
            Building scalable backend systems and intelligent applications —
            from REST APIs and microservices to NLP pipelines and AI-powered products.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <a href="#projects" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            View Projects
          </a>
          <a href="#experience" className="px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white text-sm font-medium transition-colors">
            Experience
          </a>
        </div>
      </div>
      <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl" />
    </BentoCard>
  );
}
