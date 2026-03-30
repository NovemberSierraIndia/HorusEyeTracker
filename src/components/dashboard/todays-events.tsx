"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

export function TodaysEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calendar/today")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (dateStr: string) => {
    if (!dateStr.includes("T")) return "All day";
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeRange = (start: string, end: string) => {
    if (!start.includes("T")) return "All day";
    const s = formatTime(start);
    const e = formatTime(end);
    return `${s} – ${e}`;
  };

  const isCurrentEvent = (start: string, end: string) => {
    if (!start.includes("T")) return false;
    const now = new Date();
    return new Date(start) <= now && now <= new Date(end);
  };

  const sortedEvents = [...events].sort((a, b) => {
    const aAllDay = !a.start.includes("T");
    const bAllDay = !b.start.includes("T");
    if (aAllDay && !bAllDay) return -1;
    if (!aAllDay && bAllDay) return 1;
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">Today&apos;s Schedule</h2>
        <Link href="/calendar" className="text-sm text-brg hover:text-brg-hover">
          View all →
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-cream rounded-lg animate-pulse" />
          ))}
        </div>
      ) : sortedEvents.length === 0 ? (
        <p className="text-text-muted text-sm italic">No events today — time to focus.</p>
      ) : (
        <div className="space-y-2">
          {sortedEvents.map((event) => {
            const current = isCurrentEvent(event.start, event.end);
            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  current
                    ? "border-racing-red/30 bg-racing-red/5"
                    : "border-transparent bg-cream/50"
                }`}
              >
                {current && (
                  <span className="w-2 h-2 rounded-full bg-racing-red mt-1.5 shrink-0 animate-pulse" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${current ? "font-medium text-text-primary" : "text-text-primary"}`}>
                    {event.title}
                  </p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">
                    {formatTimeRange(event.start, event.end)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
