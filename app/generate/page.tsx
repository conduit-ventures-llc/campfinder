"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCompletion } from "@ai-sdk/react";
import { campfinderConfig } from "@/config/verticals/campfinder.config";

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
  return html;
}

function GenerateContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get("client_id");

  const [selectedType, setSelectedType] = useState("The Five Options");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

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
          <span className="text-white/70 text-sm">Your Summer Map</span>
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
                className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition min-h-[44px] ${
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
            <div className="bg-white border border-cf-border rounded-2xl p-6 sm:p-8 mb-4">
              <div dangerouslySetInnerHTML={{ __html: output || cleanHtml(completion) }} />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 bg-cf-blue text-white rounded-xl py-3.5 text-sm font-bold hover:opacity-90 transition min-h-[44px]"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 border-2 border-cf-blue text-cf-blue rounded-xl py-3.5 text-sm font-bold hover:bg-cf-blue/5 transition min-h-[44px]"
              >
                Print Family Plan
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex gap-3 mt-3">
              <button className="flex-1 bg-cf-green/10 text-cf-green border border-cf-green/20 rounded-xl py-3 text-sm font-bold hover:bg-cf-green/20 transition min-h-[44px]">
                Share with carpool families
              </button>
              <button className="flex-1 bg-cf-blue-light text-cf-blue border border-cf-blue/20 rounded-xl py-3 text-sm font-bold hover:bg-cf-blue/10 transition min-h-[44px]">
                Share with co-parent
              </button>
            </div>
          </div>
        )}
      </div>
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
            <p className="text-sm text-cf-muted">Loading CampFinder...</p>
          </div>
        </div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
