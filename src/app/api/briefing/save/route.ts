import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await getSupabase()
      .from("briefing_entries")
      .insert({
        raw_notes: body.raw_notes,
        title: body.title || null,
        summary: body.summary,
        tags: body.tags || [],
        events_detected: body.events_detected || [],
        events_confirmed: body.events_confirmed || [],
        drafts_detected: body.drafts_detected || [],
        drafts_sent: body.drafts_sent || [],
        source_type: body.source_type || "text",
      })
      .select()
      .single();

    if (error) {
      console.error("[HorusEye] Supabase save error:", error);
      return NextResponse.json(
        { error: "Failed to save entry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ entry: data });
  } catch (error) {
    console.error("[HorusEye] Briefing save error:", error);
    return NextResponse.json(
      { error: "Failed to save entry" },
      { status: 500 }
    );
  }
}
