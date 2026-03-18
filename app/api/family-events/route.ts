import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("client_id");
    const days = parseInt(searchParams.get("days") || "7", 10);

    if (!clientId) {
      return NextResponse.json({ error: "Missing client_id" }, { status: 400 });
    }

    const supabase = createServerClient();

    const today = new Date().toISOString().split("T")[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("family_events")
      .select("*")
      .eq("client_id", clientId)
      .gte("event_date", today)
      .lte("event_date", futureDateStr)
      .order("event_date", { ascending: true });

    if (error) {
      console.error("[family-events/GET] Error:", error);
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }

    return NextResponse.json({ events: data });
  } catch (err) {
    console.error("[family-events/GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, title, event_date, child_name, category, notes } = body;

    if (!client_id || !title || !event_date) {
      return NextResponse.json({ error: "Missing required fields: client_id, title, event_date" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("family_events")
      .insert({
        client_id,
        title,
        event_date,
        child_name,
        category,
        notes,
      })
      .select()
      .single();

    if (error) {
      console.error("[family-events/POST] Error:", error);
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (err) {
    console.error("[family-events/POST] Error:", err);
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
      .from("family_events")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[family-events/PUT] Error:", error);
      return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }

    return NextResponse.json({ event: data });
  } catch (err) {
    console.error("[family-events/PUT] Error:", err);
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
      .from("family_events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[family-events/DELETE] Error:", error);
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[family-events/DELETE] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
