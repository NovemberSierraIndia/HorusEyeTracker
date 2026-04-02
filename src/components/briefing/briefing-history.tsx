"use client";

import { BriefingEntry } from "@/lib/briefing-types";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  class: "bg-brg/10 text-brg",
  meeting: "bg-racing-red/10 text-racing-red",
  career: "bg-[#1B3A5C]/10 text-[#1B3A5C]",
  personal: "bg-amber-500/10 text-amber-700",
  thesis: "bg-purple-500/10 text-purple-700",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFirstLine(summary: string | null): string {
  if (!summary) return "No summary";
  const firstBullet = summary.split("\n").find((l) => l.trim()) || summary;
  return firstBullet.replace(/^[-•*]\s*/, "").slice(0, 80);
}

export function BriefingHistory({
  history,
  search,
  onSearchChange,
  selectedId,
  onSelect,
}: {
  history: BriefingEntry[];
  search: string;
  onSearchChange: (v: string) => void;
  selectedId: string | null;
  onSelect: (entry: BriefingEntry) => void;
}) {
  return (
    <div className="bg-cream-light border border-border rounded-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-px h-4 bg-border" />
        <span className="text-xs text-text-muted">Previous Briefings</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search briefings..."
          className="pl-8 bg-cream border-border text-sm h-8"
        />
      </div>

      {/* List */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">
            No briefings yet.
          </p>
        ) : (
          history.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                selectedId === entry.id
                  ? "bg-brg/10 border border-brg/20"
                  : "hover:bg-cream border border-transparent"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <FileText size={11} className="text-text-muted shrink-0" />
                <span className="text-[11px] text-text-muted font-mono">
                  {formatDate(entry.created_at)}
                </span>
              </div>
              <p className="text-xs text-text-primary line-clamp-1">
                {getFirstLine(entry.summary)}
              </p>
              {entry.tags && entry.tags.length > 0 && (
                <div className="flex gap-1 mt-1.5">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`px-1.5 py-0.5 text-[10px] rounded capitalize ${
                        TAG_COLORS[tag] || "bg-cream text-text-muted"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
