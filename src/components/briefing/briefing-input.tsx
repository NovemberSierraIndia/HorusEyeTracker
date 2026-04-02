"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Plus } from "lucide-react";

const ALL_TAGS = ["class", "meeting", "career", "personal", "thesis"];

const TAG_COLORS: Record<string, string> = {
  class: "bg-brg/10 text-brg border-brg/30",
  meeting: "bg-racing-red/10 text-racing-red border-racing-red/30",
  career: "bg-[#1B3A5C]/10 text-[#1B3A5C] border-[#1B3A5C]/30",
  personal: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  thesis: "bg-purple-500/10 text-purple-700 border-purple-500/30",
};

export function BriefingInput({
  notes,
  setNotes,
  tags,
  setTags,
  processing,
  onProcess,
  onNew,
  hasResult,
}: {
  notes: string;
  setNotes: (v: string) => void;
  tags: string[];
  setTags: (v: string[]) => void;
  processing: boolean;
  onProcess: () => void;
  onNew: () => void;
  hasResult: boolean;
}) {
  const toggleTag = (tag: string) => {
    setTags(
      tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag]
    );
  };

  return (
    <div className="bg-cream-light border border-border rounded-card p-5 space-y-4">
      {hasResult && (
        <Button
          onClick={onNew}
          variant="outline"
          size="sm"
          className="w-full border-brg text-brg hover:bg-brg/10"
        >
          <Plus size={14} className="mr-1.5" />
          New Briefing
        </Button>
      )}

      <div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your notes here — class, meeting, voice dump, anything."
          rows={8}
          className="w-full bg-cream border border-border rounded-lg px-3 py-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-brg min-h-[140px]"
          disabled={processing}
        />
      </div>

      {/* Tag selector */}
      <div>
        <p className="text-xs text-text-muted mb-2">Tags</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 text-xs rounded-full border capitalize transition-colors ${
                tags.includes(tag)
                  ? TAG_COLORS[tag] || "bg-brg/10 text-brg border-brg/30"
                  : "bg-cream border-border text-text-muted hover:border-text-muted"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={onProcess}
        disabled={processing || !notes.trim()}
        className="w-full bg-racing-red hover:bg-racing-red/90 text-white"
      >
        {processing ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Process Notes
            <ArrowRight size={16} className="ml-2" />
          </>
        )}
      </Button>
    </div>
  );
}
