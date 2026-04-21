-- ============================================================
-- EXAMPLE: Seed skills for "Frontend Developer" roadmap
-- Replace <ROADMAP_UUID> with your actual roadmap ID.
-- ============================================================

-- Skill 1: Internet (with subtopics)
INSERT INTO skills (roadmap_id, name, description, order_index) VALUES (
  '<ROADMAP_UUID>',
  'Internet',
  '{
    "type": "subtopics",
    "subtopics": [
      {
        "title": "How does the Internet work?",
        "description": "The Internet is a global network of interconnected computers that communicate using standardized protocols. Data travels through a complex infrastructure of routers, switches, and fiber optic cables spanning the globe. When you send a request, it gets broken into packets, routed through multiple nodes, and reassembled at the destination. Understanding this foundation is critical for any frontend developer."
      },
      {
        "title": "What is HTTP?",
        "description": "HTTP (HyperText Transfer Protocol) is the foundation of data communication on the web. It defines how messages are formatted and transmitted between web browsers and servers. HTTP follows a request-response model: the client sends a request with a method (GET, POST, PUT, DELETE), headers, and optionally a body, and the server responds with a status code and data."
      },
      {
        "title": "What is a Domain Name?",
        "description": "A domain name is a human-readable address used to identify a website on the Internet, like provn.live. Behind the scenes, the Domain Name System (DNS) translates domain names into IP addresses that computers use to locate servers. Understanding domains, DNS records (A, CNAME, MX), and how resolution works is essential for deploying web applications."
      },
      {
        "title": "What is Hosting?",
        "description": "Web hosting is a service that allows you to publish your website on the Internet. Hosting providers allocate server space, bandwidth, and computing resources for your application. Common options include shared hosting, VPS (Virtual Private Server), cloud hosting (AWS, DigitalOcean, Vercel), and serverless platforms. Each has trade-offs in cost, control, and scalability."
      }
    ]
  }'::jsonb,
  0
);

-- Skill 2: HTML (simple text)
INSERT INTO skills (roadmap_id, name, description, order_index) VALUES (
  '<ROADMAP_UUID>',
  'HTML',
  '{"type": "text", "content": "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It provides the structural foundation of web content using elements like headings, paragraphs, links, images, forms, and semantic tags. Modern HTML5 introduced new elements like <article>, <section>, <nav>, and APIs for multimedia, storage, and more."}'::jsonb,
  1
);

-- Skill 3: CSS (simple text)
INSERT INTO skills (roadmap_id, name, description, order_index) VALUES (
  '<ROADMAP_UUID>',
  'CSS',
  '{"type": "text", "content": "CSS (Cascading Style Sheets) controls the visual presentation of HTML elements. It handles layout (Flexbox, Grid), typography, colors, animations, responsive design (media queries), and more. Modern CSS includes custom properties (variables), container queries, and powerful selectors that reduce the need for JavaScript-based styling."}'::jsonb,
  2
);

-- Skill 4: JavaScript (simple text)
INSERT INTO skills (roadmap_id, name, description, order_index) VALUES (
  '<ROADMAP_UUID>',
  'JavaScript',
  '{"type": "text", "content": "JavaScript is the programming language of the web. It enables interactive behavior, DOM manipulation, event handling, asynchronous programming (Promises, async/await), and API communication (fetch). ES6+ features like arrow functions, destructuring, modules, and template literals are essential for modern frontend development."}'::jsonb,
  3
);

-- Skill 5: Version Control (simple text)
INSERT INTO skills (roadmap_id, name, description, order_index) VALUES (
  '<ROADMAP_UUID>',
  'Version Control (Git & GitHub)',
  '{"type": "text", "content": "Version control tracks changes to your codebase over time. Git is the most widely used system — learn branching, merging, rebasing, and resolving conflicts. GitHub adds collaboration features like pull requests, code reviews, issues, and CI/CD pipelines. Every professional developer uses Git daily."}'::jsonb,
  4
);

-- Skill 6: Learn a Framework (with subtopics)
INSERT INTO skills (roadmap_id, name, description, order_index) VALUES (
  '<ROADMAP_UUID>',
  'Learn a Framework',
  '{
    "type": "subtopics",
    "subtopics": [
      {
        "title": "React",
        "description": "React is a JavaScript library for building user interfaces, developed by Meta. It uses a component-based architecture where UI is broken into reusable pieces. Key concepts include JSX, state management (useState, useReducer), effects (useEffect), context API, and hooks. React powers millions of production apps including Facebook, Instagram, and Netflix."
      },
      {
        "title": "Vue.js",
        "description": "Vue.js is a progressive JavaScript framework known for its gentle learning curve and excellent documentation. It features a template-based syntax, reactive data binding, computed properties, and a built-in state management solution (Pinia/Vuex). Vue is popular in Asia and among developers who prefer a more opinionated but flexible framework."
      },
      {
        "title": "Angular",
        "description": "Angular is a full-featured framework by Google for building large-scale applications. It uses TypeScript, dependency injection, RxJS for reactive programming, and a powerful CLI. Angular is opinionated about project structure, which makes it ideal for enterprise applications where consistency across large teams is important."
      }
    ]
  }'::jsonb,
  5
);
