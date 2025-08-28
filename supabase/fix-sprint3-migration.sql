-- Sprint 3 Critical Bug Fixes
-- Execute this in Supabase SQL Editor to fix the identified issues
-- Created: 2025-01-28

-- ====================
-- ESSENTIAL FIXES FOR SPRINT 3 BUGS
-- ====================

-- Fix 1: Add duration_sec column to attempts table
-- This fixes the dashboard summary API
ALTER TABLE IF EXISTS app.attempts
  ADD COLUMN IF NOT EXISTS duration_sec INTEGER;

-- Fix 2: Add is_premium column to courses table
-- This enables premium content gating
ALTER TABLE IF EXISTS app.courses
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;

-- Fix 3: Create review_items table
-- This enables the spaced repetition review system
CREATE TABLE IF NOT EXISTS app.review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  child_id UUID REFERENCES app.children ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES app.questions ON DELETE CASCADE,
  box INT NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 5),
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lapses INT NOT NULL DEFAULT 0,
  last_grade SMALLINT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fix 4: Create subscriptions table
-- This enables billing functionality
CREATE TABLE IF NOT EXISTS app.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ====================
-- BASIC VIEWS (Optional - for dashboard analytics)
-- ====================

-- Weekly learning minutes aggregation
CREATE OR REPLACE VIEW app.v_user_minutes_week AS
SELECT
  a.user_id,
  a.child_id,
  DATE_TRUNC('week', COALESCE(a.completed_at, a.started_at)) AS week,
  SUM(COALESCE(a.duration_sec, 0)) AS total_seconds,
  ROUND(SUM(COALESCE(a.duration_sec, 0)) / 60.0, 1) AS total_minutes
FROM app.attempts a
WHERE a.completed_at IS NOT NULL
GROUP BY 1, 2, 3;

-- Lesson mastery levels for dashboard heatmap
CREATE OR REPLACE VIEW app.v_lesson_mastery AS
SELECT
  p.child_id,
  p.lesson_id,
  l.title AS lesson_title,
  l.unit_id,
  u.title AS unit_title,
  u.course_id,
  c.title AS course_title,
  p.mastery_level,
  COUNT(a.id) AS attempt_count,
  AVG(a.score_percentage) AS avg_score,
  MAX(a.completed_at) AS last_completed
FROM app.progress p
JOIN app.lessons l ON l.id = p.lesson_id
JOIN app.units u ON u.id = l.unit_id
JOIN app.courses c ON c.id = u.course_id
LEFT JOIN app.attempts a ON a.lesson_id = p.lesson_id AND a.child_id = p.child_id
GROUP BY 1, 2, 3, 4, 5, 6, 7, 8;

-- ====================
-- BASIC FUNCTIONS (Optional - for advanced features)
-- ====================

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION app.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM app.subscriptions s
    WHERE s.user_id = user_uuid
    AND s.status IN ('trialing', 'active')
    AND (s.current_period_end IS NULL OR s.current_period_end > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- RLS POLICIES
-- ====================

-- Enable RLS on new tables
ALTER TABLE app.review_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.subscriptions ENABLE ROW LEVEL SECURITY;

-- Review items: Users can only access their own or their children's review items
CREATE POLICY "review_items_owner_policy" ON app.review_items
  FOR ALL USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM app.children c
      WHERE c.id = app.review_items.child_id
      AND c.guardian_id = auth.uid()
    )
  );

-- Subscriptions: Users can only access their own subscriptions
CREATE POLICY "subscriptions_owner_policy" ON app.subscriptions
  FOR ALL USING (user_id = auth.uid());

-- ====================
-- EXECUTION COMPLETE
-- ====================

-- After executing this script:
-- 1. Dashboard summary API should work
-- 2. Premium content gating will be enabled
-- 3. Review system will be functional
-- 4. Billing APIs will have database support

-- Note: Stripe integration still requires environment variables to be configured
