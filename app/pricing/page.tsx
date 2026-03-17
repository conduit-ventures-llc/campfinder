"use client";

interface Tier {
  name: string;
  monthlyPrice: string;
  annualPrice: string;
  annualSavings: string;
  badge: string | null;
  features: string[];
  highlight: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Family",
    monthlyPrice: "$19/mo",
    annualPrice: "$149/yr",
    annualSavings: "Save $79",
    badge: null,
    features: [
      "Full Summer Map",
      "Five Options itinerary",
      "Carpool matching",
      "Deadline alerts",
      "Registration reminders",
    ],
    highlight: false,
  },
  {
    name: "Family Plus",
    monthlyPrice: "$39/mo",
    annualPrice: "$299/yr",
    annualSavings: "Save $169",
    badge: "Most Popular",
    features: [
      "Everything in Family",
      "Multi-location support",
      "Calendar sync (Google + Apple)",
      "Mix and Match builder",
      "Priority support",
      "Year-over-year memory",
    ],
    highlight: true,
  },
];

export default function CampFinderPricingPage() {
  return (
    <div className="min-h-screen bg-cf-warm">
      <nav className="bg-cf-blue px-6">
        <div className="max-w-[900px] mx-auto py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <span className="text-[22px]">&#9978;&#65039;</span>
            <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
          </a>
          <a href="/intake" className="text-white/70 text-sm hover:text-white transition min-h-[44px] flex items-center px-2">
            Try Free &rarr;
          </a>
        </div>
      </nav>

      <div className="max-w-[800px] mx-auto px-6 pt-12 pb-24">
        {/* Header */}
        <div className="text-center mb-12 fade-up">
          <h1 className="font-serif text-[32px] sm:text-[40px] font-bold text-cf-blue mb-3">
            The summer puzzle has a price tag
          </h1>
          <p className="text-cf-muted text-[16px] max-w-[460px] mx-auto leading-relaxed">
            Less than one hour of a babysitter. More than 20 hours of your time back.
          </p>
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12 fade-up">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 sm:p-8 ${
                tier.highlight
                  ? "bg-cf-blue text-white border-2 border-cf-blue shadow-lg"
                  : "bg-white border border-cf-border"
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-6 text-[11px] font-bold px-3 py-1 rounded-full bg-cf-gold text-white">
                  {tier.badge}
                </span>
              )}

              <h3 className={`font-serif text-xl font-bold mb-4 ${tier.highlight ? "text-white" : "text-cf-blue"}`}>
                {tier.name}
              </h3>

              <div className="flex items-baseline gap-3 mb-2">
                <span className={`text-[32px] font-bold font-serif ${tier.highlight ? "text-white" : "text-cf-text"}`}>
                  {tier.monthlyPrice}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className={`text-sm ${tier.highlight ? "text-white/70" : "text-cf-muted"}`}>
                  or {tier.annualPrice}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  tier.highlight ? "bg-cf-gold text-white" : "bg-cf-gold/10 text-cf-gold"
                }`}>
                  {tier.annualSavings}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px]">
                    <span className={tier.highlight ? "text-white/80" : "text-cf-green"}>&#10003;</span>
                    <span className={tier.highlight ? "text-white/90" : "text-cf-text"}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/intake"
                className={`block w-full rounded-xl py-3.5 text-[15px] font-bold text-center transition min-h-[44px] ${
                  tier.highlight
                    ? "bg-white text-cf-blue hover:bg-white/90"
                    : "bg-cf-gold text-white hover:opacity-90"
                }`}
              >
                Plan your first week free
              </a>
            </div>
          ))}
        </div>

        {/* Value proposition */}
        <div className="text-center mb-10 fade-up">
          <p className="font-serif text-[18px] text-cf-muted italic max-w-[480px] mx-auto leading-relaxed">
            &ldquo;CampFinder is not priced against spreadsheets. It is priced against the 20 hours you spend every spring figuring out summer.&rdquo;
          </p>
        </div>

        {/* Free trial CTA */}
        <div className="text-center fade-up">
          <a
            href="/intake"
            className="inline-block bg-cf-gold text-white rounded-2xl px-10 py-4 text-[17px] font-bold hover:opacity-90 transition shadow-sm min-h-[44px]"
          >
            Plan your first week free &mdash; no credit card
          </a>
        </div>
      </div>

      <footer className="bg-cf-blue px-6 py-6">
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <p className="text-xs text-white/50">&copy; {new Date().getFullYear()} Conduit Ventures LLC</p>
          <p className="text-xs text-white/50">CampFinder</p>
        </div>
      </footer>
    </div>
  );
}
