export interface WeeklyReview {
  weekKey: string;
  answers: {
    win: string;
    uncomfortable: string;
    careerForward: string;
    wastedTime: string;
    alignmentScore: number;
    nextWeekAction: string;
    underratedResult: string;
  };
  reflection?: string;
  savedAt: string;
}

const STORAGE_KEY = "horuseye-weekly-reviews";

export function getISOWeekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function getAllReviews(): WeeklyReview[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getReview(weekKey: string): WeeklyReview | undefined {
  return getAllReviews().find((r) => r.weekKey === weekKey);
}

export function saveReview(review: WeeklyReview) {
  const reviews = getAllReviews();
  const idx = reviews.findIndex((r) => r.weekKey === review.weekKey);
  if (idx >= 0) {
    reviews[idx] = review;
  } else {
    reviews.push(review);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function getAvailableWeeks(): string[] {
  return getAllReviews().map((r) => r.weekKey).sort().reverse();
}
