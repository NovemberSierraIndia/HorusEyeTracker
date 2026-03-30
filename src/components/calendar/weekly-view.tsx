"use client";

import { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

type ViewMode = "week" | "month";

export function WeeklyView() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (viewMode === "week") {
      fetch(`/api/calendar/week?startDate=${weekStart.toISOString().split("T")[0]}`)
        .then((r) => r.json())
        .then((d) => setEvents(d.events || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      fetch(`/api/calendar/month?year=${year}&month=${month}`)
        .then((r) => r.json())
        .then((d) => setEvents(d.events || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [weekStart, currentMonth, viewMode]);

  const today = new Date().toISOString().split("T")[0];

  const formatTime = (dateStr: string) => {
    if (!dateStr.includes("T")) return "All day";
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => {
      const eventDate = (e.start || "").split("T")[0];
      return eventDate === dateStr;
    });
  };

  // Week view helpers
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const navigateWeek = (direction: number) => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + direction * 7);
    setWeekStart(newStart);
  };

  // Month view helpers
  const navigateMonth = (direction: number) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + direction);
    setCurrentMonth(d);
  };

  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday-based
    const days: (Date | null)[] = [];

    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  };

  const headerLabel =
    viewMode === "week"
      ? weekStart.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      : currentMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">Calendar</h2>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-cream border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-brg text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-brg text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Month
            </button>
          </div>
          <span className="text-sm text-text-secondary">{headerLabel}</span>
          <div className="flex gap-1">
            <button
              onClick={() => (viewMode === "week" ? navigateWeek(-1) : navigateMonth(-1))}
              className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
            >
              &larr;
            </button>
            <button
              onClick={() => (viewMode === "week" ? navigateWeek(1) : navigateMonth(1))}
              className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-48 bg-cream rounded-lg animate-pulse" />
      ) : viewMode === "week" ? (
        /* Weekly view */
        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {weekDays.map((day) => {
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
      ) : (
        /* Monthly view */
        <div>
          <div className="grid grid-cols-7 gap-px mb-px">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-xs text-text-muted uppercase py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {getMonthDays().map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="bg-cream/30 min-h-[90px]" />;
              }
              const dateStr = day.toISOString().split("T")[0];
              const isToday = dateStr === today;
              const dayEvents = getEventsForDay(day);
              return (
                <div
                  key={dateStr}
                  className={`bg-cream-light p-2 min-h-[90px] ${
                    isToday ? "ring-2 ring-inset ring-racing-red" : ""
                  }`}
                >
                  <p
                    className={`font-mono text-xs font-medium mb-1 ${
                      isToday ? "text-racing-red" : "text-text-primary"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="bg-brg-light text-brg text-[10px] px-1 py-0.5 rounded truncate"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[10px] text-text-muted">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
