"use client";

import { useState, useEffect, useCallback } from "react";
import { BriefingInput } from "@/components/briefing/briefing-input";
import { BriefingOutput } from "@/components/briefing/briefing-output";
import { BriefingHistory } from "@/components/briefing/briefing-history";
import { BriefingEntry, DetectedEvent, DetectedDraft } from "@/lib/supabase";

interface ProcessedResult {
  summary: string;
  events: DetectedEvent[];
  drafts: DetectedDraft[];
  tags: string[];
}

export default function BriefingRoomPage() {
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<BriefingEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<BriefingEntry | null>(null);
  const [historySearch, setHistorySearch] = useState("");

  // Action states
  const [eventsConfirmed, setEventsConfirmed] = useState<boolean[]>([]);
  const [draftsSent, setDraftsSent] = useState<boolean[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (historySearch) params.set("q", historySearch);
      const res = await fetch(`/api/briefing/history?${params}`);
      const data = await res.json();
      if (data.entries) setHistory(data.entries);
    } catch {
      // silently fail
    }
  }, [historySearch]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const processNotes = async () => {
    if (!notes.trim() || processing) return;
    setProcessing(true);
    setError("");
    setResult(null);
    setSaved(false);
    setSavedEntryId(null);
    setSelectedEntry(null);

    try {
      const res = await fetch("/api/briefing/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        const processed: ProcessedResult = {
          summary: data.summary || "",
          events: data.events || [],
          drafts: data.drafts || [],
          tags: data.tags || tags,
        };
        setResult(processed);
        setTags(processed.tags);
        setEventsConfirmed(new Array(processed.events.length).fill(false));
        setDraftsSent(new Array(processed.drafts.length).fill(false));
      }
    } catch {
      setError("Failed to process notes. Check your connection and try again.");
    }
    setProcessing(false);
  };

  const saveEntry = async () => {
    if (!result) return;
    try {
      const res = await fetch("/api/briefing/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raw_notes: notes,
          summary: result.summary,
          tags: result.tags,
          events_detected: result.events,
          events_confirmed: eventsConfirmed,
          drafts_detected: result.drafts,
          drafts_sent: draftsSent,
          source_type: "text",
        }),
      });
      const data = await res.json();
      if (data.entry) {
        setSaved(true);
        setSavedEntryId(data.entry.id);
        fetchHistory();
      }
    } catch {
      // silently fail
    }
  };

  const addToCalendar = async (index: number) => {
    if (!result) return;
    const event = result.events[index];
    try {
      const res = await fetch("/api/calendar/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: event.title,
          date: event.date,
          time: event.time,
          description: event.description,
        }),
      });
      if (res.ok) {
        setEventsConfirmed((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }
    } catch {
      // silently fail
    }
  };

  const createDraft = async (index: number) => {
    if (!result) return;
    const draft = result.drafts[index];
    try {
      const res = await fetch("/api/gmail/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: draft.to,
          subject: draft.subject,
          body: draft.body,
        }),
      });
      if (res.ok) {
        setDraftsSent((prev) => {
          const next = [...prev];
          next[index] = true;
          return next;
        });
      }
    } catch {
      // silently fail
    }
  };

  const loadHistoryEntry = (entry: BriefingEntry) => {
    setSelectedEntry(entry);
    setResult(null);
    setNotes("");
    setSaved(true);
    setSavedEntryId(entry.id);
  };

  const startNew = () => {
    setSelectedEntry(null);
    setResult(null);
    setNotes("");
    setTags([]);
    setError("");
    setSaved(false);
    setSavedEntryId(null);
    setEventsConfirmed([]);
    setDraftsSent([]);
  };

  return (
    <div>
      <h1 className="text-2xl font-medium text-text-primary mb-6">
        Briefing Room
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel — Input + History */}
        <div className="w-full lg:w-[30%] space-y-4">
          <BriefingInput
            notes={notes}
            setNotes={setNotes}
            tags={tags}
            setTags={setTags}
            processing={processing}
            onProcess={processNotes}
            onNew={startNew}
            hasResult={!!result || !!selectedEntry}
          />

          <BriefingHistory
            history={history}
            search={historySearch}
            onSearchChange={setHistorySearch}
            selectedId={savedEntryId}
            onSelect={loadHistoryEntry}
          />
        </div>

        {/* Right panel — Output */}
        <div className="w-full lg:w-[70%]">
          <BriefingOutput
            processing={processing}
            error={error}
            result={result}
            selectedEntry={selectedEntry}
            saved={saved}
            onSave={saveEntry}
            onRetry={processNotes}
            eventsConfirmed={eventsConfirmed}
            draftsSent={draftsSent}
            onAddToCalendar={addToCalendar}
            onCreateDraft={createDraft}
          />
        </div>
      </div>
    </div>
  );
}
