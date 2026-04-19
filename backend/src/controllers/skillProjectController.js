const pool = require('../db/pool');

// ─── Student Endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/skills/:skillId/projects
 * Returns all 3 projects for a skill, with lock/unlock status based on user's best test score.
 */
async function getSkillProjects(req, res) {
  const skillId = req.params.skillId;

  try {
    // Get user's best test score for this skill
    const { rows: scoreRows } = await pool.query(
      `SELECT COALESCE(MAX(percentage), 0) AS best_percentage
       FROM skill_test_attempts
       WHERE user_id = $1 AND skill_id = $2`,
      [req.user.id, skillId]
    );
    const bestPercentage = parseFloat(scoreRows[0].best_percentage);

    // Get all projects for this skill
    const { rows: projects } = await pool.query(
      `SELECT * FROM skill_projects
       WHERE skill_id = $1
       ORDER BY project_order ASC`,
      [skillId]
    );

    // Get user's submissions for these projects
    const projectIds = projects.map(p => p.id);
    let submissions = [];
    if (projectIds.length > 0) {
      const { rows: subRows } = await pool.query(
        `SELECT * FROM skill_project_submissions
         WHERE user_id = $1 AND project_id = ANY($2)`,
        [req.user.id, projectIds]
      );
      submissions = subRows;
    }

    const submissionMap = {};
    for (const sub of submissions) {
      submissionMap[sub.project_id] = sub;
    }

    // Add lock/unlock status and submission info to each project
    const enrichedProjects = projects.map(project => ({
      ...project,
      isUnlocked: bestPercentage >= project.unlock_threshold,
      submission: submissionMap[project.id] || null,
    }));

    const isPro = req.user.subscription_tier === 'pro' || req.user.role === 'admin';

    return res.json({
      data: {
        projects: enrichedProjects,
        bestPercentage,
        isPro,
      }
    });
  } catch (err) {
    console.error('getSkillProjects error:', err);
    return res.status(500).json({ error: 'Failed to fetch skill projects' });
  }
}

/**
 * POST /api/skills/:skillId/projects/:id/submit
 * Body: { content } (URL to project)
 */
async function submitProject(req, res) {
  const { content } = req.body;
  const projectId = req.params.id;
  const skillId = req.params.skillId;

  if (!content) {
    return res.status(400).json({ error: 'content (project URL) is required' });
  }

  try {
    // Check project exists and get its threshold
    const { rows: projectRows } = await pool.query(
      'SELECT * FROM skill_projects WHERE id = $1 AND skill_id = $2',
      [projectId, skillId]
    );
    if (!projectRows[0]) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check user's best score meets the threshold
    const { rows: scoreRows } = await pool.query(
      `SELECT COALESCE(MAX(percentage), 0) AS best_percentage
       FROM skill_test_attempts
       WHERE user_id = $1 AND skill_id = $2`,
      [req.user.id, skillId]
    );
    const bestPercentage = parseFloat(scoreRows[0].best_percentage);

    if (bestPercentage < projectRows[0].unlock_threshold) {
      return res.status(403).json({
        error: `You need at least ${projectRows[0].unlock_threshold}% on the skill test to unlock this project. Your best: ${bestPercentage}%`
      });
    }

    // Upsert submission (one per user per project)
    const { rows } = await pool.query(
      `INSERT INTO skill_project_submissions (project_id, user_id, content)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) DO UPDATE SET content = $3, status = 'pending', created_at = NOW()
       RETURNING id`,
      [projectId, req.user.id, content]
    );

    return res.status(201).json({ success: true, data: { submissionId: rows[0].id } });
  } catch (err) {
    console.error('submitProject error:', err);
    return res.status(500).json({ error: 'Failed to submit project' });
  }
}

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/skills/:skillId/projects
 * Body: { title, description, difficulty, points, unlockThreshold, projectOrder, requirements }
 */
async function createProject(req, res) {
  const { title, description, difficulty, points, unlockThreshold, projectOrder, requirements } = req.body;
  const skillId = req.params.skillId;

  if (!title || !unlockThreshold || !projectOrder) {
    return res.status(400).json({ error: 'title, unlockThreshold, and projectOrder are required' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO skill_projects (skill_id, title, description, difficulty, points, unlock_threshold, project_order, requirements)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [skillId, title, description || null, difficulty || 'beginner', points || 50, unlockThreshold, projectOrder, requirements ? JSON.stringify(requirements) : null]
    );

    return res.status(201).json({ success: true, data: { projectId: rows[0].id } });
  } catch (err) {
    console.error('createProject error:', err);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}

/**
 * PUT /api/projects/:projectId
 */
async function updateProject(req, res) {
  const { title, description, difficulty, points, unlockThreshold, projectOrder, requirements } = req.body;

  try {
    const sets = [];
    const params = [];
    let idx = 1;

    if (title !== undefined) { sets.push(`title = $${idx++}`); params.push(title); }
    if (description !== undefined) { sets.push(`description = $${idx++}`); params.push(description); }
    if (difficulty !== undefined) { sets.push(`difficulty = $${idx++}`); params.push(difficulty); }
    if (points !== undefined) { sets.push(`points = $${idx++}`); params.push(points); }
    if (unlockThreshold !== undefined) { sets.push(`unlock_threshold = $${idx++}`); params.push(unlockThreshold); }
    if (projectOrder !== undefined) { sets.push(`project_order = $${idx++}`); params.push(projectOrder); }
    if (requirements !== undefined) { sets.push(`requirements = $${idx++}`); params.push(JSON.stringify(requirements)); }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.projectId);
    const { rowCount } = await pool.query(
      `UPDATE skill_projects SET ${sets.join(', ')} WHERE id = $${idx}`,
      params
    );

    if (!rowCount) return res.status(404).json({ error: 'Project not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('updateProject error:', err);
    return res.status(500).json({ error: 'Failed to update project' });
  }
}

/**
 * DELETE /api/projects/:projectId
 */
async function deleteProject(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM skill_projects WHERE id = $1',
      [req.params.projectId]
    );
    if (!rowCount) return res.status(404).json({ error: 'Project not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteProject error:', err);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}

module.exports = {
  getSkillProjects,
  submitProject,
  createProject,
  updateProject,
  deleteProject,
};
