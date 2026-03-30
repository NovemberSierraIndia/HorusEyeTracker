import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchEventsFromAllCalendars } from "@/lib/google";
import { NextResponse } from "next/server";

// Never cache — must always reflect the current day
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get today's date in Rome timezone (handles CET/CEST automatically)
  const romeToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // e.g. "2026-03-31"

  // RFC 3339 timestamps with Z suffix for Google Calendar API
  const timeMin = `${romeToday}T00:00:00Z`;
  const timeMax = `${romeToday}T23:59:59Z`;

  try {
    const events = await fetchEventsFromAllCalendars(
      session.accessToken,
      timeMin,
      timeMax,
      "Europe/Rome"
    );
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
