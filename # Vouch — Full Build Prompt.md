# Provn — Full Build Prompt

> Build a **career readiness SaaS platform** called **Provn** using **Next.js 16** (App Router) and **Tailwind CSS v4.2**. The backend is **Supabase** (Auth + Postgres). The design language is **Neo-Brutalism**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, `use client` / `use server`) |
| Styling | Tailwind CSS v4.2 (`@import "tailwindcss"`, `@theme` block) |
| Backend | Supabase (Auth, Postgres, Row Level Security) |
| Icons | `lucide-react` |
| Font | Inter (Google Fonts) |
| Package manager | npm |

---

## Design System — Neo-Brutalism

### Palette

| Token | Hex |
|---|---|
| Black | `#000000` |
| White | `#FFFFFF` |
| Lime | `#BEF264` |
| Purple | `#C084FC` |
| Yellow | `#FDE047` |
| Background | `#FAFAFA` |
| Danger | `#ef4444` |

### Rules

- **Borders**: 2–4 px solid black on every card, button, input, badge.
- **Shadows**: Hard offset `shadow-[4px_4px_0_0_#000]` (never blurred).
- **Hover**: Translate the element toward its shadow to "press" it (`hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none`).
- **Typography**: `font-black`, `uppercase`, `tracking-tighter` for headings. `font-mono` + `text-xs` + `font-bold` for labels / metadata.
- **Border radius**: Almost none (sharp corners). Exception: avatar circles use `rounded-full`.
- **Backgrounds**: Alternate Lime / Yellow / Purple across cards for visual rhythm.
- **Selection highlight**: `selection:bg-lime selection:text-black`.
- **Global overflow**: `overflow-x: hidden` on `html` and `body` to prevent shadow bleed.

---

## Reusable Component Library

Build these as standalone `components/*.jsx` files, each accepting variant props:

| Component | Variants / Props |
|---|---|
| **Button** | `variant`: `primary` (lime bg), `outline`, `dark`, `purple`, `danger`. Props: `size`, `icon`, `iconPosition`, `fullWidth`, `disabled`. |
| **Card** | `variant`: `default` (white), `lime`, `yellow`, `purple`, `muted`, `dark`. Props: `hoverable`, `padding` (`none`, `sm`, `default`, `lg`). |
| **Badge** | `variant`: `lime`, `yellow`, `purple`, `dark`, `danger`, `default`. Props: `size` (`sm`, `default`). |
| **Input** | Label, placeholder, type, disabled. Neo-brut borders + focus ring. |
| **Modal** | Overlay + centered card. Props: `isOpen`, `onClose`, `title`, `size` (`sm`, `md`, `lg`). |
| **Navbar** | Sticky top, full-width, context-aware (landing / auth / dashboard / simulator). Mobile hamburger menu. |
| **Layout** | Wraps children with `<Navbar />`. |
| **ToastContext** | Global toast provider (success / error messages). |
| **ErrorBoundary** | Catches client-side render errors gracefully. |
| **ChartWrapper** | Responsive container for Recharts (optional). |

---

## Supabase Database Schema

### `users` table
```
id            UUID   PK (matches auth.users.id)
email         TEXT   UNIQUE
name          TEXT
role          TEXT   CHECK (student, industry, college, admin)
branch        TEXT   nullable
interests     TEXT[] nullable
current_roadmap_id  UUID FK → roadmaps.id  nullable
subscription_tier   TEXT DEFAULT 'free' CHECK (free, pro)
created_at    TIMESTAMPTZ DEFAULT now()
```

### `roadmaps` table
```
id            UUID PK
title         TEXT
description   TEXT
skills        JSONB  (array of { id, name, resources[] })
created_by    UUID FK → users.id
created_at    TIMESTAMPTZ
```

### `tasks` table
```
id            UUID PK
title         TEXT
description   TEXT
type          TEXT CHECK (platform, industry, internship, job)
difficulty    TEXT CHECK (beginner, intermediate, advanced)
points        INT DEFAULT 10
roadmap_id    UUID FK → roadmaps.id  nullable
created_by    UUID FK → users.id
created_at    TIMESTAMPTZ
```

### `submissions` table
```
id            UUID PK
task_id       UUID FK → tasks.id
student_id    UUID FK → users.id
content       TEXT   (URL to GitHub repo or hosted project)
status        TEXT CHECK (pending, approved, rejected) DEFAULT 'pending'
score         INT DEFAULT 0
feedback      TEXT nullable
reviewed_at   TIMESTAMPTZ nullable
created_at    TIMESTAMPTZ
```

### DB Trigger
`handle_new_user`: On `auth.users` INSERT → auto-insert into `users` table with `id`, `email`, `name`, `role` from `raw_user_meta_data`.

---

## Server Actions (`lib/actions/*.js`)

All files use `'use server'` directive and `createClient()` from `@/utils/supabase/server`.

### `auth.js`
- `signUp(formData)` — register with email/password/name/role, upsert fallback
- `signIn(formData)` — login, return role for redirect
- `signOut()` — clear session
- `getCurrentUser()` — get auth user + profile join
- `updateProfile(formData)` — update name/branch/interests
- `updateOnboarding({ branch, interests, currentRoadmapId, orgName })`
- `upgradeToPro()` — set `subscription_tier = 'pro'`

### `roadmaps.js`
- `getRoadmaps()` — fetch all with skills
- `getMyRoadmap()` — get the current user's assigned roadmap
- `assignRoadmap(roadmapId)` — set `current_roadmap_id`

### `tasks.js`
- `getTasks()` — fetch all with roadmap join
- `getMyRoadmapTasks()` — tasks for current user's roadmap
- `createTask(formData)` — industry users post tasks

### `submissions.js`
- `submitTask(formData)` — student submits work (URL)
- `getMySubmissions()` — student's own submissions
- `getSubmissionsForReview({ status })` — for industry reviewers
- `reviewSubmission(id, formData)` — approve/reject with score + feedback

### `scores.js`
- `getDashboardStats()` — role-aware stats (totalScore, tasksCompleted, tasksPending, etc.)
- `getStudentScore(userId)` — single student score
- `getStudentLeaderboard()` — all students ranked by total score
- `getStudentProfile(userId)` — detailed profile for industry modal
- `getPublicStudentProfile(userId)` — public portfolio data

---

## Pages & Routes

### `/` — Landing Page
- Hero section (lime background, "START YOUR CAREER." headline)
- Beta badge
- CTA buttons → register / how-it-works anchor
- Marquee ticker with animated keywords
- "The Playbook" — 3 step cards (Choose a Path → Build Projects → Get Hired)
- CTA section (black bg, "STOP READING. START DOING.")
- Footer

### `/auth` — Auth Page
- Query param `?mode=login|register`
- Step 1: Role picker (Student / Industry / College / Admin cards)
- Step 2: Email + Password form (+ Name on register)
- Redirects to `/onboarding/:role` on register, `/dashboard/:role` on login

### `/onboarding/:role` — Onboarding
- Role-specific setup flow
- Student: pick branch, interests, initial roadmap
- Industry: org name, focus area
- College: institution name
- Redirects to dashboard on completion

### `/dashboard/student` — Student Dashboard
- Welcome header with name, score badge, PRO upgrade button, Simulator button
- Current Roadmap card (skills list with resource links) — or roadmap picker if none assigned
- Stats grid: Completed / Pending / Available counts
- Available Tasks list (filterable, with SUBMIT button per task)
- Pending Reviews section
- Task Submission modal (URL input)

### `/dashboard/industry` — Industry Dashboard
- "Talent Pipeline" header with NEW TASK button
- Metrics: My Tasks / Pending Reviews / Total Students
- Pending Submissions list with REVIEW action
- Top Candidates leaderboard (search + branch filter, PROFILE + OFFER buttons)
- Create Task modal (title, description, type, difficulty, points)
- Review Submission modal (approve/reject, score slider, feedback textarea)
- Student Profile modal (stats, completed tasks, total score, CONTACT button)

### `/dashboard/college` — College Dashboard
- Student tracking view (similar structure)

### `/dashboard/admin` — Admin Dashboard
- Platform management view

### `/tasks` — Task Marketplace
- Header with task count + search bar
- Filter chips: All / Platform / Industry / Beginner / Intermediate / Advanced
- Card grid — each card shows: icon, points badge, title, description, type+difficulty+roadmap badges, SUBMIT WORK button
- Submitted tasks show as grayed-out with "SUBMITTED" state
- Submit Work modal

### `/discover` — Discovery Engine
- "DISCOVER SKILLS" header with search
- Filter chips: ALL / FRONTEND / BACKEND / DATA / MOBILE / DEVOPS
- Roadmap cards showing: difficulty badge, demand badge, title, description, curriculum preview (skills list), duration, enrolled count, START LEARNING button
- Bottom CTA: "REQUEST A NEW ROADMAP"

### `/simulator` — Industry Simulator
- Probation gate: must complete ≥1 task to unlock
- Split-pane IDE: left = challenge brief, right = code editor + terminal output
- Challenge tabs (numbered) across header
- Challenges have: title, client name, problem statement, requirements, example input
- RUN button validates code, SUBMIT button sends to backend
- Premium challenges gated behind Pro subscription
- Mobile: toggle between BRIEF and CODE panels

### `/portfolio/[id]` — Public Student Portfolio
- Black banner with avatar (initials), name, PRO badge, branch, email
- Stats row: roadmap name, readiness score, tasks completed
- Left column: Skills tags, Interests, Contact (email, HIRE button, SHARE button)
- Right column: Completed task cards with scores, verified badges, feedback quotes, VIEW WORK links
- Pending submissions section

### `/pro` — Pro Pricing Page
- Two-tier comparison: Basic (free) vs Pro ($9/month)
- Feature checklists for each tier
- "MOST POPULAR" tag on Pro card
- UPGRADE NOW button (mock checkout → sets `subscription_tier = 'pro'`)
- Already-pro users see trophy celebration + redirect

---

## Auth & Middleware

- Supabase SSR client via `@supabase/ssr`
- Server-side `createClient()` in `utils/supabase/server.js`
- Client-side `createClient()` in `utils/supabase/client.js`
- Middleware checks auth session and protects `/dashboard/*`, `/simulator`, `/discover`, `/tasks` routes
- Unauthenticated users redirected to `/auth?mode=login`
- Role-based dashboard routing

---

## Providers (`app/providers.jsx`)

Wraps children with:
- `<ToastProvider>` — global toast notifications
- `<div className="app-container">` — layout wrapper

## Root Layout (`app/layout.jsx`)

- Imports `globals.css`
- Google Font: Inter
- Meta tags + title: "Provn — Campus to Careers"
- Wraps `{children}` with `<Providers>` → `<Layout>` (which renders `<Navbar />`)
