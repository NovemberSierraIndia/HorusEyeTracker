"use client";

import { useState, useEffect } from "react";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewSummary } from "@/components/review/review-summary";
import {
  WeeklyReview,
  getISOWeekKey,
  getReview,
  getAvailableWeeks,
  getAllReviews,
} from "@/lib/review-storage";

export default function ReviewPage() {
  const [currentWeek, setCurrentWeek] = useState(getISOWeekKey());
  const [review, setReview] = useState<WeeklyReview | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);
  const [allReviews, setAllReviews] = useState<WeeklyReview[]>([]);

  useEffect(() => {
    const existing = getReview(currentWeek);
    setReview(existing);
    setShowForm(!existing);
    setAvailableWeeks(getAvailableWeeks());
    setAllReviews(getAllReviews());
  }, [currentWeek]);

  const handleSaved = (saved: WeeklyReview) => {
    setReview(saved);
    setShowForm(false);
    setAvailableWeeks(getAvailableWeeks());
    setAllReviews(getAllReviews());
  };

  const allWeeks = Array.from(new Set([currentWeek, ...availableWeeks]))
    .sort()
    .reverse();

  // Trend data: last 8 weeks of alignment scores
  const trendData = allReviews
    .sort((a, b) => a.weekKey.localeCompare(b.weekKey))
    .slice(-8);

  const avgScore =
    trendData.length > 0
      ? (
          trendData.reduce((sum, r) => sum + r.answers.alignmentScore, 0) /
          trendData.length
        ).toFixed(1)
      : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-text-primary">
          Weekly Review
        </h1>
        <div className="flex items-center gap-3">
          <select
            value={currentWeek}
            onChange={(e) => setCurrentWeek(e.target.value)}
            className="bg-cream-light border border-border rounded-lg px-3 py-1.5 text-sm font-mono text-text-primary"
          >
            {allWeeks.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          {review && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-brg hover:text-brg-hover"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Trend Summary */}
      {trendData.length >= 2 && (
        <div className="bg-cream-light border border-border rounded-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-text-primary">
              Alignment Trend
            </h3>
            <span className="font-mono text-xs text-text-muted">
              Avg: {avgScore}/10 over {trendData.length} weeks
            </span>
          </div>
          {/* Simple bar chart */}
          <div className="flex items-end gap-2 h-24">
            {trendData.map((r) => {
              const height = (r.answers.alignmentScore / 10) * 100;
              const isCurrentWeekBar = r.weekKey === currentWeek;
              return (
                <div
                  key={r.weekKey}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-[10px] font-mono text-text-muted">
                    {r.answers.alignmentScore}
                  </span>
                  <div
                    className={`w-full rounded-t transition-all ${
                      isCurrentWeekBar ? "bg-racing-red" : "bg-brg"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[9px] font-mono text-text-muted truncate max-w-full">
                    {r.weekKey.split("-W")[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showForm ? (
        <ReviewForm
          weekKey={currentWeek}
          existingReview={review}
          onSaved={handleSaved}
        />
      ) : review ? (
        <ReviewSummary review={review} />
      ) : (
        <div className="text-center py-12 text-text-muted">
          <p>No review for this week yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-brg hover:text-brg-hover text-sm"
          >
            Start review
          </button>
        </div>
      )}
    </div>
  );
}
