export default function HomePage() {
  return (
    <div className="min-h-screen bg-cf-warm flex flex-col">
      <nav className="px-6 py-5">
        <div className="max-w-[800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[22px]">&#9978;&#65039;</span>
            <span className="font-serif text-lg font-bold text-cf-blue tracking-tight">CampFinder</span>
          </div>
          <a href="/intake" className="text-sm font-bold text-cf-blue hover:opacity-70 transition min-h-[44px] flex items-center px-2">
            Get Started
          </a>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="max-w-[600px] w-full text-center fade-up">
          <h1 className="font-serif text-[40px] sm:text-[56px] font-bold text-cf-blue leading-tight mb-4">
            The summer puzzle &mdash; solved.
          </h1>
          <p className="text-cf-muted text-[17px] mb-10 max-w-[460px] mx-auto leading-relaxed">
            Multiple kids. Different ages. Different camps. Different weeks. Carpools. Costs. Conflicts.
            CampFinder turns the chaos into a plan &mdash; in minutes, not weeks.
          </p>

          <a
            href="/intake"
            className="inline-block bg-cf-gold text-white rounded-2xl px-10 py-4 text-[18px] font-bold hover:opacity-90 transition shadow-sm min-h-[44px]"
          >
            Plan My Summer &rarr;
          </a>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="bg-white border border-cf-border rounded-xl p-5">
              <div className="text-2xl mb-2">&#128483;&#65039;</div>
              <h3 className="text-sm font-bold text-cf-blue mb-1">Just talk</h3>
              <p className="text-xs text-cf-muted">Tell us your situation. Voice or text. We listen first.</p>
            </div>
            <div className="bg-white border border-cf-border rounded-xl p-5">
              <div className="text-2xl mb-2">&#128506;</div>
              <h3 className="text-sm font-bold text-cf-blue mb-1">Five options</h3>
              <p className="text-xs text-cf-muted">Real plans with real costs, drive times, and carpool matches.</p>
            </div>
            <div className="bg-white border border-cf-border rounded-xl p-5">
              <div className="text-2xl mb-2">&#129309;</div>
              <h3 className="text-sm font-bold text-cf-blue mb-1">Share the plan</h3>
              <p className="text-xs text-cf-muted">Send to carpool families and co-parents in one tap.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="px-6 py-6 text-center">
        <p className="text-xs text-cf-muted">&copy; {new Date().getFullYear()} Conduit Ventures LLC</p>
      </footer>
    </div>
  );
}
