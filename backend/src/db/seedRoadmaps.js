const { loadEnv } = require('../loadEnv');
loadEnv();
const pool = require('./pool');


const roadmaps = [
  {
    title: 'Fullstack Web Developer',
    description: 'Learn to build complete web applications from scratch using modern technologies like React, Node.js, and PostgreSQL.',
    curriculum: [
      'HTML/CSS Fundamentals',
      'Advanced JavaScript',
      'React & Frontend Architecture',
      'Node.js & Express Backend',
      'Database Design with SQL',
      'Deployment & DevOps'
    ]
  },
  {
    title: 'AI & Machine Learning Engineer',
    description: 'Master the fundamentals of AI, data science, and deep learning to build intelligent systems.',
    curriculum: [
      'Python for Data Science',
      'Linear Algebra & Calculus',
      'Supervised Learning',
      'Unsupervised Learning',
      'Neural Networks & Deep Learning',
      'NLP & Computer Vision'
    ]
  },
  {
    title: 'DevOps & Cloud Engineer',
    description: 'Focus on infrastructure, automation, and scaling applications in the cloud.',
    curriculum: [
      'Linux Administration',
      'Docker & Containerization',
      'Kubernetes Orchestration',
      'CI/CD Pipelines',
      'AWS/Azure Cloud Services',
      'Infrastructure as Code (Terraform)'
    ]
  },
  {
    title: 'Mobile App Developer (React Native)',
    description: 'Build cross-platform mobile apps for iOS and Android using React Native.',
    curriculum: [
      'JavaScript ES6+',
      'React Fundamentals',
      'React Native Basics',
      'Navigation & State Management',
      'Native Modules & APIs',
      'App Store Deployment'
    ]
  },
  {
    title: 'Cybersecurity Analyst',
    description: 'Learn to protect systems and networks from digital attacks and security breaches.',
    curriculum: [
      'Networking Protocols',
      'Ethical Hacking Fundamentals',
      'Penetration Testing',
      'Security Operations Center (SOC)',
      'Cryptography',
      'Incident Response'
    ]
  }
];

async function seed() {
  console.log('--- Starting Roadmap Seeding ---');
  try {
    for (const rm of roadmaps) {
      const { rows } = await pool.query('SELECT id FROM roadmaps WHERE title = $1', [rm.title]);
      if (rows.length > 0) {
        console.log(`Roadmap "${rm.title}" already exists. Skipping.`);
        continue;
      }

      console.log(`Seeding roadmap: ${rm.title}...`);
      await pool.query(
        `INSERT INTO roadmaps (title, description, curriculum)
         VALUES ($1, $2, $3)`,
        [rm.title, rm.description, JSON.stringify(rm.curriculum)]
      );
    }

    console.log('--- Seeding Completed Successfully ---');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await pool.end();
  }
}

seed();
