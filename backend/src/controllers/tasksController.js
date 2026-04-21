const pool = require('../db/pool');
const githubService = require('../services/githubService');

/**
 * GET /api/tasks
 * All tasks with their roadmap title.
 */
async function getAllTasks(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, r.title AS roadmap_title
       FROM tasks t
       LEFT JOIN roadmaps r ON r.id = t.roadmap_id
       ORDER BY t.created_at DESC`
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getAllTasks error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

/**
 * GET /api/tasks/my-roadmap
 * Tasks that belong to the authenticated student's current roadmap.
 */
async function getMyRoadmapTasks(req, res) {
  try {
    if (!req.user.current_roadmap_id) return res.json({ data: [] });

    const { rows } = await pool.query(
      `SELECT t.*, r.title AS roadmap_title
       FROM tasks t
       LEFT JOIN roadmaps r ON r.id = t.roadmap_id
       WHERE t.roadmap_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.current_roadmap_id]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getMyRoadmapTasks error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

/**
 * GET /api/tasks/skill/:skillId
 */
async function getTasksBySkill(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE skill_id = $1 ORDER BY created_at ASC',
      [req.params.skillId]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getTasksBySkill error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

/**
 * POST /api/tasks
 * Create a new task (industry/admin only).
 * Body: { title, description, type, difficulty, points, roadmap_id, skill_id }
 */
async function createTask(req, res) {
  const {
    title, description,
    type = 'platform',
    difficulty = 'beginner',
    points = 10,
    roadmap_id = null,
    skill_id = null,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, type, difficulty, points, roadmap_id, skill_id, created_by, auto_review_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, type, difficulty, points, roadmap_id, skill_id, req.user.id, type === 'platform']
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createTask error:', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
}

/**
 * POST /api/tasks/:taskId/provision
 * Create a github repo from template for the user and record it in submissions
 */
async function provisionTaskRepo(req, res) {
  const { taskId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user has linked GitHub
    const { rows: userRows } = await pool.query(
      'SELECT github_access_token, github_username FROM users WHERE id = $1',
      [userId]
    );

    const githubToken = userRows[0]?.github_access_token;
    const githubUsername = userRows[0]?.github_username;

    if (!githubToken) {
      return res.status(403).json({ error: 'GitHub account not linked. Please connect your GitHub account first.' });
    }

    // Get task template repo
    const { rows: taskRows } = await pool.query(
      'SELECT id, title, template_repo_url FROM tasks WHERE id = $1',
      [taskId]
    );

    const task = taskRows[0];
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // If no template repo, just return error
    if (!task.template_repo_url) {
      return res.status(400).json({ error: 'This task does not have a template repository configured.' });
    }

    // Parse template owner/repo from URL
    // e.g., https://github.com/provnhq/react-task-template
    let templateOwner, templateRepo;
    try {
      const urlParts = task.template_repo_url.replace('https://github.com/', '').split('/');
      templateOwner = urlParts[0];
      templateRepo = urlParts[1].replace('.git', '');
    } catch (err) {
      return res.status(400).json({ error: 'Invalid template repository URL configured for this task.' });
    }

    // Generate a unique repo name for the student
    const timestamp = Date.now().toString().slice(-6);
    const newRepoName = `provn-${templateRepo}-${timestamp}`;

    // Provision via GitHub API
    const repoData = await githubService.provisionTemplateRepo(
      githubToken,
      templateOwner,
      templateRepo,
      newRepoName
    );

    const repoUrl = repoData.html_url;

    // Check if a submission already exists
    const { rows: subRows } = await pool.query(
      'SELECT id FROM submissions WHERE task_id = $1 AND student_id = $2',
      [taskId, userId]
    );

    let submissionId;
    if (subRows.length > 0) {
      submissionId = subRows[0].id;
      await pool.query(
        'UPDATE submissions SET github_repo_url = $1, status = $2 WHERE id = $3',
        [repoUrl, 'in_progress', submissionId]
      );
    } else {
      const { rows: newSubRows } = await pool.query(
        `INSERT INTO submissions (task_id, student_id, github_repo_url, status)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [taskId, userId, repoUrl, 'in_progress']
      );
      submissionId = newSubRows[0].id;
    }

    return res.status(200).json({
      success: true,
      repo_url: repoUrl,
      codespaces_url: `https://github.com/codespaces/new?repo=${githubUsername}/${newRepoName}`
    });

  } catch (err) {
    console.error('provisionTaskRepo error:', err);
    return res.status(500).json({ error: err.message || 'Failed to provision repository' });
  }
}

module.exports = { getAllTasks, getMyRoadmapTasks, getTasksBySkill, createTask, provisionTaskRepo };
