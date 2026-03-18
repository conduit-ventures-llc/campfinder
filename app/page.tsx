export default function HomePage() {
  return (
    <div className="min-h-screen bg-cf-warm flex flex-col">
      {/* Nav */}
      <nav className="bg-cf-blue px-6">
        <div className="max-w-[900px] mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[22px]">&#9978;&#65039;</span>
            <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
          </div>
          <a
            href="/intake"
            className="text-white/80 text-[15px] font-bold hover:text-white transition min-h-[44px] flex items-center px-3"
          >
            Get Started &rarr;
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16 pt-8">
        <div className="max-w-[640px] w-full text-center fade-up">
          <p className="text-[13px] font-bold text-cf-gold uppercase tracking-[0.2em] mb-4">
            Conduit Ventures
          </p>
          <h1 className="font-serif text-[40px] sm:text-[56px] font-bold text-cf-blue leading-[1.1] mb-5">
            The summer puzzle &mdash; solved.
          </h1>
          <p className="text-cf-muted text-[17px] sm:text-[18px] mb-10 max-w-[480px] mx-auto leading-relaxed">
            Multiple kids. Different ages. Different camps. Different weeks. Carpools. Costs. Conflicts.
            CampFinder turns the chaos into a plan &mdash; in minutes, not weeks.
          </p>

          <a
            href="/intake"
            className="inline-block bg-cf-gold text-white rounded-2xl px-10 py-4 text-[18px] font-bold hover:opacity-90 transition shadow-lg shadow-cf-gold/20 min-h-[44px] pulse-glow"
          >
            Plan My Summer &rarr;
          </a>

          {/* Feature Cards */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white border border-cf-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-cf-blue/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl">&#128483;&#65039;</span>
              </div>
              <h3 className="text-[18px] font-bold text-cf-blue mb-2">Just talk</h3>
              <p className="text-[13px] text-cf-muted leading-relaxed">
                Tell us your situation. Voice or text. We listen first &mdash; then ask only what we need.
              </p>
            </div>
            <div className="bg-white border border-cf-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-cf-gold/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl">&#128506;</span>
              </div>
              <h3 className="text-[18px] font-bold text-cf-blue mb-2">Five options</h3>
              <p className="text-[13px] text-cf-muted leading-relaxed">
                Real plans with real costs, GPS drive times, and carpool matches. Choose one or mix and match.
              </p>
            </div>
            <div className="bg-white border border-cf-border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-cf-green/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-xl">&#129309;</span>
              </div>
              <h3 className="text-[18px] font-bold text-cf-blue mb-2">Share the plan</h3>
              <p className="text-[13px] text-cf-muted leading-relaxed">
                Send to carpool families and co-parents in one tap. Everyone sees what they need.
              </p>
            </div>
          </div>

          {/* Trust line */}
          <p className="mt-10 text-[13px] text-cf-muted">
            Built by parents, for parents. Powered by Conduit Ventures.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-cf-blue px-6 py-6">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <p className="text-[13px] text-white/50">&copy; {new Date().getFullYear()} Conduit Ventures LLC</p>
          <p className="text-[13px] text-white/50">CampFinder</p>
        </div>
      </footer>
    </div>
  );
}
