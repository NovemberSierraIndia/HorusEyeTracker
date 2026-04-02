import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";

    let query = getSupabase()
      .from("briefing_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (search) {
      query = query.or(
        `raw_notes.ilike.%${search}%,summary.ilike.%${search}%`
      );
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[HorusEye] Supabase history error:", error);
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: 500 }
      );
    }

    return NextResponse.json({ entries: data || [] });
  } catch (error) {
    console.error("[HorusEye] Briefing history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
