"use client";

import { useState, useEffect } from "react";
import { getDailyQuote } from "@/lib/quotes";
import { Input } from "@/components/ui/input";

export function MotivationalCard() {
  const quote = getDailyQuote();
  const [intention, setIntention] = useState("");

  const todayKey = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const saved = localStorage.getItem(`horuseye-intention-${todayKey}`);
    if (saved) setIntention(saved);
  }, [todayKey]);

  const handleIntentionChange = (value: string) => {
    setIntention(value);
    localStorage.setItem(`horuseye-intention-${todayKey}`, value);
  };

  return (
    <div className="bg-cream-light border border-border rounded-card p-6">
      <h2 className="text-lg font-medium text-text-primary mb-4">Daily Fuel</h2>
      <blockquote className="mb-4">
        <p className="text-base text-text-primary leading-relaxed italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-2 text-sm text-text-muted">— {quote.author}</footer>
      </blockquote>
      <div className="pt-4 border-t border-border">
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
          Today&apos;s intention
        </label>
        <Input
          value={intention}
          onChange={(e) => handleIntentionChange(e.target.value)}
          placeholder="What's your focus today?"
          className="mt-2 bg-cream border-border"
        />
      </div>
    </div>
  );
}
