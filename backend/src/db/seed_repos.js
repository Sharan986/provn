require('dotenv').config({ path: __dirname + '/../../.env.local' });
const pool = require('./pool');

const templates = [
  {
    title: 'Build a Facebook UI Clone',
    repo: 'facebook-ui-template',
    desc: 'Develop a responsive Facebook user interface clone using modern CSS and React components.'
  },
  {
    title: 'Build a Food Delivery App',
    repo: 'food-delivery-app-template',
    desc: 'Create a frontend for a food delivery service with a dynamic menu and cart system.'
  },
  {
    title: 'Build an E-commerce Platform',
    repo: 'Ecom-Template',
    desc: 'Construct a multi-page e-commerce template featuring product listings and a checkout flow.'
  },
  {
    title: 'Build a Netflix UI Clone',
    repo: 'Netflix-template',
    desc: 'Implement a visually rich streaming platform clone with carousels and modal popups.'
  },
  {
    title: 'Build a YouTube Clone',
    repo: 'youtube-template',
    desc: 'Develop a video sharing platform UI with a functioning video player and sidebar navigation.'
  },
  {
    title: 'Build a Travel Booking UI',
    repo: 'travel-template',
    desc: 'Design a picturesque travel booking interface with date pickers and destination galleries.'
  },
  {
    title: 'Build a News Portal',
    repo: 'News-pages-template',
    desc: 'Create a responsive news portal layout emphasizing readability, grid structures, and article summaries.'
  }
];

async function seed() {
  console.log('Seeding repository templates as tasks...');
  try {
    // Attempt to grab any existing roadmap to associate these tasks with.
    const { rows: roadmaps } = await pool.query('SELECT id FROM roadmaps LIMIT 1');
    const roadmapId = roadmaps.length > 0 ? roadmaps[0].id : null;

    let skillId = null;
    if (roadmapId) {
      const { rows: skills } = await pool.query('SELECT id FROM skills WHERE roadmap_id = $1 LIMIT 1', [roadmapId]);
      skillId = skills.length > 0 ? skills[0].id : null;
    }

    let insertedCount = 0;

    for (const t of templates) {
      // Check if it already exists to avoid duplicates
      const { rows: existing } = await pool.query('SELECT id FROM tasks WHERE title = $1', [t.title]);

      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO tasks (title, description, type, difficulty, points, roadmap_id, skill_id, auto_review_enabled, template_repo_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            t.title,
            t.desc,
            'platform',
            'intermediate',
            50, // Reward 50 points
            roadmapId,
            skillId,
            true,
            `https://github.com/Sumit0413/${t.repo}` // Replace 'sharan' with the actual org/user if different
          ]
        );
        insertedCount++;
        console.log(`Inserted: ${t.title}`);
      } else {
        console.log(`Skipped (already exists): ${t.title}`);
      }
    }

    console.log(`Successfully inserted ${insertedCount} new tasks!`);
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

seed();
