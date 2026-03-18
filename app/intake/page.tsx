"use client";

import { useState, useRef } from "react";
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
    // Route to must-haves if kids were detected
    if (extracted.kids.length > 0) {
      setPhase("must_haves");
    } else {
      handlePostMustHaves();
    }
  }

  async function handlePostMustHaves() {
    setPhase("life_calendar");
  }

  async function handlePostLifeCalendar() {
    // Get adaptive questions for remaining gaps
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
          must_haves: mustHaves,
          life_calendar: calendarEntries,
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
    open_mic: 10,
    extracting: 25,
    what_i_heard: 35,
    must_haves: 45,
    life_calendar: 55,
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

  // ─── MUST-HAVES PER KID ─────────────────────────────────────────────

  if (phase === "must_haves" && extracted) {
    const kids = extracted.kids;

    return (
      <div className="min-h-screen bg-cf-warm">
        <nav className="bg-cf-blue px-6">
          <div className="max-w-[680px] mx-auto py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[22px]">&#9978;&#65039;</span>
              <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
            </div>
            <span className="text-white/50 text-xs">Step 3 of 7</span>
          </div>
        </nav>
        <div className="max-w-[680px] mx-auto w-full px-6 pt-2">
          <div className="h-1.5 bg-cf-border rounded-full overflow-hidden">
            <div className="h-full bg-cf-gold rounded-full transition-all duration-500" style={{ width: `${progressMap.must_haves}%` }} />
          </div>
        </div>

        <div className="max-w-[680px] mx-auto px-6 pt-8 pb-24 fade-up">
          <h1 className="font-serif text-[24px] sm:text-[28px] font-bold text-cf-blue mb-2">
            Before I suggest anything &mdash;
          </h1>
          <p className="text-cf-muted text-[15px] mb-8">
            Are there camps any of your kids are already committed to or that are non-negotiable?
          </p>

          <div className="space-y-4">
            {kids.map((kid) => (
              <div key={kid.name} className="bg-white border border-cf-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-cf-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-cf-blue">{kid.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-cf-text">{kid.name} ({kid.age})</p>
                    <p className="text-xs text-cf-muted">Lock in non-negotiable camps</p>
                  </div>
                </div>
                <textarea
                  value={mustHaves[kid.name] || ""}
                  onChange={(e) => setMustHaves((prev) => ({ ...prev, [kid.name]: e.target.value }))}
                  placeholder={`e.g., Soccer camp week of June 23, already registered at...`}
                  className="w-full bg-cf-warm border border-cf-border rounded-xl px-4 py-3 text-sm resize-none h-20 focus:border-cf-blue transition"
                />
                {mustHaves[kid.name]?.trim() && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-cf-gold rounded-full" />
                    <span className="text-xs font-bold text-cf-gold">Locked in</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={() => setPhase("what_i_heard")}
              className="flex-1 border-2 border-cf-border text-cf-text rounded-2xl py-3.5 text-[15px] font-bold hover:bg-white transition min-h-[44px]">
              &larr; Back
            </button>
            <button onClick={handlePostMustHaves}
              className="flex-1 bg-cf-gold text-white rounded-2xl py-3.5 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]">
              {Object.values(mustHaves).some((v) => v.trim()) ? "Continue with must-haves" : "Skip \u2014 no must-haves"}
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
        <nav className="bg-cf-blue px-6">
          <div className="max-w-[780px] mx-auto py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-[22px]">&#9978;&#65039;</span>
              <span className="text-white text-xl font-bold font-serif tracking-tight">CampFinder</span>
            </div>
            <span className="text-white/50 text-xs">Step 4 of 7</span>
          </div>
        </nav>
        <div className="max-w-[780px] mx-auto w-full px-6 pt-2">
          <div className="h-1.5 bg-cf-border rounded-full overflow-hidden">
            <div className="h-full bg-cf-gold rounded-full transition-all duration-500" style={{ width: `${progressMap.life_calendar}%` }} />
          </div>
        </div>

        <div className="max-w-[780px] mx-auto px-6 pt-8 pb-24 fade-up">
          <h1 className="font-serif text-[24px] sm:text-[28px] font-bold text-cf-blue mb-2">
            Your summer calendar
          </h1>
          <p className="text-cf-muted text-[15px] mb-6">
            Add recurring commitments so CampFinder only suggests camps that fit your actual schedule.
          </p>

          {/* Summer Grid */}
          <div className="bg-white border border-cf-border rounded-2xl overflow-hidden mb-6">
            <div className="bg-cf-blue text-white px-4 py-3 text-sm font-bold flex items-center justify-between">
              <span>Summer 2026</span>
              <span className="text-xs text-white/60">{calendarEntries.length} commitment{calendarEntries.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-cf-border">
              {SUMMER_WEEKS.map((week) => (
                <div key={week} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-mono text-cf-muted w-28 flex-shrink-0">{week}</span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {calendarEntries
                      .filter((e) => e.days.includes(week.split("\u2013")[0].split(" ")[0]))
                      .map((e, i) => (
                        <span key={i} className="text-[10px] bg-cf-blue-light text-cf-blue px-2 py-0.5 rounded-full font-bold">
                          {e.activity} ({e.kids})
                        </span>
                      ))}
                  </div>
                  <span className="text-[10px] text-cf-muted">{homeZip || "ZIP?"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add commitment */}
          <div className="bg-white border border-cf-border rounded-2xl p-5 mb-6">
            <p className="text-sm font-bold text-cf-text mb-3">Add a recurring commitment</p>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Activity (e.g., swim lessons)"
                className="border border-cf-border rounded-xl px-3 py-2.5 text-sm focus:border-cf-blue transition min-h-[44px]"
                id="cal-activity"
              />
              <input
                placeholder="Days (e.g., Mon/Wed)"
                className="border border-cf-border rounded-xl px-3 py-2.5 text-sm focus:border-cf-blue transition min-h-[44px]"
                id="cal-days"
              />
              <input
                placeholder="Which kid(s)"
                className="border border-cf-border rounded-xl px-3 py-2.5 text-sm focus:border-cf-blue transition min-h-[44px]"
                id="cal-kids"
              />
              <input
                placeholder="Duration (e.g., 1hr)"
                className="border border-cf-border rounded-xl px-3 py-2.5 text-sm focus:border-cf-blue transition min-h-[44px]"
                id="cal-duration"
              />
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
                }
              }}
              className="mt-3 bg-cf-blue text-white rounded-xl px-4 py-2.5 text-sm font-bold hover:opacity-90 transition min-h-[44px]"
            >
              Add Commitment
            </button>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setPhase(extracted?.kids.length ? "must_haves" : "what_i_heard")}
              className="flex-1 border-2 border-cf-border text-cf-text rounded-2xl py-3.5 text-[15px] font-bold hover:bg-white transition min-h-[44px]">
              &larr; Back
            </button>
            <button onClick={handlePostLifeCalendar}
              className="flex-1 bg-cf-gold text-white rounded-2xl py-3.5 text-[15px] font-bold hover:opacity-90 transition min-h-[44px]">
              {calendarEntries.length > 0 ? "Continue with calendar" : "Skip \u2014 no recurring commitments"}
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
