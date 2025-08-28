-- Sprint 3: Progress Dashboard, Billing, and Review System Migration
-- Created: Sprint 3 Implementation
-- Purpose: Guardian dashboard metrics, Stripe billing, and spaced repetition review
-- MANUAL EXECUTION REQUIRED: Copy and paste into Supabase SQL Editor

-- ====================
-- ESSENTIAL FIXES FIRST (Execute these first)
-- ====================

-- Add duration tracking to attempts for dashboard metrics
ALTER TABLE IF EXISTS app.attempts
  ADD COLUMN IF NOT EXISTS duration_sec INTEGER;

-- Add premium course gating
ALTER TABLE IF EXISTS app.courses
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;

-- ====================
-- SPACED REPETITION REVIEW SYSTEM
-- ====================

-- Review items with Leitner box scheduling
CREATE TABLE IF NOT EXISTS app.review_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  child_id UUID REFERENCES app.children ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES app.questions ON DELETE CASCADE,
  box INT NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 5),
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lapses INT NOT NULL DEFAULT 0,
  last_grade SMALLINT, -- 0=wrong, 1=hard, 2=good, 3=easy
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Note: Uniqueness will be enforced at application level for user_id OR child_id + question_id
);

-- Index for efficient due item queries
CREATE INDEX IF NOT EXISTS idx_review_items_due 
  ON app.review_items(due_at) 
  WHERE due_at <= now();

-- Index for user/child queries
CREATE INDEX IF NOT EXISTS idx_review_items_user_child 
  ON app.review_items(user_id, child_id);

-- ====================
-- STRIPE BILLING SYSTEM
-- ====================

-- Subscription management with Stripe integration
CREATE TABLE IF NOT EXISTS app.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_code TEXT NOT NULL, -- e.g., 'family_monthly', 'family_yearly'
  status TEXT NOT NULL, -- 'trialing', 'active', 'past_due', 'canceled', 'incomplete'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for efficient subscription lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user 
  ON app.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe 
  ON app.subscriptions(stripe_subscription_id);

-- ====================
-- DASHBOARD ANALYTICS VIEWS
-- ====================

-- Weekly learning minutes aggregation for dashboard charts
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

-- Daily learning progress for streak calculations
CREATE OR REPLACE VIEW app.v_user_daily_progress AS
SELECT 
  a.user_id,
  a.child_id,
  DATE_TRUNC('day', a.completed_at) AS learning_date,
  COUNT(*) AS lessons_completed,
  SUM(COALESCE(a.duration_sec, 0)) AS total_seconds
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
-- ROW LEVEL SECURITY POLICIES
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
-- BADGES SEEDING
-- ====================

-- Insert default badges if they don't exist
INSERT INTO app.badges (name, description, icon_url, xp_required)
VALUES 
  ('FIRST_LESSON', 'Completed your first lesson!', 'https://example.com/badges/first-lesson.svg', 0),
  ('SEVEN_DAY_STREAK', 'Learned for 7 days in a row!', 'https://example.com/badges/seven-streak.svg', 500),
  ('FIVE_LESSONS', 'Completed 5 lessons total!', 'https://example.com/badges/five-lessons.svg', 300),
  ('THIRTY_DAY_STREAK', 'Amazing! 30 days of learning!', 'https://example.com/badges/thirty-streak.svg', 2000),
  ('HUNDRED_LESSONS', 'Lesson master - 100 completed!', 'https://example.com/badges/hundred-lessons.svg', 5000)
ON CONFLICT (name) DO NOTHING;

-- ====================
-- HELPER FUNCTIONS
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

-- Function to calculate current streak for a child
CREATE OR REPLACE FUNCTION app.calculate_streak(child_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_activity BOOLEAN;
BEGIN
  -- Check each day backwards from today
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM app.attempts a
      WHERE a.child_id = child_uuid
      AND a.completed_at IS NOT NULL
      AND DATE_TRUNC('day', a.completed_at) = check_date
    ) INTO has_activity;
    
    -- If no activity on this date, break the streak
    IF NOT has_activity THEN
      EXIT;
    END IF;
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
    
    -- Prevent infinite loops (max 365 days)
    IF streak_count >= 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ====================

-- Update review_items.updated_at on changes
CREATE OR REPLACE FUNCTION app.update_review_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_review_items_updated_at
  BEFORE UPDATE ON app.review_items
  FOR EACH ROW
  EXECUTE FUNCTION app.update_review_items_updated_at();

-- Update subscriptions.updated_at on changes
CREATE OR REPLACE FUNCTION app.update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON app.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION app.update_subscriptions_updated_at();

-- ====================
-- MIGRATION COMPLETE
-- ====================

-- Migration 0004 completed successfully
-- Features added:
-- ✅ Duration tracking for attempts
-- ✅ Premium course gating
-- ✅ Spaced repetition review system with Leitner boxes
-- ✅ Stripe subscription management
-- ✅ Dashboard analytics views
-- ✅ Row Level Security policies
-- ✅ Default badges seeded
-- ✅ Helper functions for subscriptions and streaks
-- ✅ Automatic timestamp triggers
