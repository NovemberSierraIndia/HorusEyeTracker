"use client";

import { useState } from "react";
import { WeeklyReview, saveReview } from "@/lib/review-storage";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface ReviewSummaryProps {
  review: WeeklyReview;
}

const labels = [
  { key: "win", label: "Most important win" },
  { key: "uncomfortable", label: "Uncomfortable action" },
  { key: "careerForward", label: "Career progress" },
  { key: "wastedTime", label: "Time wasted on" },
  { key: "alignmentScore", label: "Alignment score" },
  { key: "nextWeekAction", label: "Non-negotiable next week" },
  { key: "underratedResult", label: "Underrated result" },
];

export function ReviewSummary({ review: initialReview }: ReviewSummaryProps) {
  const [review, setReview] = useState(initialReview);
  const [loading, setLoading] = useState(false);

  const generateReflection = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: review.answers }),
      });
      const data = await res.json();
      if (data.reflection) {
        const updated = { ...review, reflection: data.reflection };
        setReview(updated);
        saveReview(updated);
      }
    } catch {}
    setLoading(false);
  };

  const savedDate = new Date(review.savedAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="bg-cream-light border border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-text-primary">
            Review Summary
          </h3>
          <span className="font-mono text-xs text-text-muted">{savedDate}</span>
        </div>
        <div className="space-y-4">
          {labels.map(({ key, label }) => {
            const value = review.answers[key as keyof typeof review.answers];
            return (
              <div
                key={key}
                className="border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">
                  {label}
                </p>
                {key === "alignmentScore" ? (
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 bg-cream rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brg rounded-full"
                        style={{ width: `${(value as number) * 10}%` }}
                      />
                    </div>
                    <span className="font-mono text-sm font-medium text-brg">
                      {value}/10
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-text-primary">{value as string}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        {review.reflection ? (
          <div className="flex-1 space-y-3">
            <div className="bg-brg-light border border-brg/20 rounded-card p-5">
              <h4 className="text-sm font-medium text-brg mb-2">AI Reflection</h4>
              <p className="text-sm text-text-primary leading-relaxed">
                {review.reflection}
              </p>
            </div>
            <Button
              onClick={generateReflection}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-brg text-brg hover:bg-brg-light"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw size={14} className="mr-2" />
                  Re-generate Reflection
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button
            onClick={generateReflection}
            disabled={loading}
            variant="outline"
            className="border-brg text-brg hover:bg-brg-light"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Reflection"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
