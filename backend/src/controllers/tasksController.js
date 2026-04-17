const pool = require('../db/pool');

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

module.exports = { getAllTasks, getMyRoadmapTasks, getTasksBySkill, createTask };
