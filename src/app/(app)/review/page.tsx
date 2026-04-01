"use client";

import { useState } from "react";
import { JournalForm } from "@/components/journal/journal-form";
import { JournalReview } from "@/components/journal/journal-review";
import { BookOpen, BarChart3 } from "lucide-react";

type Tab = "journal" | "review";

export default function JournalPage() {
  const [tab, setTab] = useState<Tab>("journal");

  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-6">Journal</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-cream-light border border-border rounded-card p-1 mb-6">
        <button
          onClick={() => setTab("journal")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "journal"
              ? "bg-brg text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <BookOpen size={16} />
          Daily Journal
        </button>
        <button
          onClick={() => setTab("review")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "review"
              ? "bg-brg text-white"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          <BarChart3 size={16} />
          Journal Review
        </button>
      </div>

      {/* Tab content */}
      {tab === "journal" ? <JournalForm /> : <JournalReview />}
    </div>
  );
}
