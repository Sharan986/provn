/**
 * Seeds example MCQs and Projects for the first skill found in the database.
 *
 * Usage: node src/db/seedSkillTests.js
 */
require('../loadEnv').loadEnv();
const pool = require('./pool');

const SEED_MCQS = [
  {
    question: 'What does HTML stand for?',
    options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'],
    correctOption: 0,
    explanation: 'HTML stands for Hyper Text Markup Language.'
  },
  {
    question: 'Which HTML element is used for the largest heading?',
    options: ['<heading>', '<h6>', '<h1>', '<head>'],
    correctOption: 2,
    explanation: '<h1> defines the largest heading in HTML.'
  },
  {
    question: 'What is the correct HTML element for inserting a line break?',
    options: ['<break>', '<lb>', '<br>', '<newline>'],
    correctOption: 2,
    explanation: '<br> is the correct element for a line break.'
  },
  {
    question: 'Which CSS property controls the text size?',
    options: ['text-style', 'font-size', 'text-size', 'font-style'],
    correctOption: 1,
    explanation: 'font-size controls the size of text in CSS.'
  },
  {
    question: 'How do you add a background color in CSS?',
    options: ['background-color', 'bgcolor', 'color-background', 'bg-color'],
    correctOption: 0,
    explanation: 'background-color is the CSS property for background color.'
  },
  {
    question: 'Which CSS property is used to change the font of an element?',
    options: ['font-style', 'font-weight', 'font-family', 'font-type'],
    correctOption: 2,
    explanation: 'font-family specifies the font for an element.'
  },
  {
    question: 'What does CSS stand for?',
    options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
    correctOption: 1,
    explanation: 'CSS stands for Cascading Style Sheets.'
  },
  {
    question: 'Which HTML attribute is used to define inline styles?',
    options: ['class', 'styles', 'style', 'font'],
    correctOption: 2,
    explanation: 'The style attribute is used for inline CSS.'
  },
  {
    question: 'Which is the correct CSS syntax?',
    options: ['body:color=black;', '{body;color:black;}', 'body {color: black;}', '{body:color=black;}'],
    correctOption: 2,
    explanation: 'CSS syntax follows the pattern: selector {property: value;}'
  },
  {
    question: 'How do you select an element with id "demo" in CSS?',
    options: ['.demo', '*demo', '#demo', 'demo'],
    correctOption: 2,
    explanation: 'The # symbol is used to select elements by id.'
  },
  {
    question: 'Which property is used to change the left margin of an element?',
    options: ['margin-left', 'padding-left', 'indent', 'left-margin'],
    correctOption: 0,
    explanation: 'margin-left controls the left margin.'
  },
  {
    question: 'What is the default value of the position property?',
    options: ['relative', 'fixed', 'absolute', 'static'],
    correctOption: 3,
    explanation: 'The default position value is static.'
  },
  {
    question: 'Which CSS property controls the space between lines of text?',
    options: ['spacing', 'line-height', 'text-spacing', 'line-spacing'],
    correctOption: 1,
    explanation: 'line-height controls the space between lines.'
  },
  {
    question: 'Which HTML tag is used to define an internal style sheet?',
    options: ['<script>', '<css>', '<style>', '<link>'],
    correctOption: 2,
    explanation: '<style> defines internal CSS.'
  },
  {
    question: 'Which display value makes an element a flex container?',
    options: ['display: flexbox', 'display: flex', 'display: inline-flex-container', 'display: block-flex'],
    correctOption: 1,
    explanation: 'display: flex makes the element a flex container.'
  }
];

const SEED_PROJECTS = [
  {
    title: 'Personal Profile Card',
    description: 'Create a fully responsive personal profile card using semantic HTML and flexbox. Include a profile image, bio section, and social links.',
    difficulty: 'beginner',
    points: 30,
    unlockThreshold: 33,
    projectOrder: 1,
    requirements: ['Use semantic HTML5 tags', 'Implement flexbox layout', 'Make it responsive', 'Include hover effects']
  },
  {
    title: 'Responsive Landing Page',
    description: 'Build a modern landing page for a SaaS product with hero section, features grid, testimonials, and footer. Must be fully responsive.',
    difficulty: 'intermediate',
    points: 60,
    unlockThreshold: 66,
    projectOrder: 2,
    requirements: ['CSS Grid for layout', 'Mobile-first approach', 'Smooth scroll navigation', 'CSS animations', 'Dark/light sections']
  },
  {
    title: 'Interactive Dashboard UI',
    description: 'Develop a complex admin dashboard UI with sidebar navigation, data cards, charts placeholder, and responsive tables using pure HTML & CSS.',
    difficulty: 'advanced',
    points: 100,
    unlockThreshold: 85,
    projectOrder: 3,
    requirements: ['Complex CSS Grid layout', 'Collapsible sidebar', 'Responsive data tables', 'CSS custom properties', 'Accessible navigation']
  }
];

async function seed() {
  try {
    // Find the first skill in the DB
    const { rows: skills } = await pool.query(
      'SELECT id, name FROM skills ORDER BY created_at ASC LIMIT 1'
    );

    if (!skills.length) {
      console.error('No skills found in database. Please seed roadmaps/skills first.');
      process.exit(1);
    }

    const skillId = skills[0].id;
    console.log(`Seeding MCQs and Projects for skill: "${skills[0].name}" (${skillId})`);

    // Check if MCQs already exist for this skill
    const { rows: existingMcqs } = await pool.query(
      'SELECT COUNT(*)::INT AS count FROM skill_mcqs WHERE skill_id = $1',
      [skillId]
    );

    if (existingMcqs[0].count > 0) {
      console.log(`  ⚠ ${existingMcqs[0].count} MCQs already exist for this skill. Skipping MCQ seed.`);
    } else {
      for (let i = 0; i < SEED_MCQS.length; i++) {
        const mcq = SEED_MCQS[i];
        await pool.query(
          `INSERT INTO skill_mcqs (skill_id, question, options, correct_option, explanation, order_index)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [skillId, mcq.question, JSON.stringify(mcq.options), mcq.correctOption, mcq.explanation, i]
        );
      }
      console.log(`  ✅ Inserted ${SEED_MCQS.length} MCQs`);
    }

    // Check if projects already exist
    const { rows: existingProjects } = await pool.query(
      'SELECT COUNT(*)::INT AS count FROM skill_projects WHERE skill_id = $1',
      [skillId]
    );

    if (existingProjects[0].count > 0) {
      console.log(`  ⚠ ${existingProjects[0].count} projects already exist for this skill. Skipping project seed.`);
    } else {
      for (const proj of SEED_PROJECTS) {
        await pool.query(
          `INSERT INTO skill_projects (skill_id, title, description, difficulty, points, unlock_threshold, project_order, requirements)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [skillId, proj.title, proj.description, proj.difficulty, proj.points, proj.unlockThreshold, proj.projectOrder, JSON.stringify(proj.requirements)]
        );
      }
      console.log(`  ✅ Inserted ${SEED_PROJECTS.length} projects`);
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
