"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { campfinderConfig } from "@/config/verticals/campfinder.config";

type Phase = "open_mic" | "extracting" | "what_i_heard" | "must_haves" | "life_calendar" | "adaptive" | "submitting" | "wow";

interface ExtractedData {
  kids: Array<{ name: string; age: number }>;
  camps_already_decided: string[];
  blocked_weeks: string[];
  main_concerns: string[];
  whats_solved: string[];
  whats_not_solved: string[];
  budget_mentioned: string | null;
  zip_code: string | null;
  allergies_or_needs: string[];
  last_year_experience: string | null;
  carpool_interest: boolean | null;
  fields_still_needed: string[];
}

interface AdaptiveQuestion {
  id: string;
  label: string;
}

// Phase order for progress dots
const PHASE_ORDER: Phase[] = ["open_mic", "what_i_heard", "must_haves", "life_calendar", "adaptive", "wow"];
const PHASE_LABELS: Record<string, string> = {
  open_mic: "Tell Us",
  what_i_heard: "Review",
  must_haves: "Must-Haves",
  life_calendar: "Calendar",
  adaptive: "Details",
  wow: "Your Plan",
};

// Progress percentages by phase
const progressMap: Record<Phase, number> = {
  open_mic: 10,
  extracting: 25,
  what_i_heard: 35,
  must_haves: 45,
  life_calendar: 55,
  adaptive: 70,
  submitting: 90,
  wow: 100,
};

// Confetti launcher
function launchConfetti() {
  const colors = ["#C8922A", "#0A1E3D", "#E3EDF5", "#FFF8EB", "#D8EFE3", "#FFFFFF"];
  const container = document.createElement("div");
  container.id = "confetti-container";
  document.body.appendChild(container);

  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    piece.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    container.appendChild(piece);
  }

  setTimeout(() => {
    container.remove();
  }, 3000);
}

// Haptic feedback helper
function haptic(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

// Gold arrow SVG component
function GoldArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Navy arrow for gold buttons
function WhiteArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

// Back arrow
function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

// Microphone icon
function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="1" width="6" height="11" rx="3" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

// Checkmark icon
function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// Progress dots component
function ProgressDots({ currentPhase }: { currentPhase: Phase }) {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  // For extracting/submitting, show the phase they came from
  const effectiveIndex = currentPhase === "extracting" ? 0 : currentPhase === "submitting" ? 4 : currentIndex;

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {PHASE_ORDER.map((p, i) => (
        <div key={p} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div
              className={`progress-dot ${
                i < effectiveIndex
                  ? "progress-dot--completed"
                  : i === effectiveIndex
                  ? "progress-dot--current"
                  : "progress-dot--future"
              }`}
            />
            <span className={`text-[9px] mt-1 font-medium tracking-wide ${
              i <= effectiveIndex ? "text-cf-gold" : "text-gray-300"
            }`}>
              {PHASE_LABELS[p]}
            </span>
          </div>
          {i < PHASE_ORDER.length - 1 && (
            <div className={`progress-dot-connector mb-3 ${i < effectiveIndex ? "bg-cf-gold" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Autosave indicator
function AutosaveIndicator({ saving }: { saving: boolean }) {
  if (!saving) return null;
  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
      <div className="w-2 h-2 rounded-full bg-cf-gold save-pulse" />
      <span className="text-[10px] text-cf-gold font-medium tracking-wide uppercase">Saving</span>
    </div>
  );
}

// Premium nav
function IntakeNav() {
  return (
    <nav className="bg-cf-blue px-6">
      <div className="max-w-[720px] mx-auto py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px]">&#9978;&#65039;</span>
          <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
        </div>
      </div>
    </nav>
  );
}

export default function CampFinderIntakePage() {
  const [phase, setPhase] = useState<Phase>("open_mic");
  const [openMicText, setOpenMicText] = useState("");
  const [activeChips, setActiveChips] = useState<string[]>([]);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [questions, setQuestions] = useState<AdaptiveQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [wowLetter, setWowLetter] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [phaseReady, setPhaseReady] = useState(false);
  const [currentAdaptiveIndex, setCurrentAdaptiveIndex] = useState(0);

  // Must-haves per kid
  const [mustHaves, setMustHaves] = useState<Record<string, string>>({});

  // Life calendar — recurring commitments
  const [calendarEntries, setCalendarEntries] = useState<Array<{
    activity: string;
    days: string;
    kids: string;
    duration: string;
  }>>([]);

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Tab title with completion percentage
  useEffect(() => {
    const pct = progressMap[phase];
    document.title = `${pct}% — CampFinder Intake`;
  }, [phase]);

  // Initial load delay for first phase
  useEffect(() => {
    const timer = setTimeout(() => setPhaseReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      // Go back based on current phase
      if (phase === "what_i_heard") setPhase("open_mic");
      else if (phase === "must_haves") setPhase("what_i_heard");
      else if (phase === "life_calendar") setPhase(extracted?.kids.length ? "must_haves" : "what_i_heard");
      else if (phase === "adaptive") setPhase("life_calendar");
    }
  }, [phase, extracted]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Autosave simulation
  useEffect(() => {
    if (openMicText || Object.keys(mustHaves).length || calendarEntries.length || Object.keys(answers).length) {
      setSaving(true);
      const timer = setTimeout(() => setSaving(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [openMicText, mustHaves, calendarEntries, answers]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setTranscribing(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          if (res.ok) {
            const data = await res.json();
            setOpenMicText((prev) => (prev ? prev + " " + data.text : data.text));
          }
        } catch { /* silent */ }
        finally { setTranscribing(false); }
      };
      mediaRecorder.start();
      setRecording(true);
      haptic(15);
      setTimeout(() => { if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.stop(); setRecording(false); } }, 90000);
    } catch { setError("We couldn\u2019t access your microphone. Please check your browser settings and try again."); }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.stop(); setRecording(false); haptic(10); }
  }

  function toggleChip(label: string) {
    setActiveChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
    if (!activeChips.includes(label)) {
      setOpenMicText((prev) => (prev ? prev + "\n" + label + ": " : label + ": "));
    }
    haptic(5);
  }

  async function handleOpenMicSubmit() {
    if (!openMicText.trim()) return;
    haptic(15);
    setPhase("extracting");
    setError("");
    try {
      const res = await fetch("/api/extract-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ open_mic_text: openMicText }),
      });
      if (!res.ok) throw new Error("Extraction failed");
      const data = await res.json();
      setExtracted(data.extracted);
      setPhase("what_i_heard");
    } catch {
      setError("We had a little trouble understanding that. Could you try adding a bit more detail?");
      setPhase("open_mic");
    }
  }

  async function handleConfirmExtraction() {
    if (!extracted) return;
    haptic(10);
    if (extracted.kids.length > 0) {
      setPhase("must_haves");
    } else {
      handlePostMustHaves();
    }
  }

  async function handlePostMustHaves() {
    haptic(10);
    setPhase("life_calendar");
  }

  async function handlePostLifeCalendar() {
    haptic(10);
    setPhase("extracting");
    try {
      const res = await fetch("/api/adaptive-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extracted_data: extracted, open_mic_text: openMicText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
          setCurrentAdaptiveIndex(0);
          setPhase("adaptive");
        } else {
          handleSubmitIntake();
        }
      } else {
        handleSubmitIntake();
      }
    } catch {
      handleSubmitIntake();
    }
  }

  async function handleSubmitIntake() {
    setPhase("submitting");
    setError("");
    haptic([10, 50, 10]);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          open_mic_text: openMicText,
          extracted_data: extracted,
          adaptive_answers: answers,
          audio_url: audioUrl,
          must_haves: mustHaves,
          life_calendar: calendarEntries,
        }),
      });
      if (!res.ok) throw new Error("Intake failed");
      const data = await res.json();
      setClientId(data.client_id);
      setWowLetter(data.wow_letter);
      setPhase("wow");
      setTimeout(() => launchConfetti(), 300);
      haptic([20, 30, 20, 30, 20]);
    } catch {
      setError("Something went wrong on our end. Your information is safe \u2014 let\u2019s try that again.");
      setPhase("adaptive");
    }
  }

  // ─── OPEN MIC ─────────────────────────────────────────────────────────

  if (phase === "open_mic") {
    return (
      <div className="min-h-screen bg-cf-warm">
        <AutosaveIndicator saving={saving} />
        <IntakeNav />
        <div className="max-w-[720px] mx-auto px-6">
          <ProgressDots currentPhase="open_mic" />
        </div>

        <div className={`max-w-[720px] mx-auto px-6 pt-6 pb-24 ${phaseReady ? "slide-in-right" : "opacity-0"}`}>
          <h1 className="font-serif text-[32px] sm:text-[42px] font-bold text-cf-blue leading-[1.15] mb-3 text-left">
            Tell me about your<br />summer camp situation.
          </h1>
          <p className="text-cf-muted text-[15px] mb-10 max-w-[520px]">
            Tell us about your family&apos;s summer. We&apos;ll listen to every detail.
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2.5 mb-8">
            {campfinderConfig.openMicChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => toggleChip(chip.label)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all duration-200 min-h-[44px] ${
                  activeChips.includes(chip.label)
                    ? "bg-cf-gold text-white border-cf-gold shadow-sm"
                    : "bg-white text-cf-blue border-cf-blue/20 hover:border-cf-gold/60 hover:bg-cf-gold/5"
                }`}
              >
                {chip.emoji} {chip.label}
              </button>
            ))}
          </div>

          {/* Voice capture */}
          <div className="flex justify-center mb-6">
            {transcribing ? (
              <div className="flex items-center gap-3 px-6 py-3.5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cf-gold dot-pulse-1" />
                  <div className="w-2.5 h-2.5 rounded-full bg-cf-gold dot-pulse-2" />
                  <div className="w-2.5 h-2.5 rounded-full bg-cf-gold dot-pulse-3" />
                </div>
                <span className="text-sm text-cf-muted font-medium">Listening to what you said...</span>
              </div>
            ) : recording ? (
              <button onClick={stopRecording} className="flex items-center gap-3 bg-red-50 border-2 border-red-300 rounded-full px-8 py-4 min-h-[44px] hover:bg-red-100 transition-all duration-200">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-red-700">Recording... tap to stop</span>
              </button>
            ) : (
              <button onClick={startRecording} className="flex items-center gap-4 bg-cf-blue border-2 border-cf-blue rounded-full px-8 py-4 min-h-[44px] hover:bg-cf-blue-dark transition-all duration-200 group">
                <MicIcon />
                <span className="text-sm font-bold text-white">At a fire pit? Just talk.</span>
              </button>
            )}
          </div>

          {audioUrl && !recording && !transcribing && (
            <div className="flex justify-center mb-6 fade-in">
              <audio src={audioUrl} controls className="h-8" />
            </div>
          )}

          {/* Floating label textarea */}
          <div className="floating-label-group mb-5">
            <textarea
              value={openMicText}
              onChange={(e) => setOpenMicText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  handleOpenMicSubmit();
                }
              }}
              placeholder=" "
              className="w-full bg-white border-2 border-cf-border rounded-2xl px-6 py-5 pt-8 text-[16px] resize-none h-44 focus:border-cf-blue transition-all duration-200 text-cf-text"
            />
            <label>Your story...</label>
          </div>

          {error && (
            <div className="bg-red-50/80 border border-red-200 rounded-2xl px-6 py-4 mb-5 backdrop-blur-sm">
              <p className="text-[15px] text-red-800 font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleOpenMicSubmit}
            disabled={!openMicText.trim() || transcribing}
            className={`w-full rounded-full py-4 text-[16px] font-bold transition-all duration-200 min-h-[52px] cta-pill ${
              openMicText.trim() && !transcribing
                ? "bg-cf-blue text-white hover:bg-cf-blue-dark cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <span>Show Me What You Heard</span>
            {openMicText.trim() && !transcribing && <GoldArrow />}
          </button>
        </div>
      </div>
    );
  }

  // ─── EXTRACTING / SUBMITTING ──────────────────────────────────────────

  if (phase === "extracting" || phase === "submitting") {
    return (
      <div className="min-h-screen gradient-shift flex items-center justify-center px-6">
        <div className="text-center slide-in-right">
          {/* Three pulsing dots instead of spinner */}
          <div className="flex justify-center gap-3 mb-8">
            <div className="w-4 h-4 rounded-full bg-cf-blue dot-pulse-1" />
            <div className="w-4 h-4 rounded-full bg-cf-blue dot-pulse-2" />
            <div className="w-4 h-4 rounded-full bg-cf-blue dot-pulse-3" />
          </div>
          <h2 className="font-serif text-[28px] sm:text-[32px] font-bold text-cf-blue mb-4">
            {phase === "extracting" ? "Reading what you told me..." : "Building your family\u2019s profile..."}
          </h2>
          <p className="text-cf-muted text-[15px] max-w-[400px] mx-auto leading-relaxed">
            {phase === "extracting"
              ? "We\u2019re carefully extracting every detail so you never have to repeat yourself."
              : "Setting up your profile, crafting your welcome letter, and preparing your first Summer Map."}
          </p>
        </div>
      </div>
    );
  }

  // ─── WHAT I HEARD ─────────────────────────────────────────────────────

  if (phase === "what_i_heard" && extracted) {
    return (
      <div className="min-h-screen bg-cf-warm">
        <AutosaveIndicator saving={saving} />
        <IntakeNav />
        <div className="max-w-[720px] mx-auto px-6">
          <ProgressDots currentPhase="what_i_heard" />
        </div>

        <div className="max-w-[720px] mx-auto px-6 pt-6 pb-24 phase-enter">
          {/* Back button */}
          <button
            onClick={() => setPhase("open_mic")}
            className="flex items-center gap-2 text-cf-muted hover:text-cf-blue text-sm font-medium mb-6 transition-colors"
          >
            <BackArrow />
            <span>Back</span>
          </button>

          <h1 className="font-serif text-[32px] sm:text-[38px] font-bold text-cf-blue mb-2 leading-tight">
            Here&apos;s what I heard.
          </h1>
          <p className="text-cf-muted text-[15px] mb-10">
            Take a moment to make sure we got it right. Every detail matters.
          </p>

          <div className="space-y-5">
            {/* Kids */}
            {extracted.kids.length > 0 && (
              <div className="premium-card-accent p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A1E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  <p className="text-xs font-bold text-cf-blue uppercase tracking-widest">Your Kids</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {extracted.kids.map((k, i) => (
                    <span key={i} className="bg-cf-blue text-white text-sm font-bold px-4 py-2 rounded-full">
                      {k.name}, {k.age}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {extracted.main_concerns.length > 0 && (
              <div className="premium-card-accent p-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0A1E3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p className="text-xs font-bold text-cf-blue uppercase tracking-widest">Main Concerns</p>
                </div>
                <div className="space-y-2">
                  {extracted.main_concerns.map((c, i) => (
                    <p key={i} className="text-[15px] text-cf-text leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cf-gold mt-2 flex-shrink-0" />
                      {c}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* What's solved */}
            {extracted.whats_solved.length > 0 && (
              <div className="premium-card p-6" style={{ borderLeft: "4px solid #2D6A4F" }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckIcon className="text-cf-green" />
                  <p className="text-xs font-bold text-cf-green uppercase tracking-widest">Already Figured Out</p>
                </div>
                <div className="space-y-2">
                  {extracted.whats_solved.map((s, i) => (
                    <p key={i} className="text-[15px] text-cf-text leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cf-green mt-2 flex-shrink-0" />
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* What's not solved */}
            {extracted.whats_not_solved.length > 0 && (
              <div className="premium-card p-6" style={{ borderLeft: "4px solid #C8922A" }}>
                <div className="flex items-center gap-2 mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <p className="text-xs font-bold text-cf-gold uppercase tracking-widest">Still Need Help With</p>
                </div>
                <div className="space-y-2">
                  {extracted.whats_not_solved.map((s, i) => (
                    <p key={i} className="text-[15px] text-cf-text leading-relaxed flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cf-gold mt-2 flex-shrink-0" />
                      {s}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Budget + ZIP */}
            <div className="grid grid-cols-2 gap-4">
              {extracted.budget_mentioned && (
                <div className="premium-card p-5">
                  <p className="text-[10px] font-bold text-cf-muted uppercase tracking-widest mb-1">Budget</p>
                  <p className="text-lg font-bold text-cf-blue">{extracted.budget_mentioned}</p>
                </div>
              )}
              {extracted.zip_code && (
                <div className="premium-card p-5">
                  <p className="text-[10px] font-bold text-cf-muted uppercase tracking-widest mb-1">Location</p>
                  <p className="text-lg font-bold text-cf-blue">{extracted.zip_code}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-10">
            <button
              onClick={() => setPhase("open_mic")}
              className="text-cf-muted hover:text-cf-blue text-[15px] font-medium transition-colors underline underline-offset-4"
            >
              Let me add something
            </button>
            <div className="flex-1" />
            <button
              onClick={handleConfirmExtraction}
              className="bg-cf-blue text-white rounded-full px-8 py-3.5 text-[15px] font-bold hover:bg-cf-blue-dark transition-all duration-200 min-h-[48px] cta-pill"
            >
              <span>That&apos;s Right</span>
              <GoldArrow />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MUST-HAVES PER KID ─────────────────────────────────────────────

  if (phase === "must_haves" && extracted) {
    const kids = extracted.kids;

    return (
      <div className="min-h-screen bg-cf-warm">
        <AutosaveIndicator saving={saving} />
        <IntakeNav />
        <div className="max-w-[720px] mx-auto px-6">
          <ProgressDots currentPhase="must_haves" />
        </div>

        <div className="max-w-[720px] mx-auto px-6 pt-6 pb-24 phase-enter">
          {/* Back button */}
          <button
            onClick={() => setPhase("what_i_heard")}
            className="flex items-center gap-2 text-cf-muted hover:text-cf-blue text-sm font-medium mb-6 transition-colors"
          >
            <BackArrow />
            <span>Back</span>
          </button>

          <h1 className="font-serif text-[28px] sm:text-[36px] font-bold text-cf-blue mb-2 leading-tight">
            Before I suggest anything &mdash;
          </h1>
          <p className="text-cf-muted text-[15px] mb-10">
            Are there camps any of your kids are already set on? Lock them in so we build around what matters.
          </p>

          <div className="space-y-5">
            {kids.map((kid) => (
              <div key={kid.name} className="premium-card p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-cf-blue rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-white">{kid.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[16px] font-bold text-cf-text">{kid.name}</p>
                    <p className="text-xs text-cf-muted">Age {kid.age}</p>
                  </div>
                  {mustHaves[kid.name]?.trim() && (
                    <div className="flex items-center gap-1.5 bg-cf-gold/10 px-3 py-1.5 rounded-full">
                      <CheckIcon className="text-cf-gold" />
                      <span className="text-xs font-bold text-cf-gold">Locked in</span>
                    </div>
                  )}
                </div>
                <div className="floating-label-group">
                  <textarea
                    value={mustHaves[kid.name] || ""}
                    onChange={(e) => setMustHaves((prev) => ({ ...prev, [kid.name]: e.target.value }))}
                    placeholder=" "
                    className="w-full bg-cf-warm border-2 border-cf-border rounded-xl px-6 py-4 pt-7 text-sm resize-none h-24 focus:border-cf-blue transition-all duration-200"
                  />
                  <label style={{ left: 24, top: 14 }}>Non-negotiable camps for {kid.name}...</label>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mt-10">
            <button
              onClick={() => setPhase("what_i_heard")}
              className="flex items-center gap-2 text-cf-muted hover:text-cf-blue text-sm font-medium transition-colors"
            >
              <BackArrow />
            </button>
            <div className="flex-1" />
            <button
              onClick={handlePostMustHaves}
              className="bg-cf-blue text-white rounded-full px-8 py-3.5 text-[15px] font-bold hover:bg-cf-blue-dark transition-all duration-200 min-h-[48px] cta-pill"
            >
              <span>{Object.values(mustHaves).some((v) => v.trim()) ? "Continue" : "Skip \u2014 No Must-Haves"}</span>
              <GoldArrow />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── LIFE CALENDAR ────────────────────────────────────────────────────

  if (phase === "life_calendar") {
    const homeZip = extracted?.zip_code || "";
    const SUMMER_WEEKS = [
      "Jun 2\u20136", "Jun 9\u201313", "Jun 16\u201320", "Jun 23\u201327", "Jun 30\u2013Jul 3",
      "Jul 7\u201311", "Jul 14\u201318", "Jul 21\u201325", "Jul 28\u2013Aug 1",
      "Aug 4\u20138", "Aug 11\u201315", "Aug 18\u201322", "Aug 25\u201329",
    ];

    return (
      <div className="min-h-screen bg-cf-warm">
        <AutosaveIndicator saving={saving} />
        <IntakeNav />
        <div className="max-w-[780px] mx-auto px-6">
          <ProgressDots currentPhase="life_calendar" />
        </div>

        <div className="max-w-[780px] mx-auto px-6 pt-6 pb-24 phase-enter">
          {/* Back button */}
          <button
            onClick={() => setPhase(extracted?.kids.length ? "must_haves" : "what_i_heard")}
            className="flex items-center gap-2 text-cf-muted hover:text-cf-blue text-sm font-medium mb-6 transition-colors"
          >
            <BackArrow />
            <span>Back</span>
          </button>

          <h1 className="font-serif text-[28px] sm:text-[36px] font-bold text-cf-blue mb-2 leading-tight">
            Your summer calendar
          </h1>
          <p className="text-cf-muted text-[15px] mb-8">
            Add recurring commitments so we only suggest camps that actually fit your life.
          </p>

          {/* Summer Grid */}
          <div className="premium-card overflow-hidden mb-6">
            <div className="bg-cf-blue text-white px-5 py-3.5 text-sm font-bold flex items-center justify-between">
              <span className="font-serif text-[15px]">Summer 2026</span>
              <span className="text-xs text-white/50 font-medium">{calendarEntries.length} commitment{calendarEntries.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-cf-border/50">
              {SUMMER_WEEKS.map((week, idx) => (
                <div key={week} className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-cf-blue-light/30 ${idx % 2 === 0 ? "bg-white" : "bg-cf-warm/50"}`}>
                  <span className="text-xs font-mono text-cf-muted w-28 flex-shrink-0 font-medium">{week}</span>
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {calendarEntries
                      .filter((e) => e.days.includes(week.split("\u2013")[0].split(" ")[0]))
                      .map((e, i) => (
                        <span key={i} className="text-[10px] bg-cf-blue text-white px-2.5 py-1 rounded-full font-bold">
                          {e.activity} ({e.kids})
                        </span>
                      ))}
                  </div>
                  {homeZip && <span className="text-[10px] text-cf-muted/50 font-mono">{homeZip}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Add commitment */}
          <div className="premium-card p-6 mb-8">
            <p className="text-sm font-bold text-cf-blue mb-4 uppercase tracking-widest text-[11px]">Add a recurring commitment</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="floating-label-group">
                <input
                  placeholder=" "
                  className="w-full border-2 border-cf-border rounded-xl px-4 py-3 pt-6 text-sm focus:border-cf-blue transition-all duration-200 min-h-[48px]"
                  id="cal-activity"
                />
                <label style={{ left: 16, top: 12, fontSize: 13 }}>Activity</label>
              </div>
              <div className="floating-label-group">
                <input
                  placeholder=" "
                  className="w-full border-2 border-cf-border rounded-xl px-4 py-3 pt-6 text-sm focus:border-cf-blue transition-all duration-200 min-h-[48px]"
                  id="cal-days"
                />
                <label style={{ left: 16, top: 12, fontSize: 13 }}>Days</label>
              </div>
              <div className="floating-label-group">
                <input
                  placeholder=" "
                  className="w-full border-2 border-cf-border rounded-xl px-4 py-3 pt-6 text-sm focus:border-cf-blue transition-all duration-200 min-h-[48px]"
                  id="cal-kids"
                />
                <label style={{ left: 16, top: 12, fontSize: 13 }}>Which kid(s)</label>
              </div>
              <div className="floating-label-group">
                <input
                  placeholder=" "
                  className="w-full border-2 border-cf-border rounded-xl px-4 py-3 pt-6 text-sm focus:border-cf-blue transition-all duration-200 min-h-[48px]"
                  id="cal-duration"
                />
                <label style={{ left: 16, top: 12, fontSize: 13 }}>Duration</label>
              </div>
            </div>
            <button
              onClick={() => {
                const activity = (document.getElementById("cal-activity") as HTMLInputElement)?.value;
                const days = (document.getElementById("cal-days") as HTMLInputElement)?.value;
                const kids = (document.getElementById("cal-kids") as HTMLInputElement)?.value;
                const duration = (document.getElementById("cal-duration") as HTMLInputElement)?.value;
                if (activity?.trim()) {
                  setCalendarEntries((prev) => [...prev, { activity, days: days || "", kids: kids || "", duration: duration || "" }]);
                  (document.getElementById("cal-activity") as HTMLInputElement).value = "";
                  (document.getElementById("cal-days") as HTMLInputElement).value = "";
                  (document.getElementById("cal-kids") as HTMLInputElement).value = "";
                  (document.getElementById("cal-duration") as HTMLInputElement).value = "";
                  haptic(10);
                }
              }}
              className="mt-4 bg-cf-blue text-white rounded-full px-6 py-2.5 text-sm font-bold hover:bg-cf-blue-dark transition-all duration-200 min-h-[44px] cta-pill"
            >
              <span>Add Commitment</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPhase(extracted?.kids.length ? "must_haves" : "what_i_heard")}
              className="flex items-center gap-2 text-cf-muted hover:text-cf-blue text-sm font-medium transition-colors"
            >
              <BackArrow />
            </button>
            <div className="flex-1" />
            <button
              onClick={handlePostLifeCalendar}
              className="bg-cf-blue text-white rounded-full px-8 py-3.5 text-[15px] font-bold hover:bg-cf-blue-dark transition-all duration-200 min-h-[48px] cta-pill"
            >
              <span>{calendarEntries.length > 0 ? "Continue" : "Skip \u2014 No Commitments"}</span>
              <GoldArrow />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADAPTIVE QUESTIONS ───────────────────────────────────────────────

  if (phase === "adaptive") {
    const allAnswered = questions.every((q) => answers[q.id]?.trim());
    const currentQ = questions[currentAdaptiveIndex];
    const isLastQuestion = currentAdaptiveIndex === questions.length - 1;

    return (
      <div className="min-h-screen bg-cf-warm">
        <AutosaveIndicator saving={saving} />
        <IntakeNav />
        <div className="max-w-[720px] mx-auto px-6">
          <ProgressDots currentPhase="adaptive" />
        </div>

        <div className="max-w-[720px] mx-auto px-6 pt-6 pb-24 phase-enter">
          {/* Back button */}
          <button
            onClick={() => {
              if (currentAdaptiveIndex > 0) {
                setCurrentAdaptiveIndex(currentAdaptiveIndex - 1);
              } else {
                setPhase("life_calendar");
              }
            }}
            className="flex items-center gap-2 text-cf-muted hover:text-cf-blue text-sm font-medium mb-6 transition-colors"
          >
            <BackArrow />
            <span>Back</span>
          </button>

          <h1 className="font-serif text-[28px] sm:text-[36px] font-bold text-cf-blue mb-2 leading-tight">
            Just a few more things.
          </h1>
          <p className="text-cf-muted text-[15px] mb-3">
            We only ask what you haven&apos;t already told us.
          </p>
          <p className="text-xs text-cf-muted mb-10 font-medium">
            Question {currentAdaptiveIndex + 1} of {questions.length}
          </p>

          {/* Single question slide-in */}
          {currentQ && (
            <div key={currentQ.id} className="slide-in-right">
              <label className="block text-[16px] font-bold text-cf-text mb-1.5">{currentQ.label}</label>
              <p className="text-sm text-cf-muted mb-4">Take your time. Every detail helps us find the right fit.</p>
              <div className="floating-label-group">
                <textarea
                  value={answers[currentQ.id] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      if (answers[currentQ.id]?.trim()) {
                        if (isLastQuestion) {
                          handleSubmitIntake();
                        } else {
                          setCurrentAdaptiveIndex(currentAdaptiveIndex + 1);
                          haptic(5);
                        }
                      }
                    }
                  }}
                  placeholder=" "
                  className="w-full bg-white border-2 border-cf-border rounded-2xl px-6 py-5 pt-8 text-[15px] resize-none h-32 focus:border-cf-blue transition-all duration-200"
                />
                <label>Your answer...</label>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50/80 border border-red-200 rounded-2xl px-6 py-4 mt-5 backdrop-blur-sm">
              <p className="text-[15px] text-red-800 font-medium">{error}</p>
            </div>
          )}

          <div className="mt-8">
            {isLastQuestion && answers[currentQ?.id]?.trim() ? (
              <button
                onClick={handleSubmitIntake}
                disabled={!allAnswered}
                className={`w-full rounded-full py-4 text-[17px] font-bold transition-all duration-200 min-h-[52px] cta-pill ${
                  allAnswered
                    ? "bg-cf-gold text-white gentle-pulse cursor-pointer hover:brightness-110"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span>Show Me My Summer</span>
                <WhiteArrow />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (answers[currentQ?.id]?.trim()) {
                    setCurrentAdaptiveIndex(currentAdaptiveIndex + 1);
                    haptic(5);
                  }
                }}
                disabled={!answers[currentQ?.id]?.trim()}
                className={`rounded-full px-8 py-3.5 text-[15px] font-bold transition-all duration-200 min-h-[48px] cta-pill ${
                  answers[currentQ?.id]?.trim()
                    ? "bg-cf-blue text-white hover:bg-cf-blue-dark cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span>Next</span>
                <GoldArrow />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── WOW LETTER ───────────────────────────────────────────────────────

  if (phase === "wow") {
    return (
      <div className="min-h-screen bg-cf-warm">
        <IntakeNav />

        <div className="max-w-[720px] mx-auto px-6 pt-10 pb-24 phase-enter">
          <h1 className="font-serif text-[32px] sm:text-[42px] font-bold text-cf-blue mb-2 text-center leading-tight">
            A note from CampFinder
          </h1>
          <p className="text-cf-muted text-[15px] mb-10 text-center">
            We wrote this just for your family.
          </p>

          <div className="premium-card p-8 sm:p-10 mb-10" style={{ background: "#FFFDF7" }}>
            {wowLetter.split("\n").map((p, i) => (
              p.trim() && <p key={i} className="text-[15px] text-cf-text leading-[1.8] mb-4 last:mb-0">{p}</p>
            ))}
          </div>

          <a
            href={`/generate?client_id=${clientId}`}
            className="block w-full bg-cf-gold text-white rounded-full py-4 text-[18px] font-bold text-center transition-all duration-200 min-h-[56px] gentle-pulse cta-pill justify-center hover:brightness-110"
          >
            <span>Show Me My Summer</span>
            <WhiteArrow />
          </a>
        </div>
      </div>
    );
  }

  return null;
}
