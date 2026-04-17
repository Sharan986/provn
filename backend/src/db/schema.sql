-- ============================================================
-- PROVN Full Schema — PostgreSQL
-- Run once: psql -d provn_db -f schema.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. ROADMAPS (no FK deps)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmaps (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  description   TEXT,
  curriculum    JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 2. USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email               TEXT        UNIQUE NOT NULL,
  password_hash       TEXT        NOT NULL,
  name                TEXT,
  role                TEXT        CHECK (role IN ('student','industry','college','admin')) DEFAULT 'student',
  branch              TEXT,
  interests           TEXT[]      DEFAULT '{}',
  current_roadmap_id  UUID        REFERENCES roadmaps(id) ON DELETE SET NULL,
  subscription_tier   TEXT        CHECK (subscription_tier IN ('free','pro')) DEFAULT 'free',
  company_name        TEXT,
  avatar_url          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 3. SKILLS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id   UUID    NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  name         TEXT    NOT NULL,
  description  TEXT,
  position_x   FLOAT   DEFAULT 0,
  position_y   FLOAT   DEFAULT 0,
  order_index  INT     DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 4. TASKS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT    NOT NULL,
  description           TEXT,
  type                  TEXT    CHECK (type IN ('platform','industry')) DEFAULT 'platform',
  difficulty            TEXT    CHECK (difficulty IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
  points                INT     DEFAULT 10,
  roadmap_id            UUID    REFERENCES roadmaps(id) ON DELETE SET NULL,
  skill_id              UUID    REFERENCES skills(id) ON DELETE SET NULL,
  created_by            UUID    REFERENCES users(id) ON DELETE SET NULL,
  auto_review_enabled   BOOLEAN DEFAULT TRUE,
  requirements          JSONB,
  test_criteria         JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 5. SUBMISSIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id        UUID    NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  student_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content        TEXT,
  status         TEXT    CHECK (status IN ('pending','approved','needs_revision','rejected')) DEFAULT 'pending',
  score          INT     DEFAULT 0,
  feedback       TEXT,
  reviewed_by    TEXT,
  review_details JSONB,
  reviewed_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 6. SIMULATOR CHALLENGES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulator_challenges (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id          UUID    REFERENCES roadmaps(id) ON DELETE CASCADE,
  title               TEXT    NOT NULL,
  description         TEXT,
  difficulty          TEXT    CHECK (difficulty IN ('beginner','intermediate','advanced')) DEFAULT 'intermediate',
  category            TEXT,
  points              INT     DEFAULT 100,
  time_limit_minutes  INT     DEFAULT 30,
  problem_statement   TEXT    NOT NULL,
  starter_code        TEXT,
  test_cases          JSONB,
  hints               JSONB,
  solution            TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 7. SIMULATOR ATTEMPTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS simulator_attempts (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id        UUID    NOT NULL REFERENCES simulator_challenges(id) ON DELETE CASCADE,
  roadmap_id          UUID    REFERENCES roadmaps(id) ON DELETE SET NULL,
  code_submitted      TEXT,
  test_results        JSONB,
  tests_passed        INT     DEFAULT 0,
  total_tests         INT     DEFAULT 0,
  score               INT     DEFAULT 0,
  time_taken_seconds  INT,
  status              TEXT    CHECK (status IN ('in_progress','completed','timeout')) DEFAULT 'in_progress',
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 8. READINESS SCORES
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS readiness_scores (
  id                              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id                      UUID          NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  task_score                      INT           DEFAULT 0,
  simulator_score                 INT           DEFAULT 0,
  quality_score                   INT           DEFAULT 0,
  total_score                     INT           DEFAULT 0,
  tasks_completed                 INT           DEFAULT 0,
  tasks_total                     INT           DEFAULT 0,
  simulator_challenges_completed  INT           DEFAULT 0,
  simulator_challenges_total      INT           DEFAULT 0,
  avg_review_rating               DECIMAL(3,2)  DEFAULT 0,
  weak_areas                      JSONB,
  strong_areas                    JSONB,
  last_calculated_at              TIMESTAMPTZ   DEFAULT NOW(),
  created_at                      TIMESTAMPTZ   DEFAULT NOW(),
  UNIQUE(user_id, roadmap_id)
);

-- ─────────────────────────────────────────────
-- 9. JOB POSTINGS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_postings (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID    REFERENCES users(id) ON DELETE CASCADE,
  title               TEXT    NOT NULL,
  description         TEXT,
  job_type            TEXT    CHECK (job_type IN ('full-time','part-time','internship','contract')) DEFAULT 'full-time',
  location            TEXT,
  is_remote           BOOLEAN DEFAULT FALSE,
  salary_min          INT,
  salary_max          INT,
  salary_currency     TEXT    DEFAULT 'INR',
  required_roadmaps   UUID[]  DEFAULT '{}',
  min_readiness_score INT     DEFAULT 0,
  required_skills     TEXT[]  DEFAULT '{}',
  experience_level    TEXT    CHECK (experience_level IN ('fresher','junior','mid','senior')) DEFAULT 'fresher',
  status              TEXT    CHECK (status IN ('draft','active','paused','closed')) DEFAULT 'active',
  applications_count  INT     DEFAULT 0,
  deadline            TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 10. TASK OPENINGS (Paid Gigs)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS task_openings (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID    REFERENCES users(id) ON DELETE CASCADE,
  title               TEXT    NOT NULL,
  description         TEXT,
  category            TEXT,
  deliverables        TEXT,
  budget_min          INT,
  budget_max          INT,
  budget_currency     TEXT    DEFAULT 'INR',
  payment_type        TEXT    CHECK (payment_type IN ('fixed','hourly')) DEFAULT 'fixed',
  required_roadmaps   UUID[]  DEFAULT '{}',
  min_readiness_score INT     DEFAULT 0,
  estimated_hours     INT,
  deadline            TIMESTAMPTZ,
  status              TEXT    CHECK (status IN ('open','in_progress','completed','cancelled')) DEFAULT 'open',
  assigned_to         UUID    REFERENCES users(id) ON DELETE SET NULL,
  applications_count  INT     DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- 11. APPLICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id                        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id                    UUID    REFERENCES job_postings(id) ON DELETE CASCADE,
  task_opening_id           UUID    REFERENCES task_openings(id) ON DELETE CASCADE,
  cover_letter              TEXT,
  resume_url                TEXT,
  portfolio_url             TEXT,
  readiness_score_snapshot  INT,
  status                    TEXT    CHECK (status IN ('pending','reviewed','shortlisted','rejected','hired')) DEFAULT 'pending',
  reviewed_at               TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  -- Must apply to exactly one type
  CHECK (
    (job_id IS NOT NULL AND task_opening_id IS NULL) OR
    (job_id IS NULL AND task_opening_id IS NOT NULL)
  )
);

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email              ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role               ON users(role);
CREATE INDEX IF NOT EXISTS idx_skills_roadmap           ON skills(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_roadmap            ON tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_skill              ON tasks(skill_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student      ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_task         ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status       ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_sim_challenges_roadmap   ON simulator_challenges(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_sim_attempts_user        ON simulator_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_sim_attempts_challenge   ON simulator_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_readiness_user           ON readiness_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_readiness_roadmap        ON readiness_scores(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_readiness_total          ON readiness_scores(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_job_postings_status      ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_company     ON job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_task_openings_status     ON task_openings(status);
CREATE INDEX IF NOT EXISTS idx_applications_user        ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job         ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_task        ON applications(task_opening_id);
