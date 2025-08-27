# WonderKids English – PRD v1

**Date:** 2025‑08‑27
**Owners:** Product (you), Tech Lead (you), PM (TBD)
**Version:** 1.0 (MVP scope)

---

## 1. Vision & Strategy

Build the most delightful **English learning platform for kids** (ages 5–12) that families trust and return to weekly. Lessons are bite‑sized, interactive, and mapped to CEFR. Parents see progress; kids feel proud via streaks, XP, and badges. A guided AI Tutor (safe, topic‑bounded) offers extra speaking and writing practice.

**North‑Star Metric:** Weekly Active Learning Minutes per child (target ≥ 60 min/week).
**Supporting KPIs:** D7 ≥ 35%, D30 ≥ 20%; Lesson completion ≥ 70%; NPS ≥ 45.

---

## 2. Target Users & Personas

* **Child Learner (5–12)**: Wants fun, quick wins, clear goals; can read basic UI; needs encouragement.
* **Parent/Guardian**: Wants safety, structure, measurable progress, time control, and value.
* **(Later) Teacher/School**: Needs class management, assignments, reports.

---

## 3. Problems & Opportunities

* Traditional apps feel repetitive and opaque; **parents can’t see what’s learned**.
* Kids churn if pacing is wrong; **need adaptive review** and bite‑sized tasks.
* **Speaking practice** is scarce; safe, guided conversations can unlock retention.

**Differentiators**

* Family‑friendly **co‑play quests** and child sub‑profiles under one account.
* Transparent **Mastery Map** aligned to CEFR skills.
* **Maker activities** (draw/record/build) that create artifacts parents can see.

---

## 4. Scope (MVP)

### 4.1 Must‑Have

1. **Auth & Profiles** (Supabase): Email/password + magic link; guardian account owns **child profiles** (1–3). Basic profile settings (name, avatar, locale).
2. **Courses → Units → Lessons → Activities** with CEFR tags (pre‑A1/A1/A2/B1). Activity types: MCQ quiz, listen‑and‑choose, order/sorting, fill‑in‑the‑blank, match pairs, read‑aloud (submission recorded), speak prompt (text response or audio placeholder).
3. **Lesson Player**: Progression, attempts, auto‑scoring; retry; feedback and confetti.
4. **Progress & Gamification**: XP, streaks, badges; mastery per lesson; **Guardian dashboard** with recent minutes, completed lessons, skills heatmap.
5. **AI Tutor (Beta)**: Topic‑bounded chat with strict safety prompt (no personal data), profanity filter, rate‑limit.
6. **Marketing site**: Landing, Features, Pricing, Blog (MDX), About, Contact; SEO‑ready.
7. **Billing (basic)**: Stripe checkout for Family plan; webhooks update subscription status.

### 4.2 Nice‑to‑Have (V1.1)

* Offline/PWA for lesson packs; teacher portal; pronunciation scoring improvement; printable worksheets.

### 4.3 Out‑of‑Scope (MVP)

* Public social features; marketplace; full school admin; native apps.

---

## 5. Success Metrics

* 60+ min weekly learning time per active child.
* ≥ 3 lessons completed per active child/week.
* ≥ 25% of active learners engage with AI Tutor at least once/week.
* Guardian dashboard viewed ≥ 1 time/week per active family.

---

## 6. User Journeys (MVP)

1. **New Parent** lands on marketing → signs up → creates 1 child → starts A1 Course → child completes first lesson (5–7 minutes) → parent sees progress.
2. **Returning Child** continues lesson → earns XP, keeps streak → unlocked badge → gets review session next day via notification/banner.
3. **Child to Tutor**: From a unit page, opens Tutor with selected topic (e.g., “Pets”) → short guided dialog (≤ 6 turns) → summary + XP bonus.

---

## 7. Functional Requirements

### 7.1 Accounts & Profiles

* Guardian can create/edit/delete child profiles (soft delete with confirmation).
* Locales supported: `en`, `vi` (expandable). Timezone auto‑detected; guardian can adjust.
* Roles: `guardian` (default), `child`, `admin` (internal tools), `teacher` (later).

### 7.2 Content Model

* Hierarchy: Course → Unit → Lesson → Activity → Question → Option.
* Each entity supports `idx` ordering and `is_published` flags. Courses map to CEFR level.
* Media via Supabase Storage (images/audio). Signed URLs on the fly.

### 7.3 Activity Types (MVP behaviors)

* **MCQ**: single/multi select; instant feedback; optional hints.
* **Listen‑and‑Choose**: play audio, choose picture/word.
* **Match Pairs**: drag pairing; success only after all pairs matched.
* **Order/Sorting**: drag list into correct order.
* **Fill‑Blank**: text input with tolerance (case/typos rules); multiple blanks supported.
* **Read‑Aloud / Speak Prompt**: capture audio (or text fallback). Store path; scoring may be heuristic initially.

### 7.4 Lesson Player

* Shows activity cards one by one; back/next; progress bar;
* `attempt` created at start; `answers` saved per question; auto‑score where possible; finish emits XP and mastery update.
* Retry entire lesson or review missed items.

### 7.5 Progress & Gamification

* **XP**: per activity; **Streak**: daily completion; **Badges**: milestones (first 5 lessons, 7‑day streak, first tutor session).
* **Guardian Dashboard**: weekly minutes, completed lessons, mastery by skill; per‑child toggle.

### 7.6 AI Tutor (Beta)

* Topics: animals, family, school, food, weather, hobbies, numbers.
* Safety: no personal data requests, no links, moderate & redirect off‑topic; logging of turns; guardian can view transcripts.
* Limits: max 6 turns/session; cooldown if >3 sessions/hour.

### 7.7 Marketing & Blog

* Landing with hero, features, testimonials, blog feed.
* Blog uses MDX; tags; RSS; SEO metadata; sitemap.

### 7.8 Billing

* Stripe checkout session from pricing; family plan (up to 3 children).
* Webhook sets `subscriptions.status` (trialing/active/past\_due/canceled). Gated content checks status.

---

## 8. Non‑Functional Requirements

* **Performance:** p95 route TTFB < 300ms (cached pages), LCP < 2.5s on 3G fast.
* **Accessibility:** WCAG 2.1 AA, keyboard nav, visible focus; reduced‑motion support.
* **Security/Privacy:** Supabase RLS on all PII; COPPA/GDPR‑K aware flows; data export/delete.
* **Internationalization:** i18n framework in place; content keys externalized.
* **Reliability:** 99.9% uptime targets for public pages; retries and idempotent webhooks.

---

## 9. Technical Requirements (Implementation‑level)

* **Frontend:** Next.js (App Router), Tailwind, shadcn/ui, TanStack Query, react‑hook‑form + Zod, next‑intl, next‑pwa (later), Framer Motion.
* **Backend:** NestJS modules: `auth`, `content`, `lessons`, `activities`, `attempts`, `progress`, `gamification`, `tutor`, `billing`.
* **Data:** Supabase Postgres + Storage + Auth with RLS. Tables: profiles, children, courses/units/lessons/activities/questions/options, attempts/answers, progress, xp\_events, badges/user\_badges, ai\_sessions/ai\_messages, blog\_posts, subscriptions.
* **Analytics:** log events `lesson_start`, `answer_submit`, `attempt_finish`, `xp_awarded`, `streak_maintained`, `tutor_message`, `checkout_started`, `subscription_updated`.
* **CI/CD:** Yarn; GitHub Actions minimal CI (lint, typecheck, build, tests).

---

## 10. Content & Seeding

* Seed one **A1 Course** with 3 units × 3 lessons × 4–6 activities/lesson.
* Audio stored under `public/audio/a1/*`; images under `public/images/a1/*` (or Supabase buckets `audio`/`images`).

---

## 11. Dependencies & Assumptions

* Supabase project available with MCP to run DDL and policies.
* Stripe account for checkout + webhooks.
* Browser support: latest Chrome/Edge/Safari + last 2 iOS versions.

---

## 12. Risks & Mitigations

* **Child privacy** → strict tutor guardrails, short sessions, transcript visibility for guardians.
* **Content production** → use templates and CSV/JSON importers; prioritize A1 only for MVP.
* **Voice quality** → start with basic recording; upgrade scoring later.

---

## 13. Milestones (MVP)

* **Sprint 1:** Auth + child profiles + basic course map + seed content.
* **Sprint 2:** Lesson player + attempts + XP/streaks.
* **Sprint 3:** Guardian dashboard + blog + pricing + Stripe basic.
* **Sprint 4:** AI Tutor (beta) + safety + analytics + polish + SEO.

---

## 14. Acceptance / DoD

* All MVP features meet AC; Lighthouse ≥ 90 (SEO/Perf/Best); a11y audit passed; RLS verified; CI green; smoke E2E happy path.

---

## 15. Open Questions

* Pricing specifics (trial length, monthly vs annual discounts)?
* Exact CEFR mapping labels per unit/lesson—need content matrix.
* Tutor provider and token budget constraints.

---

## 16. Appendices

* Activity JSON templates (to be defined in `/docs/content-templates/*`).
* RLS policy catalog.
