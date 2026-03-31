"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

const START_HOUR = 5;
const END_HOUR = 24;
const VISIBLE_HOURS = END_HOUR - START_HOUR; // 19 hours
const TIMELINE_HEIGHT = 520;
const HOUR_HEIGHT = TIMELINE_HEIGHT / VISIBLE_HOURS;

function getWorkloadLevel(eventCount: number): {
  label: string;
  color: string;
  bg: string;
  width: number;
} {
  if (eventCount === 0) return { label: "Free day", color: "text-brg", bg: "bg-brg", width: 0 };
  if (eventCount <= 2) return { label: "Light", color: "text-brg", bg: "bg-brg", width: 25 };
  if (eventCount <= 4) return { label: "Moderate", color: "text-[#B7950B]", bg: "bg-[#B7950B]", width: 50 };
  if (eventCount <= 6) return { label: "Busy", color: "text-[#D35400]", bg: "bg-[#D35400]", width: 75 };
  return { label: "Packed", color: "text-racing-red", bg: "bg-racing-red", width: 100 };
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

  const formatHour = (h: number) => String(h).padStart(2, "0");

  const allDayEvents = events.filter((e) => !e.start.includes("T"));
  const timedEvents = events.filter((e) => e.start.includes("T"));
  const totalEvents = events.length;
  const workload = getWorkloadLevel(totalEvents);

  const getEventStyle = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const duration = Math.max(endMinutes - startMinutes, 30);

    const offsetMinutes = START_HOUR * 60;
    const totalMinutes = VISIBLE_HOURS * 60;

    const top = ((startMinutes - offsetMinutes) / totalMinutes) * TIMELINE_HEIGHT;
    const height = (duration / totalMinutes) * TIMELINE_HEIGHT;
    return { top: Math.max(top, 0), height: Math.max(height, 22) };
  };

  // Current time indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const offsetMinutes = START_HOUR * 60;
  const currentTop = ((currentMinutes - offsetMinutes) / (VISIBLE_HOURS * 60)) * TIMELINE_HEIGHT;
  const showCurrentLine = currentMinutes >= offsetMinutes && currentMinutes <= END_HOUR * 60;

  const visibleHours = Array.from({ length: VISIBLE_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">Today&apos;s Schedule</h2>

        {/* Workload Meter */}
        {!loading && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-muted uppercase tracking-wide">Workload</span>
              <div className="w-24 h-2 bg-cream rounded-full overflow-hidden border border-border/50">
                <div
                  className={`h-full rounded-full transition-all ${workload.bg}`}
                  style={{ width: `${workload.width}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${workload.color}`}>
                {workload.label}
              </span>
            </div>
            <span className="text-[10px] text-text-muted font-mono">
              {totalEvents} event{totalEvents !== 1 ? "s" : ""}
            </span>
          </div>
        )}

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

          {/* Timeline: 05:00 – 00:00 */}
          <div
            className="relative rounded-lg border border-border bg-cream/30"
            style={{ height: TIMELINE_HEIGHT }}
          >
            {/* Hour grid lines + labels */}
            {visibleHours.map((h, i) => (
              <div
                key={h}
                className="absolute left-0 right-0 border-t border-border/30"
                style={{ top: i * HOUR_HEIGHT }}
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
                    {pos.height > 26 && (
                      <p className="font-mono text-[9px] text-brg/70">
                        {startTime} – {endTime}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Current time red line */}
            {showCurrentLine && (
              <div
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: currentTop }}
              >
                <div className="w-2 h-2 rounded-full bg-racing-red -ml-0.5" />
                <div className="flex-1 h-px bg-racing-red" />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
