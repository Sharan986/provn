const pool = require('../db/pool');

/**
 * POST /api/roadmaps/:id/skills
 */
async function createSkill(req, res) {
  const roadmapId = req.params.id;
  const { name, description, positionX, positionY, orderIndex } = req.body;
  if (!name) return res.status(400).json({ error: 'Skill name is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO skills (roadmap_id, name, description, position_x, position_y, order_index)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [roadmapId, name, description || '', positionX || 250, positionY || 100, orderIndex || 0]
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createSkill error:', err);
    return res.status(500).json({ error: 'Failed to create skill' });
  }
}

/**
 * GET /api/roadmaps
 */
async function getAllRoadmaps(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM roadmaps ORDER BY created_at DESC'
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getAllRoadmaps error:', err);
    return res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
}

/**
 * GET /api/roadmaps/:id
 */
async function getRoadmap(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM roadmaps WHERE id = $1',
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Roadmap not found' });
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('getRoadmap error:', err);
    return res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
}

/**
 * GET /api/roadmaps/:id/skills
 * Returns roadmap + its skills sorted by order_index.
 */
async function getRoadmapWithSkills(req, res) {
  try {
    const { rows: roadmapRows } = await pool.query(
      'SELECT * FROM roadmaps WHERE id = $1',
      [req.params.id]
    );
    if (!roadmapRows[0]) return res.status(404).json({ error: 'Roadmap not found' });

    const { rows: skillRows } = await pool.query(
      'SELECT * FROM skills WHERE roadmap_id = $1 ORDER BY order_index ASC',
      [req.params.id]
    );

    // Fallback skills from curriculum array if no skills exist
    let skills = skillRows;
    let usingFallback = false;

    if (!skillRows.length && roadmapRows[0].curriculum) {
      const curriculum = Array.isArray(roadmapRows[0].curriculum)
        ? roadmapRows[0].curriculum
        : [];
      skills = curriculum.map((name, index) => ({
        id:          `skill-${index}`,
        name:        typeof name === 'string' ? name : name.name || name,
        description: '',
        position_x:  250,
        position_y:  100 + index * 120,
        order_index: index,
      }));
      usingFallback = true;
    }

    const isPro = req.user.subscription_tier === 'pro' || req.user.role === 'admin';

    return res.json({
      data: {
        roadmap: roadmapRows[0],
        skills,
        usingFallback,
        isPro
      }
    });
  } catch (err) {
    console.error('getRoadmapWithSkills error:', err);
    return res.status(500).json({ error: 'Failed to fetch roadmap skills' });
  }
}

/**
 * GET /api/roadmaps/:id/tasks
 */
async function getTasksByRoadmap(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tasks WHERE roadmap_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getTasksByRoadmap error:', err);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
}

/**
 * POST /api/roadmaps/:id/assign
 * Assigns a roadmap to the authenticated student.
 */
async function assignRoadmap(req, res) {
  try {
    const { rows: roadmapCheck } = await pool.query(
      'SELECT id FROM roadmaps WHERE id = $1', [req.params.id]
    );
    if (!roadmapCheck[0]) return res.status(404).json({ error: 'Roadmap not found' });

    await pool.query(
      'UPDATE users SET current_roadmap_id = $1, updated_at = NOW() WHERE id = $2',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('assignRoadmap error:', err);
    return res.status(500).json({ error: 'Failed to assign roadmap' });
  }
}

/**
 * GET /api/roadmaps/me
 * Returns the authenticated user's current roadmap.
 */
async function getMyRoadmap(req, res) {
  try {
    if (!req.user.current_roadmap_id) return res.json({ data: null });

    const { rows } = await pool.query(
      'SELECT * FROM roadmaps WHERE id = $1',
      [req.user.current_roadmap_id]
    );
    return res.json({ data: rows[0] || null });
  } catch (err) {
    console.error('getMyRoadmap error:', err);
    return res.status(500).json({ error: 'Failed to fetch roadmap' });
  }
}

/**
 * GET /api/roadmaps/with-skill-counts
 */
async function getRoadmapsWithSkillCounts(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, COUNT(s.id)::INT AS skill_count
       FROM roadmaps r
       LEFT JOIN skills s ON s.roadmap_id = r.id
       GROUP BY r.id
       ORDER BY r.created_at DESC`
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getRoadmapsWithSkillCounts error:', err);
    return res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
}

/**
 * POST /api/roadmaps
 * Admin only: Create a new roadmap.
 */
async function createRoadmap(req, res) {
  const { title, description, curriculum } = req.body;
  if (!title) return res.status(400).json({ error: 'Roadmap title is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO roadmaps (title, description, curriculum)
       VALUES ($1, $2, $3) RETURNING *`,
      [title, description || '', curriculum ? JSON.stringify(curriculum) : '[]']
    );
    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('createRoadmap error:', err);
    return res.status(500).json({ error: 'Failed to create roadmap' });
  }
}

/**
 * PUT /api/roadmaps/:id
 * Admin only: Update an existing roadmap.
 */
async function updateRoadmap(req, res) {
  const { id } = req.params;
  const { title, description, curriculum } = req.body;

  try {
    const { rows: check } = await pool.query('SELECT id FROM roadmaps WHERE id = $1', [id]);
    if (!check[0]) return res.status(404).json({ error: 'Roadmap not found' });

    const { rows } = await pool.query(
      `UPDATE roadmaps
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           curriculum = COALESCE($3, curriculum)
       WHERE id = $4 RETURNING *`,
      [title, description, curriculum ? JSON.stringify(curriculum) : null, id]
    );
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateRoadmap error:', err);
    return res.status(500).json({ error: 'Failed to update roadmap' });
  }
}

/**
 * DELETE /api/roadmaps/:id
 * Admin only: Delete a roadmap.
 */
async function deleteRoadmap(req, res) {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query('DELETE FROM roadmaps WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Roadmap not found' });
    return res.json({ success: true, message: 'Roadmap deleted' });
  } catch (err) {
    console.error('deleteRoadmap error:', err);
    return res.status(500).json({ error: 'Failed to delete roadmap' });
  }
}

module.exports = {
  createSkill,
  getAllRoadmaps, getRoadmap, getRoadmapWithSkills,
  getTasksByRoadmap, assignRoadmap, getMyRoadmap, getRoadmapsWithSkillCounts,
  createRoadmap, updateRoadmap, deleteRoadmap,
};

