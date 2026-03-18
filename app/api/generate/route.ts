import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createServerClient } from "@/lib/supabase/server";
import { campfinderConfig } from "@/config/verticals/campfinder.config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, output_type, refine_instruction } = body;

    if (!client_id || !output_type) {
      return NextResponse.json({ error: "Missing client_id or output_type" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("system_prompt, intake_answers, generations_used, trial_limit, status, is_test_user")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Billing gate
    if (!client.is_test_user && client.generations_used >= client.trial_limit) {
      return NextResponse.json({ error: "trial_exhausted" }, { status: 402 });
    }

    const intake = client.intake_answers as Record<string, unknown>;
    const kids = (intake?.kids || []) as Array<{ name: string; age: number }>;
    const kidsStr = kids.map((k) => `${k.name} (age ${k.age})`).join(", ");

    let userPrompt = "";

    if (output_type === "The Five Options") {
      userPrompt = campfinderConfig.fiveOptionsPrompt + `\n\nFamily: ${kidsStr}\nBudget: ${intake.budget_mentioned || "Not specified"}\nZIP: ${intake.zip_code || "Not provided"}\nConcerns: ${JSON.stringify(intake.main_concerns || [])}`;
    } else {
      userPrompt = `Generate a ${output_type} for this family.\n\nKids: ${kidsStr}\nBudget: ${intake.budget_mentioned || "Not specified"}\nZIP: ${intake.zip_code || "Not provided"}\nConcerns: ${JSON.stringify(intake.main_concerns || [])}\nWhat's not solved: ${JSON.stringify(intake.whats_not_solved || [])}\n\nOutput as clean HTML. Reference each child by name. Show drive times in minutes. Show real costs.`;
    }

    // Smart Refine: prepend refinement instruction if provided
    if (refine_instruction) {
      userPrompt = `REFINEMENT REQUEST: ${refine_instruction}\n\nPlease regenerate the plan with this refinement applied. Keep the same format and level of detail.\n\n${userPrompt}`;
    }

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: client.system_prompt || "You are CampFinder, a summer camp planning assistant.",
      prompt: userPrompt,
      maxTokens: 8000,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[campfinder/generate] Error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
