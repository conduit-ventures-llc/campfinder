import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");

    if (!clientId) {
      return NextResponse.json({ error: "Missing client_id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("family_sports")
      .select("*")
      .eq("client_id", clientId)
      .order("season_start", { ascending: true });

    if (error) {
      console.error("[family-sports/GET] Error:", error);
      return NextResponse.json({ error: "Failed to fetch sports" }, { status: 500 });
    }

    return NextResponse.json({ sports: data });
  } catch (err) {
    console.error("[family-sports/GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, child_name, sport, team, coach, practice_schedule, season_start, season_end, notes } = body;

    if (!client_id || !child_name || !sport) {
      return NextResponse.json({ error: "Missing required fields: client_id, child_name, sport" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("family_sports")
      .insert({
        client_id,
        child_name,
        sport,
        team,
        coach,
        practice_schedule,
        season_start,
        season_end,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error("[family-sports/POST] Error:", error);
      return NextResponse.json({ error: "Failed to create sport entry" }, { status: 500 });
    }

    return NextResponse.json({ sport: data }, { status: 201 });
  } catch (err) {
    console.error("[family-sports/POST] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("family_sports")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[family-sports/PUT] Error:", error);
      return NextResponse.json({ error: "Failed to update sport entry" }, { status: 500 });
    }

    return NextResponse.json({ sport: data });
  } catch (err) {
    console.error("[family-sports/PUT] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from("family_sports")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[family-sports/DELETE] Error:", error);
      return NextResponse.json({ error: "Failed to delete sport entry" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[family-sports/DELETE] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
