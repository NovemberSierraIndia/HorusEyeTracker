import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, date, time, description } = await request.json();

    // Build event start/end
    let startDateTime: string;
    let endDateTime: string;
    let isAllDay = false;

    if (date && time) {
      // Specific time — create 1-hour event
      startDateTime = `${date}T${time}:00`;
      const end = new Date(`${date}T${time}:00`);
      end.setHours(end.getHours() + 1);
      endDateTime = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}T${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}:00`;
    } else if (date) {
      // All-day event
      isAllDay = true;
      startDateTime = date;
      const nextDay = new Date(`${date}T00:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      endDateTime = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;
    } else {
      return NextResponse.json(
        { error: "Date is required to create an event" },
        { status: 400 }
      );
    }

    const event: Record<string, unknown> = {
      summary: title,
      description: description || "",
    };

    if (isAllDay) {
      event.start = { date: startDateTime };
      event.end = { date: endDateTime };
    } else {
      event.start = { dateTime: startDateTime, timeZone: "Europe/Rome" };
      event.end = { dateTime: endDateTime, timeZone: "Europe/Rome" };
    }

    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("[HorusEye] Calendar create error:", errBody);
      return NextResponse.json(
        { error: "Failed to create calendar event" },
        { status: 500 }
      );
    }

    const created = await res.json();
    return NextResponse.json({ event: created });
  } catch (error) {
    console.error("[HorusEye] Calendar create error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
