-- ============================================================
-- PROVN Seed Data — mirrors existing Supabase seed
-- Run after schema.sql: psql -d provn_db -f seed.sql
-- ============================================================

-- ─────────────────────────────────────────────
-- ROADMAPS
-- ─────────────────────────────────────────────
INSERT INTO roadmaps (id, title, description) VALUES
  ('a1b2c3d4-1111-4444-8888-000000000001', 'Frontend Developer',
   'Master modern web development with HTML, CSS, JavaScript, and React.'),
  ('a1b2c3d4-2222-4444-8888-000000000002', 'Data Analyst',
   'Learn to analyze data, build visualizations, and derive insights.')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- SKILLS — Frontend Developer
-- ─────────────────────────────────────────────
INSERT INTO skills (id, roadmap_id, name, order_index) VALUES
  ('11111111-0001-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'HTML & CSS', 0),
  ('11111111-0002-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'JavaScript ES6+', 1),
  ('11111111-0003-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'React Fundamentals', 2),
  ('11111111-0004-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'State Management', 3),
  ('11111111-0005-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'Testing', 4),
  ('11111111-0006-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'Next.js', 5)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- SKILLS — Data Analyst
-- ─────────────────────────────────────────────
INSERT INTO skills (id, roadmap_id, name, order_index) VALUES
  ('22222222-0001-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'SQL Fundamentals', 0),
  ('22222222-0002-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Python for Data', 1),
  ('22222222-0003-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Data Visualization', 2),
  ('22222222-0004-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Statistical Analysis', 3),
  ('22222222-0005-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Dashboard Building', 4)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- TASKS — Frontend Developer
-- ─────────────────────────────────────────────
INSERT INTO tasks (title, description, type, difficulty, points, roadmap_id, skill_id, auto_review_enabled) VALUES
  ('Build a Portfolio Page',    'Create a responsive portfolio page',          'platform', 'beginner',     15, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0001-4000-8000-000000000001', TRUE),
  ('Clone a Landing Page',      'Recreate a modern SaaS landing page',         'platform', 'beginner',     20, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0001-4000-8000-000000000001', TRUE),
  ('Build a Todo App',          'Create a todo app with localStorage',         'platform', 'beginner',     20, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0002-4000-8000-000000000001', TRUE),
  ('Async API Fetcher',         'Build a weather app using fetch API',         'platform', 'intermediate', 25, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0002-4000-8000-000000000001', TRUE),
  ('React Component Library',   'Build reusable components',                   'platform', 'intermediate', 30, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0003-4000-8000-000000000001', TRUE),
  ('Build a Dashboard',         'Create a data dashboard',                     'industry', 'intermediate', 35, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0003-4000-8000-000000000001', FALSE),
  ('Shopping Cart',             'Build a cart with state management',          'platform', 'intermediate', 30, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0004-4000-8000-000000000001', TRUE),
  ('Test a Component',          'Write unit tests for a form',                 'platform', 'intermediate', 25, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0005-4000-8000-000000000001', TRUE),
  ('Full Stack Blog',           'Build a blog with Next.js',                   'industry', 'advanced',     50, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0006-4000-8000-000000000001', FALSE),
  ('E-commerce Site',           'Build an e-commerce site',                    'industry', 'advanced',     60, 'a1b2c3d4-1111-4444-8888-000000000001', '11111111-0006-4000-8000-000000000001', FALSE);

-- ─────────────────────────────────────────────
-- TASKS — Data Analyst
-- ─────────────────────────────────────────────
INSERT INTO tasks (title, description, type, difficulty, points, roadmap_id, skill_id, auto_review_enabled) VALUES
  ('SQL Query Challenge',       'Write complex queries',                       'platform', 'beginner',     15, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0001-4000-8000-000000000002', TRUE),
  ('Database Design',           'Design a normalized schema',                  'platform', 'intermediate', 25, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0001-4000-8000-000000000002', TRUE),
  ('Data Cleaning Pipeline',    'Clean a messy CSV dataset',                   'platform', 'beginner',     20, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0002-4000-8000-000000000002', TRUE),
  ('Pandas Analysis',           'Analyze sales data',                          'platform', 'intermediate', 30, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0002-4000-8000-000000000002', TRUE),
  ('Create Infographic',        'Build multi-chart visualization',             'platform', 'intermediate', 25, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0003-4000-8000-000000000002', TRUE),
  ('Interactive Charts',        'Build charts with Plotly',                    'platform', 'intermediate', 30, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0003-4000-8000-000000000002', TRUE),
  ('A/B Test Analysis',         'Analyze A/B test results',                    'industry', 'intermediate', 35, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0004-4000-8000-000000000002', FALSE),
  ('Sales Dashboard',           'Build an interactive dashboard',              'industry', 'advanced',     50, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0005-4000-8000-000000000002', FALSE),
  ('Executive Report',          'Create automated weekly report',              'industry', 'advanced',     45, 'a1b2c3d4-2222-4444-8888-000000000002', '22222222-0005-4000-8000-000000000002', FALSE);
