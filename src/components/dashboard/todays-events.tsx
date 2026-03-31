"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIMELINE_HEIGHT = 480;
const HOUR_HEIGHT = TIMELINE_HEIGHT / 24; // 20px per hour

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

  const formatHour = (h: number) => String(h).padStart(2, "0");

  const allDayEvents = events.filter((e) => !e.start.includes("T"));
  const timedEvents = events.filter((e) => e.start.includes("T"));

  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = Math.max(endMinutes - startMinutes, 30);
    const top = (startMinutes / (24 * 60)) * TIMELINE_HEIGHT;
    const height = (duration / (24 * 60)) * TIMELINE_HEIGHT;
    return { top, height: Math.max(height, 18) };
  };

  // Current time indicator
  const now = new Date();
  const currentFraction = (now.getHours() * 60 + now.getMinutes()) / (24 * 60);

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">Today&apos;s Schedule</h2>
        <Link href="/calendar" className="text-sm text-brg hover:text-brg-hover">
          View all →
        </Link>
      </div>

      {loading ? (
        <div className="h-64 bg-cream rounded-lg animate-pulse" />
      ) : (
        <>
          {/* All-day events */}
          {allDayEvents.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {allDayEvents.map((event) => (
                <span
                  key={event.id}
                  className="inline-flex items-center gap-1.5 bg-brg-light text-brg text-xs font-medium px-3 py-1.5 rounded-lg border border-brg/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-brg" />
                  {event.title}
                  <span className="text-brg/60 font-mono">All day</span>
                </span>
              ))}
            </div>
          )}

          {/* 24-hour timeline */}
          <div
            className="relative rounded-lg border border-border bg-cream/30"
            style={{ height: TIMELINE_HEIGHT }}
          >
            {/* Hour grid lines + labels */}
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-border/30"
                style={{ top: h * HOUR_HEIGHT }}
              >
                <span className="absolute left-1.5 -top-[7px] font-mono text-[9px] text-text-muted leading-none">
                  {formatHour(h)}
                </span>
              </div>
            ))}

            {/* Event blocks */}
            {timedEvents.map((event) => {
              const pos = getEventStyle(event);
              const startTime = new Date(event.start).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const endTime = new Date(event.end).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <div
                  key={event.id}
                  className="absolute left-10 right-2 rounded-md border border-brg bg-brg/10 overflow-hidden"
                  style={{
                    top: pos.top + 1,
                    height: pos.height - 2,
                  }}
                >
                  <div className="px-2.5 py-1 h-full flex flex-col justify-center">
                    <p className="text-[11px] font-semibold text-brg truncate">
                      {event.title}
                    </p>
                    {pos.height > 22 && (
                      <p className="font-mono text-[9px] text-brg/70">
                        {startTime} – {endTime}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Current time red line */}
            <div
              className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
              style={{ top: `${currentFraction * 100}%` }}
            >
              <div className="w-2 h-2 rounded-full bg-racing-red -ml-0.5" />
              <div className="flex-1 h-px bg-racing-red" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
