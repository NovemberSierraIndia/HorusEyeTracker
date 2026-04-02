"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BriefingEntry, DetectedEvent, DetectedDraft } from "@/lib/briefing-types";
import { EyeIcon } from "@/components/icons/eye-icon";
import {
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  CalendarPlus,
  Mail,
  AlertCircle,
  RefreshCw,
  ClipboardList,
  Calendar,
  Send,
} from "lucide-react";

interface ProcessedResult {
  summary: string;
  events: DetectedEvent[];
  drafts: DetectedDraft[];
  tags: string[];
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "bg-brg/10 text-brg border-brg/30",
  medium: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  low: "bg-text-muted/10 text-text-muted border-border",
};

export function BriefingOutput({
  processing,
  error,
  result,
  selectedEntry,
  saved,
  onSave,
  onRetry,
  eventsConfirmed,
  draftsSent,
  onAddToCalendar,
  onCreateDraft,
}: {
  processing: boolean;
  error: string;
  result: ProcessedResult | null;
  selectedEntry: BriefingEntry | null;
  saved: boolean;
  onSave: () => void;
  onRetry: () => void;
  eventsConfirmed: boolean[];
  draftsSent: boolean[];
  onAddToCalendar: (index: number) => void;
  onCreateDraft: (index: number) => void;
}) {
  // For read-only history view
  if (selectedEntry) {
    return (
      <div className="space-y-4">
        <SummarySection
          summary={selectedEntry.summary || ""}
          saved={true}
          onSave={() => {}}
        />
        <EventsSection
          events={selectedEntry.events_detected || []}
          confirmed={selectedEntry.events_confirmed || []}
          onAdd={() => {}}
          readOnly
        />
        <DraftsSection
          drafts={selectedEntry.drafts_detected || []}
          sent={selectedEntry.drafts_sent || []}
          onCreate={() => {}}
          readOnly
        />
      </div>
    );
  }

  // Processing state
  if (processing) {
    return (
      <div className="bg-cream-light border border-border rounded-card p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-pulse space-y-4 text-center">
          <EyeIcon className="w-12 h-12 mx-auto opacity-60" />
          <p className="text-sm text-text-muted">Reading your notes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-cream-light border border-border rounded-card p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle size={32} className="text-racing-red" />
        <p className="text-sm text-text-secondary text-center max-w-md">
          {error}
        </p>
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-racing-red text-racing-red hover:bg-racing-red/10"
        >
          <RefreshCw size={14} className="mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  // Result state
  if (result) {
    return (
      <div className="space-y-4">
        <SummarySection summary={result.summary} saved={saved} onSave={onSave} />
        <EventsSection
          events={result.events}
          confirmed={eventsConfirmed}
          onAdd={onAddToCalendar}
        />
        <DraftsSection
          drafts={result.drafts}
          sent={draftsSent}
          onCreate={onCreateDraft}
        />
      </div>
    );
  }

  // Empty state
  return (
    <div className="bg-cream-light border border-border rounded-card p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <EyeIcon className="w-16 h-16 opacity-40" />
      <p className="text-sm text-text-muted text-center">
        Paste your notes and process them to begin.
      </p>
    </div>
  );
}

// ---------- Summary Section ----------

function SummarySection({
  summary,
  saved,
  onSave,
}: {
  summary: string;
  saved: boolean;
  onSave: () => void;
}) {
  const [open, setOpen] = useState(true);
  const bullets = String(summary || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="bg-cream-light border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-cream/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <ClipboardList size={16} className="text-brg" />
          Summary
        </span>
        {open ? (
          <ChevronUp size={16} className="text-text-muted" />
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3">
          <ul className="space-y-2">
            {bullets.map((bullet, i) => (
              <li
                key={i}
                className="text-sm text-text-primary leading-relaxed flex gap-2"
              >
                <span className="text-brg mt-1 shrink-0">•</span>
                <span>{bullet.replace(/^[-•*]\s*/, "")}</span>
              </li>
            ))}
          </ul>
          {!saved && (
            <Button
              onClick={onSave}
              className="mt-4 bg-brg hover:bg-brg/90 text-white"
              size="sm"
            >
              <Save size={14} className="mr-1.5" />
              Save Entry
            </Button>
          )}
          {saved && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-brg">
              <Check size={14} />
              Saved to Supabase
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Events Section ----------

function EventsSection({
  events,
  confirmed,
  onAdd,
  readOnly,
}: {
  events: DetectedEvent[];
  confirmed: boolean[];
  onAdd: (index: number) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-cream-light border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-cream/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Calendar size={16} className="text-brg" />
          Detected Events
          {events.length > 0 && (
            <span className="text-xs text-text-muted bg-cream border border-border rounded-full px-2 py-0.5">
              {events.length}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-text-muted" />
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3 space-y-3">
          {events.length === 0 ? (
            <p className="text-xs text-text-muted py-2">
              No events detected in your notes.
            </p>
          ) : (
            events.map((event, i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-4 bg-cream"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium text-text-primary">
                        {event.title}
                      </h4>
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded-full border capitalize ${
                          CONFIDENCE_COLORS[event.confidence] || CONFIDENCE_COLORS.low
                        }`}
                      >
                        {event.confidence}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {event.date && (
                        <span className="text-xs font-mono text-text-muted">
                          {event.date}
                        </span>
                      )}
                      {event.time && (
                        <span className="text-xs font-mono text-text-muted">
                          {event.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary mt-1.5">
                      {event.description}
                    </p>
                  </div>
                  {!readOnly && (
                    <Button
                      onClick={() => onAdd(i)}
                      disabled={confirmed[i] || !event.date}
                      size="sm"
                      className={
                        confirmed[i]
                          ? "bg-brg/10 text-brg border border-brg/20 cursor-default"
                          : "bg-brg hover:bg-brg/90 text-white"
                      }
                    >
                      {confirmed[i] ? (
                        <>
                          <Check size={12} className="mr-1" />
                          Added
                        </>
                      ) : (
                        <>
                          <CalendarPlus size={12} className="mr-1" />
                          Add to Calendar
                        </>
                      )}
                    </Button>
                  )}
                  {readOnly && confirmed[i] && (
                    <span className="text-xs text-brg flex items-center gap-1">
                      <Check size={12} /> Added
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------- Drafts Section ----------

function DraftsSection({
  drafts,
  sent,
  onCreate,
  readOnly,
}: {
  drafts: DetectedDraft[];
  sent: boolean[];
  onCreate: (index: number) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [expandedDraft, setExpandedDraft] = useState<number | null>(null);

  return (
    <div className="bg-cream-light border border-border rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-cream/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-text-primary">
          <Send size={16} className="text-brg" />
          Email Drafts
          {drafts.length > 0 && (
            <span className="text-xs text-text-muted bg-cream border border-border rounded-full px-2 py-0.5">
              {drafts.length}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp size={16} className="text-text-muted" />
        ) : (
          <ChevronDown size={16} className="text-text-muted" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-border pt-3 space-y-3">
          {drafts.length === 0 ? (
            <p className="text-xs text-text-muted py-2">
              No email drafts detected in your notes.
            </p>
          ) : (
            drafts.map((draft, i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-4 bg-cream"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted">
                      To: <span className="text-text-primary">{draft.to}</span>
                    </p>
                    <h4 className="text-sm font-medium text-text-primary mt-0.5">
                      {draft.subject}
                    </h4>
                    <p className="text-xs text-text-muted mt-1 italic">
                      {draft.context}
                    </p>

                    {/* Expandable body */}
                    <button
                      onClick={() =>
                        setExpandedDraft(expandedDraft === i ? null : i)
                      }
                      className="text-xs text-brg hover:text-brg-hover mt-2 flex items-center gap-1"
                    >
                      {expandedDraft === i ? (
                        <>
                          <ChevronUp size={12} /> Hide body
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} /> Show body
                        </>
                      )}
                    </button>
                    {expandedDraft === i && (
                      <pre className="mt-2 text-xs text-text-secondary whitespace-pre-wrap font-sans bg-cream-light border border-border rounded-lg p-3">
                        {draft.body}
                      </pre>
                    )}
                  </div>
                  {!readOnly && (
                    <Button
                      onClick={() => onCreate(i)}
                      disabled={sent[i]}
                      size="sm"
                      className={
                        sent[i]
                          ? "bg-brg/10 text-brg border border-brg/20 cursor-default"
                          : "bg-brg hover:bg-brg/90 text-white"
                      }
                    >
                      {sent[i] ? (
                        <>
                          <Check size={12} className="mr-1" />
                          Draft Saved
                        </>
                      ) : (
                        <>
                          <Mail size={12} className="mr-1" />
                          Create Draft
                        </>
                      )}
                    </Button>
                  )}
                  {readOnly && sent[i] && (
                    <span className="text-xs text-brg flex items-center gap-1">
                      <Check size={12} /> Sent
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
