import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");

    if (!clientId) {
      return NextResponse.json({ error: "Missing client_id" }, { status: 400 });
    }

    const supabase = createServerClient();

    // 1. Fetch family brief settings
    const { data: settings } = await supabase
      .from("family_brief_settings")
      .select("*")
      .eq("client_id", clientId)
      .single();

    // 2. Fetch active sports (season includes today)
    const today = new Date().toISOString().split("T")[0];
    const { data: activeSports } = await supabase
      .from("family_sports")
      .select("*")
      .eq("client_id", clientId)
      .lte("season_start", today)
      .gte("season_end", today);

    // 3. Fetch events in the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    const { data: upcomingEvents } = await supabase
      .from("family_events")
      .select("*")
      .eq("client_id", clientId)
      .gte("event_date", today)
      .lte("event_date", nextWeekStr)
      .order("event_date", { ascending: true });

    // 4. Fetch client intake answers for kids' names/ages and ZIP
    const { data: client } = await supabase
      .from("clients")
      .select("intake_answers")
      .eq("id", clientId)
      .single();

    const intake = (client?.intake_answers || {}) as Record<string, unknown>;
    const kids = (intake.kids || []) as Array<{ name: string; age: number }>;
    const zipCode = (settings?.zip_code || intake.zip_code || "unknown") as string;
    const faithEnabled = settings?.faith_calendar !== false;

    // 5. Call Claude to generate the morning brief
    const systemPrompt = `You are CampFinder's Family Intelligence. Write a warm, personal morning brief for this family. Use their children's names. Reference their specific activities. Include faith if enabled. Be the most thoughtful calendar anyone has ever seen.

Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "greeting": "Good morning [Family Name] family.",
  "today": ["item1", "item2"],
  "this_week": ["item1", "item2"],
  "faith": "Faith note or null if not enabled",
  "weather_note": "Weather context for activities",
  "one_thing": "The one thing that matters most today"
}`;

    const userPrompt = `Generate today's Family Morning Brief.

Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
ZIP Code: ${zipCode}

Children:
${kids.length > 0 ? kids.map((k) => `- ${k.name}, age ${k.age}`).join("\n") : "No children on file yet"}

Active Sports:
${activeSports && activeSports.length > 0 ? activeSports.map((s) => `- ${s.child_name}: ${s.sport}${s.team ? ` (${s.team})` : ""}${s.practice_schedule ? ` — ${s.practice_schedule}` : ""}`).join("\n") : "No active sports tracked yet"}

Upcoming Events (next 7 days):
${upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents.map((e) => `- ${e.event_date}: ${e.title}${e.child_name ? ` (${e.child_name})` : ""}${e.notes ? ` — ${e.notes}` : ""}`).join("\n") : "No upcoming events"}

Faith calendar enabled: ${faithEnabled ? "Yes — include a faith reflection or upcoming observance" : "No"}

Additional family context:
${intake.main_concerns ? `Concerns: ${JSON.stringify(intake.main_concerns)}` : ""}
${intake.budget_mentioned ? `Budget: ${intake.budget_mentioned}` : ""}`;

    const result = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 2000,
    });

    // 6. Parse and return the brief
    let brief;
    try {
      const text = result.text.trim();
      // Strip markdown code fences if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      brief = JSON.parse(jsonMatch ? jsonMatch[1].trim() : text);
    } catch {
      console.error("[family-brief/GET] Failed to parse Claude response:", result.text);
      return NextResponse.json(
        { error: "Failed to parse morning brief" },
        { status: 500 }
      );
    }

    return NextResponse.json(brief);
  } catch (err) {
    console.error("[family-brief/GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
