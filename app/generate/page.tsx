"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCompletion } from "@ai-sdk/react";
import { campfinderConfig } from "@/config/verticals/campfinder.config";
import { findMatchingResources, buildResourceLinksHtml } from "@/lib/resource-links";
import CampDeepDive from "@/components/CampDeepDive";

/** Strip markdown code fences and preamble from Claude output */
function cleanHtml(raw: string): string {
  let html = raw;
  const fenceMatch = html.match(/```html?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    html = fenceMatch[1].trim();
  }
  // Also strip any leading non-HTML text before the first tag
  const tagStart = html.indexOf("<");
  if (tagStart > 0) {
    html = html.slice(tagStart);
  }
  // Inject resource links
  html = injectResourceLinks(html);
  return html;
}

/** Scan output HTML for keywords and inject a resource links section */
function injectResourceLinks(html: string): string {
  const resources = findMatchingResources(html);
  if (resources.length === 0) return html;
  const linksHtml = buildResourceLinksHtml(resources);
  // Insert before the last closing tag, or append
  const lastClose = html.lastIndexOf("</");
  if (lastClose > 0) {
    return html.slice(0, lastClose) + linksHtml + html.slice(lastClose);
  }
  return html + linksHtml;
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");

  const [selectedType, setSelectedType] = useState("The Five Options");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"map" | "builder">("map");

  // Smart Refine state
  const [refineInput, setRefineInput] = useState("");
  const [refining, setRefining] = useState(false);

  // Camp Deep Dive state
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState<{ campName: string; campHtml: string }>({
    campName: "",
    campHtml: "",
  });
  const outputRef = useRef<HTMLDivElement>(null);

  const { completion, isLoading, complete, setCompletion } = useCompletion({
    api: "/api/generate",
    streamProtocol: "text",
    onFinish: (_prompt, text) => { setOutput(cleanHtml(text)); },
    onError: () => { setError("We hit a snag building your Summer Map. Tap Generate to try again."); },
  });

  async function handleGenerate() {
    setError("");
    setOutput("");
    setCompletion("");
    await complete("generate", {
      body: { client_id: clientId, output_type: selectedType },
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(output || cleanHtml(completion));
  }

  // Smart Refine handler
  async function handleRefine() {
    if (!refineInput.trim() || refining) return;
    setRefining(true);
    setError("");
    setOutput("");
    setCompletion("");
    await complete("generate", {
      body: {
        client_id: clientId,
        output_type: selectedType,
        refine_instruction: refineInput.trim(),
      },
    });
    setRefineInput("");
    setRefining(false);
  }

  // Deep Dive: inject "Learn More" buttons into camp cards after render
  const injectDeepDiveButtons = useCallback(() => {
    if (!outputRef.current) return;
    const cards = outputRef.current.querySelectorAll(
      ".camp-card, div[class*='camp']"
    );
    cards.forEach((card) => {
      if (card.querySelector(".camp-learn-more-btn")) return;
      // Extract camp name from first heading or strong tag
      const heading =
        card.querySelector("h2, h3, h4, strong");
      const name = heading?.textContent?.trim() || "This Camp";
      const btn = document.createElement("button");
      btn.className = "camp-learn-more-btn";
      btn.textContent = "Learn More \u2192";
      btn.dataset.campName = name;
      card.appendChild(btn);
    });
  }, []);

  // Run injection after output renders
  useEffect(() => {
    if (output || completion) {
      // Small delay to ensure DOM is updated
      const t = setTimeout(injectDeepDiveButtons, 100);
      return () => clearTimeout(t);
    }
  }, [output, completion, injectDeepDiveButtons]);

  // Event delegation for deep dive button clicks
  useEffect(() => {
    const container = outputRef.current;
    if (!container) return;

    function handleClick(e: MouseEvent) {
      const btn = (e.target as HTMLElement).closest(
        ".camp-learn-more-btn"
      ) as HTMLElement | null;
      if (!btn) return;
      const campName = btn.dataset.campName || "Unknown Camp";
      const card = btn.closest(".camp-card, div[class*='camp']");
      const campHtml = card?.innerHTML || "";
      setDeepDiveData({ campName, campHtml });
      setDeepDiveOpen(true);
    }

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [output, completion]);

  if (!clientId) {
    return (
      <div className="min-h-screen bg-cf-warm flex items-center justify-center px-6">
        <div className="text-center max-w-[400px] fade-up">
          <div className="text-5xl mb-5">&#9978;&#65039;</div>
          <h1 className="font-serif text-2xl font-bold text-cf-blue mb-3">Let&apos;s get you set up first</h1>
          <p className="text-cf-muted text-[15px] mb-8">CampFinder needs to learn about your family before we can plan your summer.</p>
          <a href="/intake" className="inline-block bg-cf-gold text-white px-8 py-3.5 rounded-xl text-[15px] font-bold hover:opacity-90 transition min-h-[44px]">
            Start My Intake
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cf-warm">
      <nav className="bg-cf-blue px-6">
        <div className="max-w-[900px] mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[22px]">&#9978;&#65039;</span>
            <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-[13px]">Your Summer Map</span>
            <a href="/" className="text-white/60 text-[13px] hover:text-white transition min-h-[44px] flex items-center px-2">Home</a>
          </div>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-6 pt-8 pb-24">
        {/* Output type selector */}
        <div className="mb-6">
          <label className="block text-[15px] font-bold text-cf-text mb-3">What do you need?</label>
          <div className="flex flex-wrap gap-2">
            {campfinderConfig.outputTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-4 py-2.5 rounded-lg text-[15px] font-medium border transition min-h-[44px] ${
                  selectedType === t
                    ? "bg-cf-blue text-white border-cf-blue"
                    : "bg-white text-cf-text border-cf-border hover:border-cf-blue/30"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className={`w-full rounded-2xl py-4 text-[17px] font-bold transition min-h-[44px] mb-6 ${
            !isLoading
              ? "bg-cf-gold text-white hover:opacity-90 cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin-slow inline-block" />
              CampFinder is building your plan...
            </span>
          ) : (
            "Generate"
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-6">
            <p className="text-[15px] text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Output */}
        {(output || completion) && (
          <div className="fade-up">
            {/* Tab toggle: Summer Map / Build My Plan */}
            <div className="flex gap-1 mb-4">
              <button
                onClick={() => setActiveTab("map")}
                className={`px-4 py-2.5 rounded-xl text-[15px] font-bold transition min-h-[44px] ${
                  activeTab === "map" ? "bg-cf-blue text-white" : "bg-white text-cf-text border border-cf-border"
                }`}
              >
                Summer Map
              </button>
              <button
                onClick={() => setActiveTab("builder")}
                className={`px-4 py-2.5 rounded-xl text-[15px] font-bold transition min-h-[44px] ${
                  activeTab === "builder" ? "bg-cf-blue text-white" : "bg-white text-cf-text border border-cf-border"
                }`}
              >
                Build My Plan
              </button>
            </div>

            {/* Summer Map Tab */}
            {activeTab === "map" && (
              <>
                <div className="bg-white border border-cf-border rounded-2xl p-6 sm:p-8 mb-4 shadow-sm">
                  <div ref={outputRef} className="cf-output" dangerouslySetInnerHTML={{ __html: output || cleanHtml(completion) }} />
                </div>

                {/* Smart Refine */}
                <div className="mt-4 mb-4">
                  <p className="text-[13px] font-bold text-cf-blue uppercase tracking-wide mb-2">Refine Your Plan</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      "Swap this camp",
                      "Find carpool",
                      "Add sibling discount",
                      "Try different week",
                      "Show cheaper options",
                      "Show closer options",
                      "Add to waitlist",
                      "Draft registration email",
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setRefineInput(chip + ": ")}
                        className="px-3 py-1.5 rounded-full text-[13px] font-semibold border border-cf-gold/30 bg-cf-gold/5 text-cf-gold hover:bg-cf-gold hover:text-white transition cursor-pointer min-h-[44px] flex items-center"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={refineInput}
                      onChange={(e) => setRefineInput(e.target.value)}
                      placeholder="Tell CampFinder what to change..."
                      rows={2}
                      className="flex-1 border border-cf-border rounded-xl px-4 py-3 text-[15px] bg-white focus:border-cf-gold/50 focus:ring-1 focus:ring-cf-gold/20 resize-none"
                    />
                    <button
                      onClick={handleRefine}
                      disabled={!refineInput.trim() || refining}
                      className={`px-5 rounded-xl text-[15px] font-bold transition min-h-[44px] ${
                        !refineInput.trim() || refining
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-cf-blue text-white hover:opacity-90 cursor-pointer"
                      }`}
                    >
                      {refining ? "Refining..." : "Refine"}
                    </button>
                  </div>
                </div>

                {/* Execution Layer — Camp Action Bar */}
                <div className="bg-cf-gold/5 border border-cf-gold/20 rounded-2xl p-5 mb-4">
                  <h3 className="text-[18px] font-bold text-cf-blue mb-2">Ready to register?</h3>
                  <p className="text-[13px] text-cf-muted mb-3">
                    Every camp in your plan has registration details. Tap &ldquo;Draft Email&rdquo; on any camp card above to generate a personalized registration email you can review and send.
                  </p>
                  <button
                    onClick={() => {
                      const emailBody = `Hi — I'm interested in registering my child for your camp program. Could you send me information about availability, registration, and any deposits required?\n\nThank you!`;
                      window.location.href = `mailto:?subject=Camp Registration Inquiry&body=${encodeURIComponent(emailBody)}`;
                    }}
                    className="bg-cf-gold text-white rounded-xl px-4 py-2.5 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]"
                  >
                    Draft Registration Email
                  </button>
                </div>
              </>
            )}

            {/* Mix and Match Builder Tab */}
            {activeTab === "builder" && (
              <div className="bg-white border border-cf-border rounded-2xl p-6 sm:p-8 mb-4 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-cf-blue mb-2">Build Your Plan</h2>
                <p className="text-cf-muted text-[15px] mb-6">
                  Drag camps between slots to build your custom summer. Conflicts and costs update in real time.
                </p>

                {/* Running totals */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-cf-warm rounded-xl p-3 text-center">
                    <p className="text-[13px] text-cf-muted">Total Cost</p>
                    <p className="text-lg font-bold font-mono text-cf-blue">$0</p>
                  </div>
                  <div className="bg-cf-warm rounded-xl p-3 text-center">
                    <p className="text-[13px] text-cf-muted">Weeks Covered</p>
                    <p className="text-lg font-bold font-mono text-cf-blue">0/13</p>
                  </div>
                  <div className="bg-cf-warm rounded-xl p-3 text-center">
                    <p className="text-[13px] text-cf-muted">Conflicts</p>
                    <p className="text-lg font-bold font-mono text-cf-green">0</p>
                  </div>
                </div>

                {/* Three-zone builder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Your Plan */}
                  <div>
                    <p className="text-[13px] font-bold text-cf-blue uppercase tracking-wide mb-2">Your Plan</p>
                    <div className="bg-cf-blue/5 border-2 border-dashed border-cf-blue/20 rounded-xl p-4 min-h-[200px]">
                      <p className="text-[13px] text-cf-muted text-center py-8">
                        Drag camps here from Available Options to build your plan.
                      </p>
                    </div>
                  </div>

                  {/* Available Options */}
                  <div>
                    <p className="text-[13px] font-bold text-cf-gold uppercase tracking-wide mb-2">Available Options</p>
                    <div className="bg-cf-gold/5 border-2 border-dashed border-cf-gold/20 rounded-xl p-4 min-h-[200px]">
                      <p className="text-[13px] text-cf-muted text-center py-8">
                        Options from your Summer Map appear here. Drag them into Your Plan.
                      </p>
                    </div>
                  </div>

                  {/* Swap Pool */}
                  <div>
                    <p className="text-[13px] font-bold text-cf-muted uppercase tracking-wide mb-2">Swap Pool</p>
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 min-h-[200px]">
                      <p className="text-[13px] text-cf-muted text-center py-8">
                        Alternatives go here. Swap them in if you change your mind.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 bg-cf-gold text-white rounded-xl py-3.5 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]">
                    Save My Plan
                  </button>
                  <button className="flex-1 border-2 border-cf-blue text-cf-blue rounded-xl py-3.5 text-[15px] font-bold hover:bg-cf-blue/5 transition min-h-[44px]">
                    Share Plan
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-cf-blue text-white rounded-xl py-3.5 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 border-2 border-cf-blue text-cf-blue rounded-xl py-3.5 text-[15px] font-bold hover:bg-cf-blue/5 transition min-h-[44px]"
              >
                Print Family Plan
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex gap-3 mt-3">
              <button className="flex-1 bg-cf-green/10 text-cf-green border border-cf-green/20 rounded-xl py-3 text-[15px] font-bold hover:bg-cf-green/20 transition min-h-[44px]">
                Share with carpool families
              </button>
              <button className="flex-1 bg-cf-blue-light text-cf-blue border border-cf-blue/20 rounded-xl py-3 text-[15px] font-bold hover:bg-cf-blue/10 transition min-h-[44px]">
                Share with co-parent
              </button>
            </div>

            {/* End Moment — Operator Recruitment */}
            <div className="mt-6 bg-cf-blue rounded-2xl p-6 sm:p-8 text-center">
              <p className="text-[13px] text-white/50 uppercase tracking-wide mb-2">You just saved hours</p>
              <h3 className="font-serif text-xl font-bold text-white mb-3">
                You&apos;re not the only parent with this puzzle.
              </h3>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://conduitventures.com"
                  className="bg-cf-gold text-white rounded-xl px-6 py-3 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]"
                >
                  Tell me about becoming an expert
                </a>
                <button
                  onClick={handleCopy}
                  className="bg-white/10 text-white rounded-xl px-6 py-3 text-[15px] font-bold hover:bg-white/20 transition min-h-[44px]"
                >
                  Share with another parent
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Camp Deep Dive Panel */}
      <CampDeepDive
        isOpen={deepDiveOpen}
        onClose={() => setDeepDiveOpen(false)}
        campName={deepDiveData.campName}
        campHtml={deepDiveData.campHtml}
        clientId={clientId}
        onAddToPlan={(content) => {
          setDeepDiveOpen(false);
          setRefineInput("Add this camp to my plan: " + content.slice(0, 100));
        }}
        onDraftEmail={(name) => {
          const emailBody = `Hi — I'm interested in registering my child for ${name}. Could you send me information about availability, registration, and any deposits required?\n\nThank you!`;
          window.location.href = `mailto:?subject=${encodeURIComponent(name)} Registration Inquiry&body=${encodeURIComponent(emailBody)}`;
        }}
      />
    </div>
  );
}

export default function CampFinderGeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cf-warm flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cf-blue/30 border-t-cf-blue rounded-full spin-slow mx-auto mb-4" />
            <p className="text-[15px] text-cf-muted">Loading CampFinder...</p>
          </div>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
