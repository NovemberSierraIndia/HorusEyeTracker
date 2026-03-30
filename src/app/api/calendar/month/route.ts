import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { googleFetch } from "@/lib/google";
import { NextResponse } from "next/server";

const CALENDAR_IDS = [
  "primary",
  "a5878ca75ed9df85cbab83f537bbd1e430bd6d863f7f261135e37e91f0b6f2ba@group.calendar.google.com",
];

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  const now = new Date();
  const year = yearParam ? parseInt(yearParam) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam) : now.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);

  try {
    const allEvents = await Promise.all(
      CALENDAR_IDS.map(async (calId) => {
        try {
          const data = await googleFetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=250`,
            session.accessToken
          );
          return (data.items || []).map((item: any) => ({
            id: item.id,
            title: item.summary || "(No title)",
            start: item.start?.dateTime || item.start?.date,
            end: item.end?.dateTime || item.end?.date,
            calendarId: calId,
          }));
        } catch {
          return [];
        }
      })
    );

    const events = allEvents.flat().sort((a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
