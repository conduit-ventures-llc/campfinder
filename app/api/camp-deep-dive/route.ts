import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { camp_name, camp_html, client_id } = body;

    if (!camp_name || !client_id) {
      return NextResponse.json(
        { error: "Missing camp_name or client_id" },
        { status: 400 }
      );
    }

    // Fetch family context
    const supabase = createServerClient();
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .select("intake_answers")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const intake = client.intake_answers as Record<string, unknown>;
    const kids = (intake?.kids || []) as Array<{ name: string; age: number }>;
    const kidsStr = kids.map((k) => `${k.name} (age ${k.age})`).join(", ");

    const familyContext = [
      `Kids: ${kidsStr || "Not specified"}`,
      `ZIP: ${intake?.zip_code || "Not provided"}`,
      `Budget: ${intake?.budget_mentioned || "Not specified"}`,
      `Concerns: ${JSON.stringify(intake?.main_concerns || [])}`,
      `Special needs: ${JSON.stringify(intake?.special_needs || "None mentioned")}`,
    ].join("\n");

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system:
        "You are CampFinder, expanding a specific camp into a complete information profile for a parent making registration decisions. Be warm, practical, specific. Always return valid JSON.",
      prompt: `Research this camp and create a complete parent information profile.

CAMP NAME: ${camp_name}
CAMP HTML FROM PLAN:
${camp_html || "No additional HTML context"}

FAMILY CONTEXT:
${familyContext}

Return a JSON object with exactly this structure (no markdown, no code fences, just raw JSON):
{
  "description": "Full camp description and philosophy (2-3 paragraphs)",
  "ages_schedule": "Age ranges served and a typical daily schedule",
  "kids_love": ["What kids say they love — quote 1", "What kids say they love — quote 2", "What kids say they love — quote 3"],
  "parents_say": ["What parents say about logistics — quote 1", "What parents say about logistics — quote 2", "What parents say about logistics — quote 3"],
  "aca_status": "Accredited / Not Listed / Unknown",
  "aca_link": "https://find.acacamps.org/",
  "financial_aid": "Available / Not listed / Contact camp directly",
  "aid_link": "",
  "registration_steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "registration_email_draft": "Pre-written email text a parent can copy and send to this camp to begin registration. Reference the specific child names and ages from the family context."
}`,
      maxTokens: 4000,
    });

    // Parse the JSON from the response
    let parsed;
    try {
      // Strip potential code fences
      const jsonStr = text.replace(/```json?\s*/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse camp profile", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("[campfinder/camp-deep-dive] Error:", error);
    return NextResponse.json(
      { error: "Deep dive generation failed" },
      { status: 500 }
    );
  }
}
