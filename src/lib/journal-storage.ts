export interface JournalEntry {
  dateKey: string; // "2026-04-01"
  mood: number; // 0-10
  doneGreat: string;
  wins: string;
  doneBetter: string;
  gratefulFor: string;
  savedAt: string;
}

const STORAGE_KEY = "horuseye-journal-entries";
const INSIGHTS_KEY = "horuseye-journal-insights";

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getAllEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getEntry(dateKey: string): JournalEntry | undefined {
  return getAllEntries().find((e) => e.dateKey === dateKey);
}

export function saveEntry(entry: JournalEntry) {
  const entries = getAllEntries();
  const idx = entries.findIndex((e) => e.dateKey === entry.dateKey);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.push(entry);
  }
  entries.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getAvailableDates(): string[] {
  return getAllEntries().map((e) => e.dateKey);
}

export function getInsightsCache(): {
  insights: string;
  generatedAt: string;
} | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(INSIGHTS_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function saveInsightsCache(insights: string) {
  localStorage.setItem(
    INSIGHTS_KEY,
    JSON.stringify({ insights, generatedAt: new Date().toISOString() })
  );
}
