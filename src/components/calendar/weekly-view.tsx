"use client";

import { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

export function WeeklyView() {
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar/week?startDate=${weekStart.toISOString().split("T")[0]}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [weekStart]);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const today = new Date().toISOString().split("T")[0];

  const navigateWeek = (direction: number) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setWeekStart(newStart);
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => {
      const eventDate = (e.start || "").split("T")[0];
      return eventDate === dateStr;
    });
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr.includes("T")) return "All day";
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const monthYear = weekStart.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">Calendar</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-text-secondary">{monthYear}</span>
          <div className="flex gap-1">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
            >
              ←
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-48 bg-cream rounded-lg animate-pulse" />
      ) : (
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {days.map((day) => {
            const dateStr = day.toISOString().split("T")[0];
            const isToday = dateStr === today;
            const dayEvents = getEventsForDay(day);
            return (
              <div
                key={dateStr}
                className={`bg-cream-light p-3 min-h-[140px] ${
                  isToday ? "ring-2 ring-inset ring-racing-red" : ""
                }`}
              >
                <div className="text-center mb-2">
                  <p className="text-xs text-text-muted uppercase">
                    {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  </p>
                  <p
                    className={`font-mono text-sm font-medium ${
                      isToday ? "text-racing-red" : "text-text-primary"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                </div>
                <div className="space-y-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="bg-brg-light text-brg text-[11px] px-1.5 py-1 rounded truncate"
                    >
                      <span className="font-mono">{formatTime(event.start)}</span>{" "}
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
