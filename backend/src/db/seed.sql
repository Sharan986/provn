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
INSERT INTO skills (id, roadmap_id, name, description, order_index) VALUES
  ('11111111-0001-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'Internet',
   '{"type":"subtopics","subtopics":[
     {"title":"How Does the Internet Work?","description":"Learn about packets, IP addresses, and how data travels across networks.","has_section":true},
     {"title":"What is HTTP?","description":"Understand the protocol that powers web communication — requests, responses, and status codes.","has_section":true},
     {"title":"What is a Domain Name?","description":"How domain names map to IP addresses via DNS.","has_section":false},
     {"title":"What is Hosting?","description":"Types of web hosting and how your site gets served to users.","has_section":false},
     {"title":"DNS and How it Works","description":"Deep dive into DNS resolution, records, and caching.","has_section":true},
     {"title":"Browsers and How They Work","description":"Rendering engines, the DOM, and how browsers turn HTML into pixels.","has_section":true}
   ]}', 0),
  ('11111111-0002-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'HTML',
   '{"type":"subtopics","subtopics":[
     {"title":"HTML Basics","description":"Tags, elements, attributes, and document structure.","has_section":true},
     {"title":"Semantic HTML","description":"Using header, nav, main, article, section, and footer for accessible markup.","has_section":true},
     {"title":"Forms and Validation","description":"Input types, form elements, and client-side validation.","has_section":true},
     {"title":"SEO Basics","description":"Meta tags, heading hierarchy, and structured data.","has_section":false},
     {"title":"Accessibility (A11y)","description":"ARIA roles, screen reader support, and WCAG compliance.","has_section":true}
   ]}', 1),
  ('11111111-0003-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'CSS',
   '{"type":"subtopics","subtopics":[
     {"title":"CSS Basics","description":"Selectors, properties, values, and the cascade.","has_section":true},
     {"title":"Box Model","description":"Content, padding, border, and margin — how elements are sized.","has_section":false},
     {"title":"Flexbox","description":"One-dimensional layouts with flexible containers and items.","has_section":true},
     {"title":"CSS Grid","description":"Two-dimensional layout system for complex page structures.","has_section":true},
     {"title":"Responsive Design","description":"Media queries, fluid typography, and mobile-first approaches.","has_section":true}
   ]}', 2),
  ('11111111-0004-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'CSS Frameworks',
   '{"type":"subtopics","subtopics":[
     {"title":"Bootstrap","description":"The most popular CSS framework with pre-built components.","has_section":true},
     {"title":"Tailwind CSS","description":"Utility-first CSS framework for rapid UI development.","has_section":true}
   ]}', 3),
  ('11111111-0005-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'JavaScript',
   '{"type":"subtopics","subtopics":[
     {"title":"JS Fundamentals","description":"Variables, data types, operators, and control flow.","has_section":true},
     {"title":"DOM Manipulation","description":"Selecting, modifying, and creating elements dynamically.","has_section":true},
     {"title":"ES6+ Features","description":"Arrow functions, destructuring, spread/rest, template literals, and modules.","has_section":true},
     {"title":"Async JavaScript","description":"Promises, async/await, and the event loop.","has_section":true},
     {"title":"Fetch API & AJAX","description":"Making HTTP requests from the browser.","has_section":false}
   ]}', 4),
  ('11111111-0006-4000-8000-000000000001', 'a1b2c3d4-1111-4444-8888-000000000001', 'React Fundamentals',
   '{"type":"subtopics","subtopics":[
     {"title":"Components & JSX","description":"Building UIs with reusable components and JSX syntax.","has_section":true},
     {"title":"Props & State","description":"Passing data between components and managing local state.","has_section":true},
     {"title":"Hooks","description":"useState, useEffect, useRef, and custom hooks.","has_section":true},
     {"title":"React Router","description":"Client-side routing for single page applications.","has_section":true},
     {"title":"Context API","description":"Global state management without external libraries.","has_section":false}
   ]}', 5)
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

-- ─────────────────────────────────────────────
-- SKILLS — Data Analyst
-- ─────────────────────────────────────────────
INSERT INTO skills (id, roadmap_id, name, description, order_index) VALUES
  ('22222222-0001-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'SQL Fundamentals',
   '{"type":"subtopics","subtopics":[
     {"title":"SELECT & Filtering","description":"Querying data with WHERE, ORDER BY, and LIMIT clauses.","has_section":true},
     {"title":"JOINs","description":"Combining data from multiple tables with INNER, LEFT, RIGHT, and FULL joins.","has_section":true},
     {"title":"Aggregation","description":"GROUP BY, HAVING, COUNT, SUM, AVG, and window functions.","has_section":true},
     {"title":"Subqueries","description":"Nested queries and correlated subqueries.","has_section":false}
   ]}', 0),
  ('22222222-0002-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Python for Data',
   '{"type":"subtopics","subtopics":[
     {"title":"Python Basics","description":"Variables, data structures, loops, and functions.","has_section":true},
     {"title":"NumPy","description":"Numerical computing with arrays and vectorized operations.","has_section":true},
     {"title":"Pandas","description":"DataFrames, series, and data manipulation.","has_section":true},
     {"title":"Data Cleaning","description":"Handling missing values, duplicates, and type conversions.","has_section":false}
   ]}', 1),
  ('22222222-0003-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Data Visualization',
   '{"type":"subtopics","subtopics":[
     {"title":"Matplotlib","description":"Creating static plots and charts with Python.","has_section":true},
     {"title":"Seaborn","description":"Statistical data visualization built on Matplotlib.","has_section":true},
     {"title":"Plotly","description":"Interactive charts and dashboards.","has_section":true}
   ]}', 2),
  ('22222222-0004-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Statistical Analysis',
   '{"type":"subtopics","subtopics":[
     {"title":"Descriptive Statistics","description":"Mean, median, mode, standard deviation, and distributions.","has_section":true},
     {"title":"Hypothesis Testing","description":"t-tests, chi-square, and p-values.","has_section":true},
     {"title":"Regression","description":"Linear and logistic regression fundamentals.","has_section":false}
   ]}', 3),
  ('22222222-0005-4000-8000-000000000002', 'a1b2c3d4-2222-4444-8888-000000000002', 'Dashboard Building',
   '{"type":"subtopics","subtopics":[
     {"title":"Tableau","description":"Drag-and-drop visual analytics platform.","has_section":true},
     {"title":"Power BI","description":"Microsoft business intelligence and reporting tool.","has_section":true},
     {"title":"Streamlit","description":"Build data apps in Python with minimal code.","has_section":false}
   ]}', 4)
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

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

-- ─────────────────────────────────────────────
-- SKILL PROJECTS (Mock Data)
-- ─────────────────────────────────────────────
INSERT INTO skill_projects (id, skill_id, title, description, difficulty, points, unlock_threshold, project_order, requirements, template_repo_url) VALUES
  -- Projects for Internet
  (gen_random_uuid(), '11111111-0001-4000-8000-000000000001', 'How the Web Works Blog', 
   'Create a blog post explaining DNS, HTTP, and Browsers.', 
   'beginner', 30, 33, 1, 
   '["Explain DNS resolution", "Describe HTTP request/response cycle", "Explain Browser rendering"]',
   'https://github.com/Sharan986/test-repo.git'),

  -- Projects for HTML
  (gen_random_uuid(), '11111111-0002-4000-8000-000000000001', 'Personal Portfolio Page', 
   'Create a basic personal portfolio website using only semantic HTML. Show your profile, skills, and contact information.', 
   'beginner', 30, 33, 1, 
   '["Use semantic tags like <header>, <main>, <footer>", "Include a working form", "Add an image with alt text", "Use at least one list (ul or ol)"]',
   'https://github.com/Sharan986/test-repo.git'),

  (gen_random_uuid(), '11111111-0002-4000-8000-000000000001', 'Multi-page Documentation', 
   'Build a multi-page technical documentation site for a topic of your choice. Focus on navigation and document structure.', 
   'intermediate', 60, 66, 2, 
   '["Create 3 interlinked HTML pages", "Use a table for data visualization", "Proper heading hierarchy (h1-h4)", "Include descriptive metadata"]',
   'https://github.com/provn-org/html-docs-template'),

  (gen_random_uuid(), '11111111-0002-4000-8000-000000000001', 'Accessible Survey Form', 
   'Design a complex survey form with a focus on accessibility (ARIA labels, fieldsets, and legends).', 
   'advanced', 100, 85, 3, 
   '["Pass accessibility audit", "Use fieldset and legend for grouping", "Include varied input types (date, range, color)", "Proper label association for every input"]',
   'https://github.com/provn-org/html-survey-template')
ON CONFLICT (id) DO NOTHING;
