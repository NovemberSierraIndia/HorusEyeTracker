# Daily Journal & Journal Review Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the Weekly Review tab with a Daily Journal system and a Journal Review dashboard showing mood trends, AI insights, and a Wall of Wins.

**Architecture:** New localStorage-backed journal storage keyed by date string. Two sub-tabs on the `/review` route: "Daily Journal" (form) and "Journal Review" (dashboard with SVG mood chart, AI analysis, wins grid). Reuses existing Anthropic API integration for AI insights.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, localStorage, Anthropic Claude API, SVG charts

---

### Task 1: Create journal-storage.ts

**Files:**
- Create: `src/lib/journal-storage.ts`

**Step 1: Write the storage module**

```ts
export interface JournalEntry {
  dateKey: string;       // "2026-04-01"
  mood: number;          // 0-10
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

export function getInsightsCache(): { insights: string; generatedAt: string } | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(INSIGHTS_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function saveInsightsCache(insights: string) {
  localStorage.setItem(INSIGHTS_KEY, JSON.stringify({ insights, generatedAt: new Date().toISOString() }));
}
```

**Step 2: Verify no syntax errors**

Run: `npx tsc --noEmit src/lib/journal-storage.ts` or just proceed to next task (will be validated at build).

**Step 3: Commit**

```bash
git add src/lib/journal-storage.ts
git commit -m "feat: add journal storage module for daily entries"
```

---

### Task 2: Create journal-form.tsx (Daily Journal tab)

**Files:**
- Create: `src/components/journal/journal-form.tsx`

**Step 1: Write the Daily Journal form component**

Features:
- Date picker (defaults to today) at top
- Mood slider 0-10 with emoji labels
- 4 textareas: doneGreat, wins, doneBetter, gratefulFor
- Save button that persists to localStorage
- Loads existing entry when date changes
- Visual feedback on save

Mood emoji scale: 0-1 = "😞", 2-3 = "😔", 4-5 = "😐", 6-7 = "🙂", 8-9 = "😊", 10 = "🔥"

**Step 2: Commit**

```bash
git add src/components/journal/journal-form.tsx
git commit -m "feat: add daily journal form component"
```

---

### Task 3: Create journal-review.tsx (Journal Review tab)

**Files:**
- Create: `src/components/journal/journal-review.tsx`

**Step 1: Write the Journal Review dashboard**

Three sections:

**A) Mood Score Graph (SVG)**
- Line chart with dots at each data point
- X-axis: dates, Y-axis: 0-10
- Toggle buttons: Week (7 days), Month (30 days), Year (365 days)
- Shows average mood as a dashed horizontal line
- Color: BRG green for the line

**B) AI Insights**
- "Analyze My Journal" button
- Sends all entries to `/api/ai/journal-insights`
- Shows formatted response with sections for strengths and areas to improve
- Cached in localStorage, shows "last analyzed" date
- Re-generate button

**C) Wall of Wins**
- Grid of cards, each showing a win entry + its date
- Split wins by newline (each line = separate win card)
- Most recent first
- Empty state: "No wins recorded yet. Start journaling!"

**Step 2: Commit**

```bash
git add src/components/journal/journal-review.tsx
git commit -m "feat: add journal review dashboard with mood graph, AI insights, wall of wins"
```

---

### Task 4: Create AI journal insights API route

**Files:**
- Modify: `src/app/api/ai/reflection/route.ts` → rewrite as journal insights endpoint

**Step 1: Rewrite the reflection API route**

Update the system prompt and request handling to analyze daily journal entries instead of weekly reviews. Accept array of journal entries, return structured feedback on strengths and areas to improve.

**Step 2: Commit**

```bash
git add src/app/api/ai/reflection/route.ts
git commit -m "feat: update AI reflection route for daily journal insights"
```

---

### Task 5: Rewrite review page.tsx with sub-tabs

**Files:**
- Modify: `src/app/(app)/review/page.tsx`

**Step 1: Rewrite the page with two tabs**

- Two tab buttons at top: "Daily Journal" | "Journal Review"
- Default tab: "Daily Journal"
- Renders JournalForm or JournalReview based on active tab
- Clean header: "Journal" title

**Step 2: Commit**

```bash
git add src/app/(app)/review/page.tsx
git commit -m "feat: rewrite review page with Daily Journal and Journal Review tabs"
```

---

### Task 6: Update sidebar navigation

**Files:**
- Modify: `src/components/sidebar/sidebar.tsx`

**Step 1: Update nav item**

Change:
- Label: "Weekly Review" → "Journal"
- Icon: `ClipboardCheck` → `BookHeart`

**Step 2: Commit**

```bash
git add src/components/sidebar/sidebar.tsx
git commit -m "feat: rename sidebar nav from Weekly Review to Journal"
```

---

### Task 7: Clean up old review components

**Files:**
- Delete: `src/components/review/review-form.tsx`
- Delete: `src/components/review/review-summary.tsx`

**Step 1: Remove old files**

```bash
rm src/components/review/review-form.tsx src/components/review/review-summary.tsx
```

**Step 2: Verify no imports reference them**

Search codebase for imports of deleted files.

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove old weekly review components"
```

---

### Task 8: Build, verify, and push

**Step 1: Run build**

Run: `npm run build`
Expected: Clean build with no errors.

**Step 2: Fix any lint/type errors**

**Step 3: Final commit and push**

```bash
git push origin master
```

Expected: Vercel auto-deploys from master.
