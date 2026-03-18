"use client";

import { useState, useEffect, useCallback } from "react";

interface CampDeepDiveData {
  description: string;
  ages_schedule: string;
  kids_love: string[];
  parents_say: string[];
  aca_status: string;
  aca_link: string;
  financial_aid: string;
  aid_link: string;
  registration_steps: string[];
  registration_email_draft: string;
}

interface CampDeepDiveProps {
  isOpen: boolean;
  onClose: () => void;
  campName: string;
  campHtml: string;
  clientId: string;
  onAddToPlan: (content: string) => void;
  onDraftEmail: (campName: string) => void;
}

export default function CampDeepDive({
  isOpen,
  onClose,
  campName,
  campHtml,
  clientId,
  onAddToPlan,
  onDraftEmail,
}: CampDeepDiveProps) {
  const [data, setData] = useState<CampDeepDiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDeepDive = useCallback(async () => {
    if (!campName || !clientId) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch("/api/camp-deep-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camp_name: campName,
          camp_html: campHtml,
          client_id: clientId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to load camp details");
      }

      const json = await res.json();
      setData(json);
    } catch {
      setError("Could not load camp details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [campName, campHtml, clientId]);

  useEffect(() => {
    if (isOpen && campName) {
      fetchDeepDive();
    }
    if (!isOpen) {
      setData(null);
      setError("");
    }
  }, [isOpen, campName, fetchDeepDive]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl overflow-y-auto transition-transform duration-300 w-full sm:w-[480px]"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E8E0D8] px-6 py-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[#C8922A] uppercase tracking-wide mb-1">
                Camp Deep Dive
              </p>
              <h2
                className="text-xl font-bold text-[#0A1E3D] truncate"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {campName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="ml-3 mt-1 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              aria-label="Close panel"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 pb-48">
          {loading && (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-2 border-[#C8922A]/30 border-t-[#C8922A] rounded-full spin-slow mx-auto mb-4" />
              <p className="text-[15px] text-[#78716C]">CampFinder is researching this camp...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-[15px] text-red-800">
              {error}
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Description & Philosophy */}
              <section>
                <h3 className="text-[13px] font-bold text-[#0A1E3D] uppercase tracking-wide mb-2">
                  Description &amp; Philosophy
                </h3>
                <p className="text-[15px] text-[#1C1917] leading-relaxed whitespace-pre-line">
                  {data.description}
                </p>
              </section>

              {/* Ages & Typical Day */}
              <section>
                <h3 className="text-[13px] font-bold text-[#0A1E3D] uppercase tracking-wide mb-2">
                  Ages &amp; Typical Day
                </h3>
                <div className="bg-[#E3EDF5] rounded-xl px-4 py-3 text-[15px] text-[#0A1E3D] whitespace-pre-line">
                  {data.ages_schedule}
                </div>
              </section>

              {/* What Kids Love */}
              <section>
                <h3 className="text-[13px] font-bold text-[#0A1E3D] uppercase tracking-wide mb-2">
                  What Kids Love
                </h3>
                <ul className="space-y-2">
                  {data.kids_love.map((quote, i) => (
                    <li
                      key={i}
                      className="bg-[#FFF8EB] border border-[#C8922A]/15 rounded-lg px-4 py-2.5 text-[15px] text-[#1C1917] italic"
                    >
                      &ldquo;{quote}&rdquo;
                    </li>
                  ))}
                </ul>
              </section>

              {/* What Parents Say */}
              <section>
                <h3 className="text-[13px] font-bold text-[#0A1E3D] uppercase tracking-wide mb-2">
                  What Parents Say
                </h3>
                <ul className="space-y-2">
                  {data.parents_say.map((quote, i) => (
                    <li
                      key={i}
                      className="bg-white border border-[#E8E0D8] rounded-lg px-4 py-2.5 text-[15px] text-[#1C1917]"
                    >
                      &ldquo;{quote}&rdquo;
                    </li>
                  ))}
                </ul>
              </section>

              {/* ACA Accreditation */}
              <section>
                <h3 className="text-[13px] font-bold text-[#0A1E3D] uppercase tracking-wide mb-2">
                  ACA Accreditation
                </h3>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[13px] font-bold ${
                      data.aca_status === "Accredited"
                        ? "bg-[#D8EFE3] text-[#2D6A4F]"
                        : "bg-gray-100 text-[#78716C]"
                    }`}
                  >
                    {data.aca_status}
                  </span>
                  {data.aca_link && (
                    <a
                      href={data.aca_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-[#C8922A] font-semibold hover:underline"
                    >
                      Verify on ACA
                    </a>
                  )}
                </div>
              </section>

              {/* Financial Aid */}
              <section>
                <h3 className="text-[13px] font-bold text-[#0A1E3D] uppercase tracking-wide mb-2">
                  Financial Aid
                </h3>
                <p className="text-[15px] text-[#1C1917]">{data.financial_aid}</p>
                {data.aid_link && (
                  <a
                    href={data.aid_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#C8922A] font-semibold hover:underline mt-1 inline-block"
                  >
                    Apply for Financial Aid
                  </a>
                )}
              </section>

              {/* Registration Steps */}
              <section>
                <h3 className="text-[13px] font-bold text-[#0A1E3D] uppercase tracking-wide mb-2">
                  Registration Steps
                </h3>
                <ol className="space-y-2">
                  {data.registration_steps.map((step, i) => (
                    <li key={i} className="flex gap-3 text-[15px] text-[#1C1917]">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#0A1E3D] text-white rounded-full flex items-center justify-center text-[13px] font-bold">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step.replace(/^Step \d+:\s*/i, "")}</span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </div>

        {/* Sticky bottom bar */}
        {data && (
          <div className="fixed bottom-0 right-0 w-full sm:w-[480px] bg-white border-t border-[#E8E0D8] px-6 py-4 z-10">
            <button
              onClick={() => onDraftEmail(campName)}
              className="w-full bg-[#C8922A] text-white rounded-xl py-3 text-[15px] font-bold hover:opacity-90 transition min-h-[44px] mb-2"
            >
              Draft Registration Email
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onAddToPlan(data.description)}
                className="flex-1 border-2 border-[#0A1E3D] text-[#0A1E3D] rounded-xl py-2.5 text-[15px] font-bold hover:bg-[#0A1E3D]/5 transition min-h-[44px]"
              >
                Add to My Plan
              </button>
              <button
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/search/carpool+${encodeURIComponent(campName)}`,
                    "_blank"
                  );
                }}
                className="flex-1 border-2 border-[#0A1E3D] text-[#0A1E3D] rounded-xl py-2.5 text-[15px] font-bold hover:bg-[#0A1E3D]/5 transition min-h-[44px]"
              >
                Find Carpool
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
