"use client";

import { useEffect, useState } from "react";
import { getEventImportance, getImportanceOption } from "@/lib/workload";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Format a local Date as "YYYY-MM-DD" without UTC conversion
function toLocalDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function MonthlyView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calendar/month?year=${year}&month=${month + 1}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [year, month]);

  const navigateMonth = (dir: number) => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + dir);
    setCurrentMonth(d);
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(toLocalDateStr(new Date()));
  };

  // Build month grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = (firstDay.getDay() + 6) % 7; // Monday-based
  const totalDays = lastDay.getDate();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  const today = toLocalDateStr(new Date());

  const getEventsForDay = (dateStr: string) => {
    return events.filter((e) => {
      const eventDate = (e.start || "").split("T")[0];
      return eventDate === dateStr;
    });
  };

  const monthLabel = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  // Selected day events
  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  const selectedDayLabel = selectedDate
    ? new Date(
        parseInt(selectedDate.split("-")[0]),
        parseInt(selectedDate.split("-")[1]) - 1,
        parseInt(selectedDate.split("-")[2])
      ).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "";

  const formatTime = (dateStr: string) => {
    if (!dateStr.includes("T")) return "All day";
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-text-primary">Calendar</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="text-xs font-medium text-brg hover:text-brg-hover px-2 py-1 rounded border border-brg/20 hover:bg-brg-light transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
          >
            &larr;
          </button>
          <span className="text-sm font-medium text-text-primary min-w-[140px] text-center">
            {monthLabel}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 hover:bg-cream rounded-lg text-text-secondary hover:text-text-primary"
          >
            &rarr;
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-cream rounded-lg animate-pulse" />
      ) : (
        <>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-px">
            {DAY_NAMES.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] text-text-muted uppercase tracking-wide py-2 font-medium"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-7 gap-px bg-border/50 rounded-lg overflow-hidden">
            {days.map((day, i) => {
              if (!day) {
                return (
                  <div key={`empty-${i}`} className="bg-cream/20 min-h-[80px]" />
                );
              }
              const dateStr = toLocalDateStr(day);
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const dayEvents = getEventsForDay(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(dateStr)}
                  className={`bg-cream-light min-h-[80px] p-1.5 text-left transition-colors hover:bg-cream/60 ${
                    isSelected
                      ? "ring-2 ring-inset ring-brg bg-brg-light/30"
                      : isToday
                      ? "ring-2 ring-inset ring-racing-red"
                      : ""
                  }`}
                >
                  <p
                    className={`font-mono text-xs font-medium mb-1 ${
                      isToday
                        ? "text-racing-red"
                        : isSelected
                        ? "text-brg"
                        : "text-text-primary"
                    }`}
                  >
                    {day.getDate()}
                  </p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="bg-brg/10 border-l-2 border-brg text-[9px] text-brg px-1 py-0.5 rounded-r truncate leading-tight"
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <p className="text-[9px] text-text-muted pl-1">
                        +{dayEvents.length - 3} more
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded day detail */}
          {selectedDate && (
            <div className="mt-4 bg-cream rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-text-primary">
                  {selectedDayLabel}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-text-muted hover:text-text-primary"
                >
                  Close
                </button>
              </div>
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-text-muted italic">No events this day.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((event) => {
                    const importance = getEventImportance(event.title);
                    const option = getImportanceOption(importance);
                    const startTime = formatTime(event.start);
                    const endTime = formatTime(event.end);
                    const timeRange =
                      startTime === "All day"
                        ? "All day"
                        : `${startTime} – ${endTime}`;

                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-3 p-2.5 bg-cream-light rounded-md border border-border"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: option.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {event.title}
                          </p>
                          <p className="font-mono text-[11px] text-text-muted">
                            {timeRange}
                          </p>
                        </div>
                        {option.points > 0 && (
                          <span
                            className="font-mono text-[10px] px-1.5 py-0.5 rounded shrink-0"
                            style={{
                              color: option.color,
                              backgroundColor: `${option.color}15`,
                            }}
                          >
                            {option.points}pts
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
