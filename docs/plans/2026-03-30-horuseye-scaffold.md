# HorusEye Full Application Scaffold — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete Next.js 14 personal command center app (HorusEye) with 5 sections: Dashboard, Calendar & Inbox, Projects/Gantt, Career Engine, and Weekly Review.

**Architecture:** Next.js 14 App Router with TypeScript, Tailwind CSS, shadcn/ui components. NextAuth.js for Google OAuth. localStorage for persistence (Gantt, Weekly Review, Career Engine outputs). Server-side API routes proxy Google Calendar, Gmail, OpenWeatherMap, and Anthropic Claude APIs.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, NextAuth.js, next-pwa, Google Calendar API, Gmail API, OpenWeatherMap API, Anthropic Claude API (`claude-sonnet-4-20250514`)

---

### Task 1: Project Initialization & Configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`, `next.config.js`
- Create: `.env.local` (already exists with real keys — preserve it)
- Create: `.env.example` (placeholder version for version control)
- Create: `.gitignore`

**Steps:**
1. Run `npx create-next-app@14` with TypeScript, Tailwind, App Router, ESLint
2. Install dependencies: `next-auth`, `next-pwa`, `@anthropic-ai/sdk`, `uuid`
3. Initialize shadcn/ui with cream/BRG theme
4. Configure `next.config.js` with PWA support
5. Create `.env.example` with all 6 env var placeholders
6. Configure Tailwind with custom colors, DM Sans + DM Mono fonts
7. Commit: "chore: initialize Next.js 14 project with dependencies"

---

### Task 2: Global Styles, Fonts & Theme

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Steps:**
1. Add Google Fonts (DM Sans, DM Mono) via `next/font/google`
2. Set CSS variables for the full color palette (cream bg, BRG accent, racing red CTA, etc.)
3. Configure shadcn/ui theme to use these variables
4. Set global styles: 12px border-radius cards, 0.5px borders, no heavy shadows
5. Commit: "style: add global theme, fonts, and color palette"

---

### Task 3: PWA Configuration

**Files:**
- Create: `public/manifest.json`
- Create: `public/icons/icon-192x192.svg`, `public/icons/icon-512x512.svg`
- Modify: `next.config.js`
- Modify: `app/layout.tsx` (add manifest link + meta tags)

**Steps:**
1. Create web manifest with name, short_name, theme_color (#1B4332), background_color (#F5F0E8), display: standalone
2. Create simple eye SVG icons at 192x192 and 512x512
3. Configure next-pwa in next.config.js for service worker generation
4. Add manifest link and PWA meta tags to root layout
5. Commit: "feat: add PWA manifest, icons, and service worker config"

---

### Task 4: NextAuth.js + Google OAuth

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `lib/auth.ts` (auth options config)
- Create: `components/providers/session-provider.tsx`
- Modify: `app/layout.tsx`

**Steps:**
1. Configure NextAuth with Google provider, scopes: `calendar.readonly`, `gmail.readonly`
2. Store access_token and refresh_token in JWT callback for API access
3. Create session provider wrapper component
4. Wrap root layout in session provider
5. Commit: "feat: add NextAuth.js with Google OAuth and Calendar/Gmail scopes"

---

### Task 5: Landing Page (Unauthenticated)

**Files:**
- Create: `app/page.tsx` (landing / sign-in page)
- Create: `components/icons/eye-icon.tsx` (reusable eye SVG)

**Steps:**
1. Create eye SVG icon component
2. Build full-screen landing: HorusEye logo, tagline "Your command center.", "Sign in with Google" button
3. Racing red CTA button, cream background, centered layout
4. Redirect to /dashboard if already authenticated
5. Commit: "feat: add landing page with Google sign-in"

---

### Task 6: App Shell — Sidebar Layout

**Files:**
- Create: `app/(app)/layout.tsx` (authenticated layout with sidebar)
- Create: `components/sidebar/sidebar.tsx`
- Create: `components/sidebar/nav-item.tsx`
- Create: `components/sidebar/clock.tsx` (live date+time)
- Create: `components/sidebar/user-info.tsx`

**Steps:**
1. Create `(app)` route group for all authenticated pages
2. Add auth guard — redirect to / if no session
3. Build sidebar: 220px fixed on desktop, 60px icon rail on mobile
4. Add logo (eye icon + "HorusEye" wordmark), live clock (DM Mono, updates every second)
5. Add nav items: Dashboard, Calendar & Inbox, Projects, Career Engine, Weekly Review
6. Active state: left BRG border, #E8F0EC background
7. Gmail unread count badge on "Calendar & Inbox" nav item
8. Bottom: user avatar + Google account name from session
9. Main content area fills remaining width, scrollable
10. Commit: "feat: add authenticated app shell with sidebar navigation"

---

### Task 7: Dashboard Page

**Files:**
- Create: `app/(app)/dashboard/page.tsx`
- Create: `components/dashboard/todays-events.tsx`
- Create: `components/dashboard/weather-card.tsx`
- Create: `components/dashboard/motivational-card.tsx`
- Create: `lib/quotes.ts` (30+ curated quotes)

**Steps:**
1. Build 3-column card grid (single column mobile)
2. Today's Events card: fetch from `/api/calendar/today`, show time + title, link to Calendar section
3. Weather card: fetch from `/api/weather`, show temp (C), condition, wind, icon. Auto-refresh 30min
4. Motivational card: daily rotating quote (keyed to date), "Today's intention" input saved to localStorage by date
5. Create quotes data file with 30+ automotive/ambition quotes (Senna, Lauda, Fangio, Enzo Ferrari, leadership)
6. Commit: "feat: add Dashboard with events, weather, and motivational cards"

---

### Task 8: API Route — Google Calendar

**Files:**
- Create: `app/api/calendar/today/route.ts`
- Create: `app/api/calendar/week/route.ts`
- Create: `lib/google.ts` (Google API helpers)

**Steps:**
1. Create Google API helper for authenticated requests using session access_token
2. `/api/calendar/today` — fetch today's events from Google Calendar API, return JSON
3. `/api/calendar/week` — fetch events for a given week (query param: startDate), return JSON
4. Handle token refresh if expired
5. Commit: "feat: add Google Calendar API routes"

---

### Task 9: API Route — Gmail

**Files:**
- Create: `app/api/gmail/inbox/route.ts`
- Create: `app/api/gmail/message/[id]/route.ts`
- Create: `app/api/gmail/unread/route.ts`

**Steps:**
1. `/api/gmail/inbox` — fetch last 15 emails from primary inbox via Gmail API
2. `/api/gmail/message/[id]` — fetch full message body by ID
3. `/api/gmail/unread` — return unread count for sidebar badge
4. Commit: "feat: add Gmail API routes for inbox, message, and unread count"

---

### Task 10: API Route — Weather

**Files:**
- Create: `app/api/weather/route.ts`

**Steps:**
1. Call OpenWeatherMap current weather API with Rome coords (41.9028, 12.4964), units=metric
2. Return: temp, condition, wind speed, icon URL
3. Commit: "feat: add OpenWeatherMap API route for Rome weather"

---

### Task 11: API Route — Anthropic Claude

**Files:**
- Create: `app/api/ai/linkedin/route.ts`
- Create: `app/api/ai/certificates/route.ts`
- Create: `app/api/ai/outreach/route.ts`
- Create: `app/api/ai/reflection/route.ts`
- Create: `lib/anthropic.ts` (shared Anthropic client)

**Steps:**
1. Create shared Anthropic client using `@anthropic-ai/sdk`
2. `/api/ai/linkedin` — POST with optional topic, system prompt as specced, model `claude-sonnet-4-20250514`
3. `/api/ai/certificates` — POST, system prompt as specced
4. `/api/ai/outreach` — POST with target + context, system prompt as specced
5. `/api/ai/reflection` — POST with weekly review answers, system prompt as specced
6. Commit: "feat: add Anthropic Claude API routes for Career Engine and reflection"

---

### Task 12: Calendar & Inbox Page

**Files:**
- Create: `app/(app)/calendar/page.tsx`
- Create: `components/calendar/weekly-view.tsx`
- Create: `components/calendar/event-block.tsx`
- Create: `components/inbox/inbox-list.tsx`
- Create: `components/inbox/email-panel.tsx`

**Steps:**
1. Split layout: calendar top half, inbox bottom half
2. Weekly view: Mon–Sun horizontal, events as time blocks, today highlighted with red border
3. Previous/next week navigation arrows
4. Inbox list: 15 emails, sender, subject, time, read/unread (bold=unread)
5. Click email → slide-out panel (right side) with full message body
6. Commit: "feat: add Calendar & Inbox page with weekly view and email panel"

---

### Task 13: Projects (Gantt) Page

**Files:**
- Create: `app/(app)/projects/page.tsx`
- Create: `components/gantt/gantt-chart.tsx`
- Create: `components/gantt/project-row.tsx`
- Create: `components/gantt/task-bar.tsx`
- Create: `components/gantt/add-project-modal.tsx`
- Create: `components/gantt/add-task-modal.tsx`
- Create: `lib/projects.ts` (localStorage CRUD + default data)

**Steps:**
1. Define data model: projects with id, name, color, tasks (id, name, startDate, endDate, completed)
2. localStorage CRUD helpers with default projects on first launch:
   - Master's Thesis — deadline July 2026
   - Horse Powertrain Application — start July 2026
   - LUISS Coursework — through July 2026
3. Gantt chart: horizontal timeline, current month default, month navigation
4. Project row groups with task sub-rows, bars colored by project color
5. Completed tasks: strikethrough + 50% opacity
6. Today line: vertical red line
7. Add Project modal: name + color picker
8. Add Task modal (per project): name, start date, end date
9. Click task bar to edit or mark complete, delete with confirmation
10. Commit: "feat: add Projects page with Gantt chart and localStorage persistence"

---

### Task 14: Career Engine Page

**Files:**
- Create: `app/(app)/career/page.tsx`
- Create: `components/career/linkedin-tab.tsx`
- Create: `components/career/certificates-tab.tsx`
- Create: `components/career/outreach-tab.tsx`
- Create: `lib/career-storage.ts` (localStorage helpers)

**Steps:**
1. Tab layout with 3 sub-tabs: LinkedIn Posts, Certificate Recommendations, Outreach Prep
2. LinkedIn tab: context block, optional topic input, "Generate Posts" button, 3 post cards with copy buttons, persist in localStorage
3. Certificates tab: "Generate Recommendations" button, 5 cards with name/platform/duration/relevance/URL, "Mark as Done" toggle, persist in localStorage
4. Outreach tab: target input, context input, "Generate Outreach" button, subject + email draft + 3 conversation starters, copy buttons
5. Loading states during API calls
6. Commit: "feat: add Career Engine with LinkedIn, Certificates, and Outreach tabs"

---

### Task 15: Weekly Review Page

**Files:**
- Create: `app/(app)/review/page.tsx`
- Create: `components/review/review-form.tsx`
- Create: `components/review/review-summary.tsx`
- Create: `components/review/week-selector.tsx`
- Create: `lib/review-storage.ts` (localStorage helpers)

**Steps:**
1. Week selector dropdown (ISO week number + year)
2. Form with 7 questions:
   - Q1-4, Q6-7: free text textareas
   - Q5: slider 1–10 (alignment score)
3. "Save Review" button → localStorage keyed by ISO week
4. After save: show summary card with all answers + date
5. "Generate Reflection" button (post-save) → calls `/api/ai/reflection`, displays 3-sentence AI reflection
6. Past reviews viewable via week selector
7. Commit: "feat: add Weekly Review page with form, summary, and AI reflection"

---

### Task 16: Final Polish & Verification

**Steps:**
1. Verify all navigation links work
2. Verify sidebar active states
3. Verify responsive behavior (mobile sidebar collapse)
4. Verify localStorage persistence across page refreshes
5. Run `npm run build` to check for TypeScript/build errors
6. Fix any issues
7. Commit: "chore: final polish and build verification"

---
