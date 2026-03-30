"use client";

import { useState, useEffect } from "react";
import { ReviewForm } from "@/components/review/review-form";
import { ReviewSummary } from "@/components/review/review-summary";
import {
  WeeklyReview,
  getISOWeekKey,
  getReview,
  getAvailableWeeks,
} from "@/lib/review-storage";

export default function ReviewPage() {
  const [currentWeek, setCurrentWeek] = useState(getISOWeekKey());
  const [review, setReview] = useState<WeeklyReview | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [availableWeeks, setAvailableWeeks] = useState<string[]>([]);

  useEffect(() => {
    const existing = getReview(currentWeek);
    setReview(existing);
    setShowForm(!existing);
    setAvailableWeeks(getAvailableWeeks());
  }, [currentWeek]);

  const handleSaved = (saved: WeeklyReview) => {
    setReview(saved);
    setShowForm(false);
    setAvailableWeeks(getAvailableWeeks());
  };

  const allWeeks = Array.from(new Set([currentWeek, ...availableWeeks]))
    .sort()
    .reverse();

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
