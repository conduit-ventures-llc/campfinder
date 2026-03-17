"use client";

import { useState, useRef } from "react";
import { campfinderConfig } from "@/config/verticals/campfinder.config";

type Phase = "open_mic" | "extracting" | "what_i_heard" | "adaptive" | "submitting" | "wow";

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

  // Voice recording
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

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
      setTimeout(() => { if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.stop(); setRecording(false); } }, 90000);
    } catch { setError("Couldn\u2019t access your microphone. Check browser permissions."); }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") { mediaRecorderRef.current.stop(); setRecording(false); }
  }

  function toggleChip(label: string) {
    setActiveChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
    // Add chip label as prompt to text
    if (!activeChips.includes(label)) {
      setOpenMicText((prev) => (prev ? prev + "\n" + label + ": " : label + ": "));
    }
  }

  async function handleOpenMicSubmit() {
    if (!openMicText.trim()) return;
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
      setError("We had trouble understanding that. Try adding more detail.");
      setPhase("open_mic");
    }
  }

  async function handleConfirmExtraction() {
    if (!extracted) return;
    // Get adaptive questions
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
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          open_mic_text: openMicText,
          extracted_data: extracted,
          adaptive_answers: answers,
          audio_url: audioUrl,
        }),
      });
      if (!res.ok) throw new Error("Intake failed");
      const data = await res.json();
      setClientId(data.client_id);
      setWowLetter(data.wow_letter);
      setPhase("wow");
    } catch {
      setError("We hit a snag saving your information. Try again.");
      setPhase("adaptive");
    }
  }

  // Progress percentages by phase
  const progressMap: Record<Phase, number> = {
    open_mic: 15,
    extracting: 35,
    what_i_heard: 50,
    adaptive: 70,
    submitting: 90,
    wow: 100,
  };

  // ─── OPEN MIC ─────────────────────────────────────────────────────────

  if (phase === "open_mic") {
    return (
      <div className="min-h-screen bg-cf-warm">
        <nav className="bg-cf-blue px-6">
          <div className="max-w-[680px] mx-auto py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[22px]">&#9978;&#65039;</span>
              <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
            </div>
            <span className="text-white/50 text-xs">Step 1 of 5</span>
          </div>
        </nav>
        {/* Progress bar */}
        <div className="max-w-[680px] mx-auto w-full px-6 pt-2">
          <div className="h-1.5 bg-cf-border rounded-full overflow-hidden">
            <div className="h-full bg-cf-gold rounded-full transition-all duration-500" style={{ width: `${progressMap.open_mic}%` }} />
          </div>
        </div>

        <div className="max-w-[680px] mx-auto px-6 pt-8 pb-24 fade-up">
          <h1 className="font-serif text-[28px] sm:text-[36px] font-bold text-cf-blue leading-snug mb-3">
            Tell me about your summer camp situation.
          </h1>
          <p className="text-cf-muted text-[15px] mb-8">
            Just talk &mdash; or tap what&apos;s relevant to you.
          </p>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {campfinderConfig.openMicChips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => toggleChip(chip.label)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium border transition min-h-[44px] ${
                  activeChips.includes(chip.label)
                    ? "bg-cf-blue text-white border-cf-blue"
                    : "bg-white text-cf-text border-cf-border hover:border-cf-blue/30"
                }`}
              >
                {chip.emoji} {chip.label}
              </button>
            ))}
          </div>

          {/* Voice capture */}
          <div className="flex justify-center mb-4">
            {transcribing ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-cf-gold/30 border-t-cf-gold rounded-full spin-slow" />
                <span className="text-sm text-cf-muted">Listening to what you said...</span>
              </div>
            ) : recording ? (
              <button onClick={stopRecording} className="flex items-center gap-3 bg-red-50 border-2 border-red-300 rounded-2xl px-6 py-3.5 min-h-[44px] hover:bg-red-100 transition">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-bold text-red-700">Recording... tap to stop</span>
              </button>
            ) : (
              <button onClick={startRecording} className="flex items-center gap-3 bg-cf-gold/10 border-2 border-cf-gold/30 rounded-2xl px-6 py-3.5 min-h-[44px] hover:bg-cf-gold/20 transition">
                <span className="text-2xl">&#127908;</span>
                <span className="text-sm font-bold text-cf-blue">At a fire pit? Just talk.</span>
              </button>
            )}
          </div>

          {audioUrl && !recording && !transcribing && (
            <div className="flex justify-center mb-4 fade-in">
              <audio src={audioUrl} controls className="h-8" />
            </div>
          )}

          {/* Text area */}
          <textarea
            value={openMicText}
            onChange={(e) => setOpenMicText(e.target.value)}
            placeholder="My kids are... This summer I need... The thing driving me crazy is..."
            className="w-full bg-white border-2 border-cf-border rounded-2xl px-6 py-5 text-[17px] resize-none h-40 focus:border-cf-blue transition placeholder:text-cf-muted/50 mb-4"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-4">
              <p className="text-[15px] text-red-800 font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleOpenMicSubmit}
            disabled={!openMicText.trim() || transcribing}
            className={`w-full rounded-2xl py-4 text-[17px] font-bold transition min-h-[44px] ${
              openMicText.trim() && !transcribing
                ? "bg-cf-gold text-white hover:opacity-90 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Show me what you heard
          </button>
        </div>
      </div>
    );
  }

  // ─── EXTRACTING ───────────────────────────────────────────────────────

  if (phase === "extracting" || phase === "submitting") {
    return (
      <div className="min-h-screen bg-cf-warm flex items-center justify-center px-6">
        <div className="text-center fade-up">
          <div className="w-10 h-10 border-2 border-cf-blue/30 border-t-cf-blue rounded-full spin-slow mx-auto mb-6" />
          <h2 className="font-serif text-2xl font-bold text-cf-blue mb-3">
            {phase === "extracting" ? "Reading what you told me..." : "Building your CampFinder..."}
          </h2>
          <p className="text-cf-muted text-[15px] max-w-[360px] mx-auto">
            {phase === "extracting"
              ? "CampFinder is extracting every detail so you don\u2019t have to repeat yourself."
              : "Setting up your profile, generating your welcome letter, and preparing your first Summer Map."}
          </p>
        </div>
      </div>
    );
  }

  // ─── WHAT I HEARD ─────────────────────────────────────────────────────

  if (phase === "what_i_heard" && extracted) {
    return (
      <div className="min-h-screen bg-cf-warm">
        <nav className="bg-cf-blue px-6">
          <div className="max-w-[680px] mx-auto py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[22px]">&#9978;&#65039;</span>
              <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
            </div>
            <span className="text-white/50 text-xs">Step 2 of 5</span>
          </div>
        </nav>
        <div className="max-w-[680px] mx-auto w-full px-6 pt-2">
          <div className="h-1.5 bg-cf-border rounded-full overflow-hidden">
            <div className="h-full bg-cf-gold rounded-full transition-all duration-500" style={{ width: `${progressMap.what_i_heard}%` }} />
          </div>
        </div>

        <div className="max-w-[680px] mx-auto px-6 pt-8 pb-24 fade-up">
          <h1 className="font-serif text-[28px] font-bold text-cf-blue mb-2">Here&apos;s what I heard.</h1>
          <p className="text-cf-muted text-[15px] mb-8">Confirm this is right, or add what I missed.</p>

          <div className="space-y-4">
            {/* Kids */}
            {extracted.kids.length > 0 && (
              <div className="bg-white border border-cf-border rounded-xl p-5">
                <p className="text-xs font-bold text-cf-muted uppercase tracking-wide mb-2">Kids</p>
                <div className="flex flex-wrap gap-2">
                  {extracted.kids.map((k, i) => (
                    <span key={i} className="bg-cf-blue-light text-cf-blue text-sm font-bold px-3 py-1.5 rounded-full">
                      {k.name} ({k.age})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Concerns */}
            {extracted.main_concerns.length > 0 && (
              <div className="bg-white border border-cf-border rounded-xl p-5">
                <p className="text-xs font-bold text-cf-muted uppercase tracking-wide mb-2">Main concerns</p>
                {extracted.main_concerns.map((c, i) => (
                  <p key={i} className="text-sm text-cf-text mb-1">&bull; {c}</p>
                ))}
              </div>
            )}

            {/* What's solved */}
            {extracted.whats_solved.length > 0 && (
              <div className="bg-cf-green-light border border-cf-green/20 rounded-xl p-5">
                <p className="text-xs font-bold text-cf-green uppercase tracking-wide mb-2">Already figured out</p>
                {extracted.whats_solved.map((s, i) => (
                  <p key={i} className="text-sm text-cf-text mb-1">&bull; {s}</p>
                ))}
              </div>
            )}

            {/* What's not solved */}
            {extracted.whats_not_solved.length > 0 && (
              <div className="bg-cf-gold/5 border border-cf-gold/20 rounded-xl p-5">
                <p className="text-xs font-bold text-cf-gold uppercase tracking-wide mb-2">Still need help with</p>
                {extracted.whats_not_solved.map((s, i) => (
                  <p key={i} className="text-sm text-cf-text mb-1">&bull; {s}</p>
                ))}
              </div>
            )}

            {/* Budget + ZIP */}
            <div className="grid grid-cols-2 gap-3">
              {extracted.budget_mentioned && (
                <div className="bg-white border border-cf-border rounded-xl p-4">
                  <p className="text-xs font-bold text-cf-muted uppercase mb-1">Budget</p>
                  <p className="text-sm font-bold text-cf-text">{extracted.budget_mentioned}</p>
                </div>
              )}
              {extracted.zip_code && (
                <div className="bg-white border border-cf-border rounded-xl p-4">
                  <p className="text-xs font-bold text-cf-muted uppercase mb-1">ZIP Code</p>
                  <p className="text-sm font-bold text-cf-text">{extracted.zip_code}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => setPhase("open_mic")}
              className="flex-1 border-2 border-cf-border text-cf-text rounded-2xl py-3.5 text-[15px] font-bold hover:bg-white transition min-h-[44px]"
            >
              Let me add something
            </button>
            <button
              onClick={handleConfirmExtraction}
              className="flex-1 bg-cf-gold text-white rounded-2xl py-3.5 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]"
            >
              That&apos;s right
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── ADAPTIVE QUESTIONS ───────────────────────────────────────────────

  if (phase === "adaptive") {
    const allAnswered = questions.every((q) => answers[q.id]?.trim());

    return (
      <div className="min-h-screen bg-cf-warm">
        <nav className="bg-cf-blue px-6">
          <div className="max-w-[680px] mx-auto py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[22px]">&#9978;&#65039;</span>
              <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
            </div>
            <span className="text-white/50 text-xs">Step 3 of 5 &middot; {questions.length} question{questions.length !== 1 ? "s" : ""}</span>
          </div>
        </nav>
        <div className="max-w-[680px] mx-auto w-full px-6 pt-2">
          <div className="h-1.5 bg-cf-border rounded-full overflow-hidden">
            <div className="h-full bg-cf-gold rounded-full transition-all duration-500" style={{ width: `${progressMap.adaptive}%` }} />
          </div>
        </div>

        <div className="max-w-[680px] mx-auto px-6 pt-8 pb-24 fade-up">
          <h1 className="font-serif text-[24px] font-bold text-cf-blue mb-2">Just a few more things.</h1>
          <p className="text-cf-muted text-[15px] mb-8">I only ask what you haven&apos;t already told me.</p>

          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.id}>
                <label className="block text-[15px] font-bold text-cf-text mb-2">{q.label}</label>
                <textarea
                  value={answers[q.id] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                  className="w-full bg-white border border-cf-border rounded-xl px-4 py-3 text-sm resize-none h-20 focus:border-cf-blue transition"
                  placeholder="Type your answer..."
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmitIntake}
            disabled={!allAnswered}
            className={`w-full mt-8 rounded-2xl py-4 text-[17px] font-bold transition min-h-[44px] ${
              allAnswered
                ? "bg-cf-gold text-white hover:opacity-90 cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Show me my Summer Map
          </button>
        </div>
      </div>
    );
  }

  // ─── WOW LETTER ───────────────────────────────────────────────────────

  if (phase === "wow") {
    return (
      <div className="min-h-screen bg-cf-warm">
        <nav className="bg-cf-blue px-6">
          <div className="max-w-[680px] mx-auto py-4 flex items-center gap-2.5">
            <span className="text-[22px]">&#9978;&#65039;</span>
            <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
          </div>
        </nav>

        <div className="max-w-[680px] mx-auto px-6 pt-10 pb-24 fade-up">
          <h1 className="font-serif text-[28px] font-bold text-cf-blue mb-8 text-center">
            A note from CampFinder
          </h1>

          <div className="bg-white border border-cf-border rounded-2xl p-6 sm:p-8 mb-8">
            {wowLetter.split("\n").map((p, i) => (
              p.trim() && <p key={i} className="text-[15px] text-cf-text leading-relaxed mb-4">{p}</p>
            ))}
          </div>

          <a
            href={`/generate?client_id=${clientId}`}
            className="block w-full bg-cf-gold text-white rounded-2xl py-4 text-[18px] font-bold text-center hover:opacity-90 transition min-h-[44px]"
          >
            Show me the full plan &rarr;
          </a>
        </div>
      </div>
    );
  }

  return null;
}
