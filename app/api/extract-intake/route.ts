import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

// POST: extract structured data from Open Mic input
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { open_mic_text, calendar_data } = body;

  if (!open_mic_text) {
    return NextResponse.json({ error: "Missing open_mic_text" }, { status: 400 });
  }

  const calendarContext = calendar_data
    ? `\n\nCalendar data available:\n${JSON.stringify(calendar_data)}`
    : "";

  const result = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    prompt: `A parent just told you about their summer camp situation. Extract structured data from what they said.

Parent said:
"${open_mic_text}"
${calendarContext}

Return JSON only:
{
  "kids": [{"name": "", "age": 0}],
  "camps_already_decided": ["camp name or empty array"],
  "blocked_weeks": ["dates or descriptions"],
  "main_concerns": ["specific concerns in their words"],
  "whats_solved": ["things already figured out"],
  "whats_not_solved": ["things still need help with"],
  "budget_mentioned": "amount or null",
  "zip_code": "if mentioned or null",
  "allergies_or_needs": ["if mentioned"],
  "last_year_experience": "summary or null",
  "carpool_interest": true/false/null,
  "fields_still_needed": ["list of question bank IDs that weren't answered"]
}

Be thorough. Extract everything. If something wasn't mentioned, use null or empty array.
For fields_still_needed, reference these possible IDs: kids_details, zip_code, budget_per_child, available_weeks, max_drive_time, special_needs, last_year, sibling_dynamics, camp_type_preference, carpool_interest, dropoff_logistics, dealbreakers`,
    maxTokens: 1000,
  });

  let extracted;
  try {
    let text = result.text.trim();
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) text = fenceMatch[1].trim();
    extracted = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "Failed to extract data" }, { status: 500 });
  }

  return NextResponse.json({ extracted });
}
