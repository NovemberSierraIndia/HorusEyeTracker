"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  getAllEntries,
  getInsightsCache,
  saveInsightsCache,
  JournalEntry,
} from "@/lib/journal-storage";
import { Loader2, RefreshCw, Brain, Trophy, TrendingUp } from "lucide-react";

type TimeRange = "week" | "month" | "year";

// ---------- Mood Chart (SVG) ----------

function MoodChart({
  entries,
  range,
}: {
  entries: JournalEntry[];
  range: TimeRange;
}) {
  const daysBack = range === "week" ? 7 : range === "month" ? 30 : 365;
  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;

  const filtered = entries
    .filter((e) => e.dateKey >= cutoffStr)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-text-muted">
        No entries in this period. Start journaling!
      </div>
    );
  }

  const W = 700;
  const H = 200;
  const PAD_L = 35;
  const PAD_R = 15;
  const PAD_T = 15;
  const PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;

  const avgMood =
    filtered.reduce((s, e) => s + e.mood, 0) / filtered.length;

  const points = filtered.map((e, i) => {
    const x = PAD_L + (filtered.length === 1 ? chartW / 2 : (i / (filtered.length - 1)) * chartW);
    const y = PAD_T + chartH - (e.mood / 10) * chartH;
    return { x, y, entry: e };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const avgY = PAD_T + chartH - (avgMood / 10) * chartH;

  // Show date labels - pick ~6 evenly spaced labels
  const labelCount = Math.min(filtered.length, range === "week" ? 7 : 6);
  const labelIndices: number[] = [];
  for (let i = 0; i < labelCount; i++) {
    labelIndices.push(
      Math.round((i / (labelCount - 1)) * (filtered.length - 1))
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {/* Y-axis grid lines */}
      {[0, 2, 4, 6, 8, 10].map((v) => {
        const y = PAD_T + chartH - (v / 10) * chartH;
        return (
          <g key={v}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeWidth={1}
            />
            <text
              x={PAD_L - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="currentColor"
              fillOpacity={0.4}
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Average line */}
      <line
        x1={PAD_L}
        x2={W - PAD_R}
        y1={avgY}
        y2={avgY}
        stroke="#1a5c38"
        strokeWidth={1}
        strokeDasharray="6 4"
        strokeOpacity={0.4}
      />
      <text
        x={W - PAD_R + 2}
        y={avgY + 3}
        fontSize={9}
        fill="#1a5c38"
        fillOpacity={0.6}
      >
        avg {avgMood.toFixed(1)}
      </text>

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#1a5c38"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4}
          fill="#1a5c38"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      {/* X-axis date labels */}
      {labelIndices.map((idx) => {
        const p = points[idx];
        const dateLabel =
          range === "year"
            ? p.entry.dateKey.slice(5) // "04-01"
            : p.entry.dateKey.slice(5).replace("-", "/"); // "04/01"
        return (
          <text
            key={idx}
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            fillOpacity={0.4}
          >
            {dateLabel}
          </text>
        );
      })}
    </svg>
  );
}

// ---------- Wall of Wins ----------

function WallOfWins({ entries }: { entries: JournalEntry[] }) {
  const allWins = entries
    .filter((e) => e.wins.trim())
    .flatMap((e) =>
      e.wins
        .split("\n")
        .map((w) => w.trim())
        .filter(Boolean)
        .map((win) => ({ win, dateKey: e.dateKey }))
    );

  if (allWins.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-text-muted">
        No wins recorded yet. Start journaling to build your Wall of Wins!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {allWins.map((w, i) => (
        <div
          key={i}
          className="bg-cream-light border border-border rounded-card p-4 hover:border-brg/30 transition-colors"
        >
          <div className="flex items-start gap-2">
            <Trophy size={14} className="text-racing-red mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-text-primary leading-relaxed">{w.win}</p>
              <p className="text-[11px] text-text-muted mt-1.5">{formatDate(w.dateKey)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------- Main Component ----------

export function JournalReview() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [insights, setInsights] = useState("");
  const [insightsDate, setInsightsDate] = useState("");
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState("");

  useEffect(() => {
    setEntries(getAllEntries());
    const cached = getInsightsCache();
    if (cached) {
      setInsights(cached.insights);
      setInsightsDate(cached.generatedAt);
    }
  }, []);

  const entryCount = entries.length;
  const avgMood = useMemo(() => {
    if (entries.length === 0) return 0;
    return entries.reduce((s, e) => s + e.mood, 0) / entries.length;
  }, [entries]);

  const generateInsights = async () => {
    if (entries.length === 0) return;
    setLoadingInsights(true);
    setInsightsError("");
    try {
      const res = await fetch("/api/ai/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (data.error) {
        setInsightsError(data.error);
      } else if (data.insights) {
        setInsights(data.insights);
        saveInsightsCache(data.insights);
        setInsightsDate(new Date().toISOString());
      }
    } catch {
      setInsightsError("Failed to generate insights. Try again.");
    }
    setLoadingInsights(false);
  };

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      {entryCount > 0 && (
        <div className="flex gap-4">
          <div className="bg-cream-light border border-border rounded-card px-4 py-3 flex-1 text-center">
            <p className="text-2xl font-semibold text-text-primary">{entryCount}</p>
            <p className="text-xs text-text-muted">Entries</p>
          </div>
          <div className="bg-cream-light border border-border rounded-card px-4 py-3 flex-1 text-center">
            <p className="text-2xl font-semibold text-brg">{avgMood.toFixed(1)}</p>
            <p className="text-xs text-text-muted">Avg Mood</p>
          </div>
          <div className="bg-cream-light border border-border rounded-card px-4 py-3 flex-1 text-center">
            <p className="text-2xl font-semibold text-racing-red">
              {entries.filter((e) => e.wins.trim()).reduce((c, e) => c + e.wins.split("\n").filter((w) => w.trim()).length, 0)}
            </p>
            <p className="text-xs text-text-muted">Total Wins</p>
          </div>
        </div>
      )}

      {/* Mood Graph */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
            <TrendingUp size={16} className="text-brg" />
            Mood Over Time
          </h3>
          <div className="flex gap-1">
            {(["week", "month", "year"] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  timeRange === r
                    ? "bg-brg text-white border-brg"
                    : "bg-cream-light border-border text-text-muted hover:border-brg"
                }`}
              >
                {r === "week" ? "Week" : r === "month" ? "Month" : "Year"}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-cream-light border border-border rounded-card p-4">
          <MoodChart entries={entries} range={timeRange} />
        </div>
      </section>

      {/* AI Insights */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-primary flex items-center gap-2">
            <Brain size={16} className="text-brg" />
            AI Insights
          </h3>
          {insightsDate && (
            <span className="text-[11px] text-text-muted">
              Last analyzed: {formatDate(insightsDate.split("T")[0])}
            </span>
          )}
        </div>
        <div className="bg-cream-light border border-border rounded-card p-5">
          {entries.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-4">
              Add a few journal entries first, then come back for AI-powered insights.
            </p>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={generateInsights}
                  disabled={loadingInsights}
                  className="bg-brg hover:bg-brg/90 text-white"
                  size="sm"
                >
                  {loadingInsights ? (
                    <>
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                      Analyzing...
                    </>
                  ) : insights ? (
                    <>
                      <RefreshCw size={14} className="mr-1.5" />
                      Re-analyze
                    </>
                  ) : (
                    "Analyze My Journal"
                  )}
                </Button>
                {insightsError && (
                  <span className="text-xs text-racing-red self-center">{insightsError}</span>
                )}
              </div>
              {insights && (
                <div className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {insights}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Wall of Wins */}
      <section>
        <h3 className="text-sm font-medium text-text-primary flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-racing-red" />
          Wall of Wins
        </h3>
        <WallOfWins entries={entries} />
      </section>
    </div>
  );
}
