"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 56; // px per hour

export function TodaysEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/calendar/today")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (!loading && scrollRef.current) {
      const now = new Date();
      const scrollTo = Math.max(0, (now.getHours() - 1)) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [loading]);

  const formatHour = (h: number) => {
    return `${String(h).padStart(2, "0")}:00`;
  };

  const getEventPosition = (event: CalendarEvent) => {
    if (!event.start.includes("T")) return null; // all-day event
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = Math.max(endMinutes - startMinutes, 30); // min 30 min display
    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = (duration / 60) * HOUR_HEIGHT;
    return { top, height };
  };

  const allDayEvents = events.filter((e) => !e.start.includes("T"));
  const timedEvents = events.filter((e) => e.start.includes("T"));

  // Current time indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_HEIGHT;

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
                  className="inline-flex items-center gap-1.5 bg-brg-light text-brg text-xs font-medium px-3 py-1.5 rounded-lg"
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
            ref={scrollRef}
            className="relative overflow-y-auto overflow-x-hidden rounded-lg border border-border bg-cream/30"
            style={{ maxHeight: HOUR_HEIGHT * 10 }}
          >
            <div className="relative" style={{ height: HOUR_HEIGHT * 24 }}>
              {/* Hour grid lines */}
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute w-full border-t border-border/40 flex"
                  style={{ top: h * HOUR_HEIGHT }}
                >
                  <span className="font-mono text-[11px] text-text-muted w-14 shrink-0 pl-2 -translate-y-1/2 bg-cream/30">
                    {formatHour(h)}
                  </span>
                </div>
              ))}

              {/* Event blocks */}
              {timedEvents.map((event) => {
                const pos = getEventPosition(event);
                if (!pos) return null;
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
                    className="absolute left-16 right-3 bg-brg/10 border-l-3 border-l-brg rounded-r-lg px-3 py-1.5 overflow-hidden"
                    style={{
                      top: pos.top,
                      height: pos.height,
                      borderLeftWidth: "3px",
                      borderLeftColor: "var(--brg)",
                    }}
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {event.title}
                    </p>
                    <p className="font-mono text-[11px] text-text-muted">
                      {startTime} – {endTime}
                    </p>
                  </div>
                );
              })}

              {/* Current time red line */}
              <div
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: currentTimeTop }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-racing-red -ml-1" />
                <div className="flex-1 h-0.5 bg-racing-red" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
