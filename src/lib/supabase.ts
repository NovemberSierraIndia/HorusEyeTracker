import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy init to avoid build-time errors when env vars aren't set
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase credentials not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export interface BriefingEntry {
  id: string;
  created_at: string;
  raw_notes: string;
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
