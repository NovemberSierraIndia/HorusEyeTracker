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

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">Today&apos;s Events</h2>
        <Link href="/calendar" className="text-sm text-brg hover:text-brg-hover">
          View all →
        </Link>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-cream rounded-lg animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-text-muted text-sm italic">Clear day.</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 py-2 border-b border-border last:border-0"
            >
              <span className="font-mono text-sm text-brg whitespace-nowrap mt-0.5">
                {formatTime(event.start)}
              </span>
              <span className="text-sm text-text-primary">{event.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
