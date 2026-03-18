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
      .from("saved_camps")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[camps/GET] Error:", error);
      return NextResponse.json({ error: "Failed to fetch saved camps" }, { status: 500 });
    }

    return NextResponse.json({ camps: data });
  } catch (err) {
    console.error("[camps/GET] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, camp_name, location, age_range, activity_type, weekly_cost, notes, rating } = body;

    if (!camp_name) {
      return NextResponse.json({ error: "Missing camp_name" }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("saved_camps")
      .insert({
        client_id,
        camp_name,
        location,
        age_range,
        activity_type,
        weekly_cost,
        notes,
        rating,
      })
      .select()
      .single();

    if (error) {
      console.error("[camps/POST] Error:", error);
      return NextResponse.json({ error: "Failed to save camp" }, { status: 500 });
    }

    return NextResponse.json({ camp: data }, { status: 201 });
  } catch (err) {
    console.error("[camps/POST] Error:", err);
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
      .from("saved_camps")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[camps/PUT] Error:", error);
      return NextResponse.json({ error: "Failed to update camp" }, { status: 500 });
    }

    return NextResponse.json({ camp: data });
  } catch (err) {
    console.error("[camps/PUT] Error:", err);
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
      .from("saved_camps")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[camps/DELETE] Error:", error);
      return NextResponse.json({ error: "Failed to delete camp" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[camps/DELETE] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
