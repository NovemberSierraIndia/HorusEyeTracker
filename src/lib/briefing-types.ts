export interface BriefingEntry {
  id: string;
  created_at: string;
  raw_notes: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  events_detected: DetectedEvent[];
  events_confirmed: boolean[];
  drafts_detected: DetectedDraft[];
  drafts_sent: boolean[];
  source_type: string;
}

export interface DetectedEvent {
  title: string;
  date: string | null;
  time: string | null;
  description: string;
  confidence: "high" | "medium" | "low";
}

export interface DetectedDraft {
  to: string;
  subject: string;
  body: string;
  context: string;
}
