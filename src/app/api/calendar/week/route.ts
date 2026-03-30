import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchEventsFromAllCalendars } from "@/lib/google";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  if (!startDate) {
    return NextResponse.json({ error: "startDate required" }, { status: 400 });
  }

  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  try {
    const events = await fetchEventsFromAllCalendars(
      session.accessToken,
      start.toISOString(),
      end.toISOString()
    );
    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
