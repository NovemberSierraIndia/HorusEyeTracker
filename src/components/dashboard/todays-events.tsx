"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  getEventImportance,
  setEventImportance,
  getImportanceOption,
  getTotalWorkloadPoints,
  IMPORTANCE_OPTIONS,
  ImportanceLevel,
} from "@/lib/workload";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

const START_HOUR = 5;
const END_HOUR = 24;
const VISIBLE_HOURS = END_HOUR - START_HOUR;
const TIMELINE_HEIGHT = 660;
const HOUR_HEIGHT = TIMELINE_HEIGHT / VISIBLE_HOURS;

function getWorkloadDisplay(points: number) {
  if (points === 0) return { label: "Free day", color: "text-brg", bg: "bg-brg" };
  if (points <= 25) return { label: "Light", color: "text-brg", bg: "bg-brg" };
  if (points <= 50) return { label: "Moderate", color: "text-[#B7950B]", bg: "bg-[#B7950B]" };
  if (points <= 75) return { label: "Busy", color: "text-[#D35400]", bg: "bg-[#D35400]" };
  return { label: "Intense", color: "text-racing-red", bg: "bg-racing-red" };
}

export function TodaysEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [workloadPoints, setWorkloadPoints] = useState(0);

  useEffect(() => {
    fetch("/api/calendar/today")
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const recalcWorkload = useCallback(() => {
    const names = events.map((e) => e.title);
    setWorkloadPoints(getTotalWorkloadPoints(names));
  }, [events]);

  useEffect(() => {
    if (events.length > 0) recalcWorkload();
  }, [events, recalcWorkload]);

  const handleSetImportance = (eventTitle: string, level: ImportanceLevel) => {
    setEventImportance(eventTitle, level);
    recalcWorkload();
    setSelectedEventId(null);
  };

  const formatHour = (h: number) => String(h).padStart(2, "0");

  const allDayEvents = events.filter((e) => !e.start.includes("T"));
  const timedEvents = events.filter((e) => e.start.includes("T"));

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
    return { top: Math.max(top, 0), height: Math.max(height, 26) };
  };

  // Current time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const offsetMinutes = START_HOUR * 60;
  const currentTop = ((currentMinutes - offsetMinutes) / (VISIBLE_HOURS * 60)) * TIMELINE_HEIGHT;
  const showCurrentLine = currentMinutes >= offsetMinutes && currentMinutes <= END_HOUR * 60;

  const visibleHours = Array.from({ length: VISIBLE_HOURS }, (_, i) => START_HOUR + i);

  const workload = getWorkloadDisplay(workloadPoints);
  const meterPercent = Math.min(workloadPoints, 100);

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium text-text-primary">Today&apos;s Schedule</h2>
        <Link href="/calendar" className="text-sm text-brg hover:text-brg-hover">
          View all →
        </Link>
      </div>

      {/* Workload Meter */}
      {!loading && (
        <div className="mb-4 p-3 bg-cream rounded-lg border border-border/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              Workload Meter
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${workload.color}`}>
                {workload.label}
              </span>
              <span className="font-mono text-xs text-text-muted">
                {workloadPoints}/100 pts
              </span>
            </div>
          </div>
          <div className="w-full h-3 bg-cream-light rounded-full overflow-hidden border border-border/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${workload.bg}`}
              style={{ width: `${meterPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted mt-1">
            Click on events to set importance and adjust your workload score
          </p>
        </div>
      )}

      {loading ? (
        <div className="h-64 bg-cream rounded-lg animate-pulse" />
      ) : (
        <>
          {/* All-day events */}
          {allDayEvents.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {allDayEvents.map((event) => {
                const importance = getEventImportance(event.title);
                const option = getImportanceOption(importance);
                const isSelected = selectedEventId === event.id;
                return (
                  <div key={event.id} className="relative">
                    <button
                      onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                      className="inline-flex items-center gap-1.5 bg-brg-light text-brg text-xs font-medium px-3 py-1.5 rounded-lg border border-brg/20 hover:border-brg/40 transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      {event.title}
                      <span className="text-brg/60 font-mono">All day</span>
                      {option.points > 0 && (
                        <span className="font-mono text-[10px] ml-1" style={{ color: option.color }}>
                          {option.points}pts
                        </span>
                      )}
                    </button>
                    {isSelected && (
                      <ImportancePopover
                        currentLevel={importance}
                        onSelect={(level) => handleSetImportance(event.title, level)}
                        onClose={() => setSelectedEventId(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Timeline */}
          <div
            className="relative rounded-lg border border-border bg-cream/30"
            style={{ height: TIMELINE_HEIGHT }}
          >
            {/* Hour grid */}
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

            {/* Events */}
            {timedEvents.map((event) => {
              const pos = getEventStyle(event);
              const importance = getEventImportance(event.title);
              const option = getImportanceOption(importance);
              const isSelected = selectedEventId === event.id;
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
                  className="absolute left-10 right-2"
                  style={{ top: pos.top + 1, height: pos.height - 2 }}
                >
                  <button
                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                    className="w-full h-full text-left rounded-md border border-brg bg-brg/10 overflow-hidden hover:bg-brg/15 transition-colors"
                    style={{
                      borderLeftWidth: "3px",
                      borderLeftColor: option.color,
                    }}
                  >
                    <div className="px-2.5 py-1 h-full flex flex-col justify-center">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-brg truncate flex-1">
                          {event.title}
                        </p>
                        {option.points > 0 && (
                          <span
                            className="font-mono text-[10px] shrink-0 px-1 py-0.5 rounded"
                            style={{ color: option.color, backgroundColor: `${option.color}15` }}
                          >
                            {option.points}pts
                          </span>
                        )}
                      </div>
                      {pos.height > 30 && (
                        <p className="font-mono text-[10px] text-brg/70">
                          {startTime} – {endTime}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Importance popover */}
                  {isSelected && (
                    <ImportancePopover
                      currentLevel={importance}
                      onSelect={(level) => handleSetImportance(event.title, level)}
                      onClose={() => setSelectedEventId(null)}
                    />
                  )}
                </div>
              );
            })}

            {/* Current time line */}
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

// Popover for choosing importance
function ImportancePopover({
  currentLevel,
  onSelect,
  onClose,
}: {
  currentLevel: ImportanceLevel;
  onSelect: (level: ImportanceLevel) => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-20" onClick={onClose} />
      {/* Popover */}
      <div className="absolute left-0 top-full mt-1 z-30 bg-cream-light border border-border rounded-lg shadow-lg p-1 min-w-[200px]">
        <p className="text-[10px] text-text-muted uppercase tracking-wide px-2 py-1">
          Set Importance
        </p>
        {IMPORTANCE_OPTIONS.map((opt) => (
          <button
            key={opt.level}
            onClick={() => onSelect(opt.level)}
            className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-cream transition-colors ${
              currentLevel === opt.level ? "bg-cream font-medium" : ""
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: opt.color }}
            />
            <span className="flex-1 text-text-primary">{opt.label}</span>
            <span className="font-mono text-[10px] text-text-muted">
              {opt.points}pts
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
