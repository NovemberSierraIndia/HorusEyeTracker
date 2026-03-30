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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Quote section */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">
            Daily Fuel
          </h2>
          <blockquote>
            <p className="text-lg text-text-primary leading-relaxed italic">
              &ldquo;{quote.text}&rdquo;
            </p>
            <footer className="mt-1 text-sm text-text-muted">
              — {quote.author}
            </footer>
          </blockquote>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-16 bg-border" />

        {/* Intention section */}
        <div className="md:w-72 shrink-0">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wide block mb-2">
            Today&apos;s Intention
          </label>
          <Input
            value={intention}
            onChange={(e) => handleIntentionChange(e.target.value)}
            placeholder="What's your focus today?"
            className="bg-cream border-border"
          />
        </div>
      </div>
    </div>
  );
}
