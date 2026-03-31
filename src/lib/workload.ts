const STORAGE_KEY = "horuseye-workload-categories";

export type ImportanceLevel = "none" | "transport" | "moderate" | "important" | "extreme";

export interface ImportanceOption {
  level: ImportanceLevel;
  label: string;
  points: number;
  color: string;
}

export const IMPORTANCE_OPTIONS: ImportanceOption[] = [
  { level: "none", label: "Not Important", points: 0, color: "#94A3B8" },
  { level: "transport", label: "Transportation", points: 5, color: "#566573" },
  { level: "moderate", label: "Moderately Important", points: 15, color: "#B7950B" },
  { level: "important", label: "Important", points: 25, color: "#D35400" },
  { level: "extreme", label: "Extremely Important", points: 40, color: "#C0392B" },
];

// Store categories keyed by event name (normalized lowercase)
// So all events with the same name share the same importance
interface CategoryMap {
  [eventName: string]: ImportanceLevel;
}

function getCategories(): CategoryMap {
  if (typeof window === "undefined") return {};
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveCategories(categories: CategoryMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function getEventImportance(eventName: string): ImportanceLevel {
  const categories = getCategories();
  return categories[eventName.toLowerCase().trim()] || "none";
}

export function setEventImportance(eventName: string, level: ImportanceLevel) {
  const categories = getCategories();
  categories[eventName.toLowerCase().trim()] = level;
  saveCategories(categories);
}

export function getImportanceOption(level: ImportanceLevel): ImportanceOption {
  return IMPORTANCE_OPTIONS.find((o) => o.level === level) || IMPORTANCE_OPTIONS[0];
}

export function getEventPoints(eventName: string): number {
  const level = getEventImportance(eventName);
  return getImportanceOption(level).points;
}

export function getTotalWorkloadPoints(eventNames: string[]): number {
  return eventNames.reduce((sum, name) => sum + getEventPoints(name), 0);
}
