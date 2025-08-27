# WonderKids English – Epics & User Stories v1

> This file tracks epics → stories with acceptance criteria (AC) and DoD. Use with the PRD.

## Estimation & Labels

* Estimation: **S/M/L/XL** (calibrate later).
* Labels: `frontend`, `backend`, `supabase`, `content`, `a11y`, `seo`, `payments`, `tutor`.

---

## Epic A – Foundation & Auth (MVP)

**Goal:** Parent can create an account, add children, and access the dashboard.

* **A1 – Sign up/sign in with Supabase** (S, frontend/backend)
  **As** a guardian **I want** to create an account using email/password or magic link **so that** I can access the app.
  **AC:** create, verify, sign in/out; error states; rate‑limit.
  **DoD:** unit tests; e2e happy path.

* **A2 – Profiles: guardian + child CRUD** (M)
  **AC:** add/edit/delete child; avatar upload to storage; locale setting; RLS verified.

* **A3 – App shell & navigation** (S)
  **AC:** responsive header/nav, footer; keyboard nav; focus rings; 404.

---

## Epic B – Content & Player (MVP)

**Goal:** Kids can complete interactive lessons aligned to CEFR.

* **B1 – Course map (grid) & CEFR labels** (M)
  **AC:** list published courses → units → lessons; locked states; progress badges.

* **B2 – Lesson player (core)** (L)
  **AC:** activity carousel; progress bar; next/back; persistence of attempts; autosave.

* **B3 – Activity types** (XL)

  * **B3.1 MCQ** (S): single/multi; instant feedback.
  * **B3.2 Listen‑and‑Choose** (M): audio playback, choices, retries.
  * **B3.3 Match Pairs** (M): drag to pair; success all‑correct.
  * **B3.4 Order/Sorting** (M): drag reorder; validation.
  * **B3.5 Fill‑Blank** (M): multiple blanks; tolerance rules.
  * **B3.6 Read‑Aloud / Speak Prompt (basic)** (M): audio capture + upload; minimal scoring.

* **B4 – Storage & media management** (M)
  **AC:** signed URLs; buckets with policies; 200ms p95 load after cache warm.

* **B5 – Review mode (spaced repetition)** (M)
  **AC:** surface missed items 24–72h later; queue page; XP bonus.

---

## Epic C – Progress & Gamification (MVP)

**Goal:** Kids stay motivated; parents see progress.

* **C1 – Attempts & auto‑scoring** (M)
  **AC:** on submit → save `answers` w/ correctness; partial credit rules per type.

* **C2 – XP, streaks, badges** (M)
  **AC:** XP journal; 7‑day streak UI; 3 initial badges; confetti animation.

* **C3 – Guardian dashboard** (M)
  **AC:** minutes learned, completed lessons, mastery heatmap; per‑child filter; weekly email.

---

## Epic D – AI Tutor (Beta, MVP)

**Goal:** Safe, fun conversation practice.

* **D1 – Start session with topic** (M)
  **AC:** create `ai_sessions`; safety‑prompted; 6‑turn limit; end summary.

* **D2 – Moderation & rate limit** (S)
  **AC:** block list; toxicity check; cooldown after 3 sessions/hour; log moderation.

* **D3 – Guardian transcript view/export** (S)
  **AC:** show messages; export to email as text/MD.

---

## Epic E – Monetization (MVP)

**Goal:** Convert to paid; keep gates simple.

* **E1 – Pricing page + checkout** (M)
  **AC:** Stripe checkout for Family plan; success/cancel routes; trial.

* **E2 – Stripe webhooks → Subscriptions** (M)
  **AC:** DB `subscriptions` status updated; gate course access accordingly.

---

## Epic F – Marketing & SEO (MVP)

**Goal:** Acquire traffic and convert.

* **F1 – Landing/Features/About/Contact** (M)
  **AC:** 90+ Lighthouse (Perf/SEO/Best); OG images; sitemap; robots.

* **F2 – Blog (MDX)** (M)
  **AC:** list, tags, RSS; author box; simple CMS import.

---

## Epic G – Teacher Mode (Post‑MVP)

**Goal:** Classroom support for growth channels.

* **G1 – Class creation & invites** (L)
* **G2 – Assignments & grading** (XL)
* **G3 – Reports (per student & class)** (M)

---

## Sprint Plan (first 2 sprints)

**Sprint 1**: A1, A2, A3, B1, seed content; initial marketing pages.
**Sprint 2**: B2, B3.1–B3.3, C1, C2 basics, F2.

---

## Definition of Done (global)

* Meets AC; type‑safe; tests updated; no console errors; a11y pass; RLS verified; Lighthouse ≥ 90 on marketing; CI green.
