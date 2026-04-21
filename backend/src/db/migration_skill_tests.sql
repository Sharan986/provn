-- ============================================================
-- Migration: Skill Tests & Gated Projects
-- Run: psql -d provn -f migration_skill_tests.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. SKILL MCQs — 15 questions per skill/topic
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_mcqs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id        UUID        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  question        TEXT        NOT NULL,
  options         JSONB       NOT NULL,        -- array of 4 strings
  correct_option  INT         NOT NULL CHECK (correct_option >= 0 AND correct_option <= 3),
  explanation     TEXT,
  order_index     INT         DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. SKILL TEST ATTEMPTS — student test records
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_test_attempts (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id            UUID          NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  score               INT           NOT NULL DEFAULT 0,   -- correct answers count (0-15)
  total_questions      INT           NOT NULL DEFAULT 15,
  percentage          DECIMAL(5,2)  NOT NULL DEFAULT 0,
  answers             JSONB,                              -- [{questionId, selected, correct}]
  time_taken_seconds  INT,
  started_at          TIMESTAMPTZ   DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ   DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. SKILL PROJECTS — gated by test scores
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_projects (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id          UUID        NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  description       TEXT,
  difficulty        TEXT        CHECK (difficulty IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
  points            INT         DEFAULT 50,
  unlock_threshold  INT         NOT NULL CHECK (unlock_threshold IN (33, 66, 85)),
  project_order     INT         NOT NULL CHECK (project_order IN (1, 2, 3)),
  requirements      JSONB,       -- e.g. ["Use semantic HTML", "Responsive design"]
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. SKILL PROJECT SUBMISSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_project_submissions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID        NOT NULL REFERENCES skill_projects(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,   -- URL to project
  status          TEXT        CHECK (status IN ('pending','approved','needs_revision','rejected')) DEFAULT 'pending',
  score           INT         DEFAULT 0,
  feedback        TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_skill_mcqs_skill        ON skill_mcqs(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_test_user         ON skill_test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_test_skill        ON skill_test_attempts(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_projects_skill    ON skill_projects(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_proj_sub_user     ON skill_project_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_proj_sub_project  ON skill_project_submissions(project_id);
