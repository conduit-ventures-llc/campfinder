import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { campfinderConfig } from "@/config/verticals/campfinder.config";

// POST: save intake and generate Wow Letter + system prompt
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { open_mic_text, extracted_data, adaptive_answers, audio_url } = body;

  if (!extracted_data) {
    return NextResponse.json({ error: "Missing extracted_data" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Merge all answers
  const intakeAnswers = {
    open_mic_text,
    audio_url: audio_url || null,
    ...extracted_data,
    ...adaptive_answers,
  };

  // Create client
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert({
      product_id: "campfinder",
      intake_answers: intakeAnswers,
      status: "trial",
      is_test_user: true,
    })
    .select("id")
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: clientError?.message || "Failed to create client" }, { status: 500 });
  }

  // Generate system prompt
  const kids = extracted_data.kids || [];
  const kidsStr = kids.map((k: { name: string; age: number }) => `${k.name} (age ${k.age})`).join(", ");

  const systemPrompt = `You are CampFinder, a personalized summer camp planning assistant.

This family has ${kids.length} kid${kids.length !== 1 ? "s" : ""}: ${kidsStr}.
ZIP code: ${extracted_data.zip_code || "Not provided"}
Budget: ${extracted_data.budget_mentioned || "Not specified"}
Main concerns: ${(extracted_data.main_concerns || []).join("; ")}
What's solved: ${(extracted_data.whats_solved || []).join("; ")}
What's not solved: ${(extracted_data.whats_not_solved || []).join("; ")}
Allergies/needs: ${(extracted_data.allergies_or_needs || []).join("; ") || "None mentioned"}
Last year: ${extracted_data.last_year_experience || "Not discussed"}
Carpool interest: ${extracted_data.carpool_interest ?? "Not asked"}

Always reference the specific kids by name. Always show drive time in minutes.
Always calculate true cost (fees + deposits + discounts).
Never suggest a camp that violates their constraints.`;

  await supabase
    .from("clients")
    .update({ system_prompt: systemPrompt, system_prompt_version: 1 })
    .eq("id", client.id);

  // Generate Wow Letter
  const wowResult = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: campfinderConfig.wowLetterPrompt,
    prompt: `Parent's open mic: "${open_mic_text || ""}"\n\nExtracted data: ${JSON.stringify(extracted_data)}\n\nAdaptive answers: ${JSON.stringify(adaptive_answers || {})}`,
    maxTokens: 1500,
  });

  return NextResponse.json({
    client_id: client.id,
    wow_letter: wowResult.text,
  });
}
