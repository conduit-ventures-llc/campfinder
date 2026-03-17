import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { campfinderConfig } from "@/config/verticals/campfinder.config";

// POST: determine which questions to ask based on what's already known
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { extracted_data, open_mic_text } = body;

  if (!extracted_data) {
    return NextResponse.json({ error: "Missing extracted_data" }, { status: 400 });
  }

  const fieldsNeeded = extracted_data.fields_still_needed || [];
  const allQuestions = campfinderConfig.questionBank;

  // Filter to questions that map to needed fields, max 7
  const candidates = allQuestions
    .filter((q) => fieldsNeeded.includes(q.id))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 7);

  if (candidates.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  // Personalize the questions based on what the parent already said
  const result = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `The parent told you: "${open_mic_text || "No open mic text"}"

You extracted: ${JSON.stringify(extracted_data)}

Rewrite each question so it feels like it was written specifically for this parent and their situation. Reference what they already told you. Keep the same intent but change every word so it speaks directly to their context.

Return JSON: {"questions": [{"id": "original_id", "label": "personalized question text"}]}
No preamble. JSON only.`,
    prompt: `Personalize these questions:\n${candidates.map((q) => `${q.id}: ${q.label}`).join("\n")}`,
    maxTokens: 800,
  });

  let personalized;
  try {
    let text = result.text.trim();
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) text = fenceMatch[1].trim();
    personalized = JSON.parse(text);
  } catch {
    // Fallback to original questions
    return NextResponse.json({
      questions: candidates.map((q) => ({ id: q.id, label: q.label })),
    });
  }

  return NextResponse.json({ questions: personalized.questions || candidates });
}
