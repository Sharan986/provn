const pool = require('../db/pool');

const { triggerAutoReview } = require('../services/autoReview');

// ─── Deferred Submit Endpoint ────────────────────────────────────────────────

/**
 * POST /api/submissions
 * Body: { task_id, content }
 */
async function submitTask(req, res) {
  const { task_id, content } = req.body;
  if (!task_id || !content) return res.status(400).json({ error: 'Missing task_id or content' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO submissions (task_id, student_id, content, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [task_id, req.user.id, content]
    );

    // Trigger auto-review asynchronously
    if (rows[0] && rows[0].id) {
      triggerAutoReview(rows[0].id).catch(console.error);
    }

    return res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'You have already submitted this task' }); // Unique violation
    console.error('submitTask error:', err);
    return res.status(500).json({ error: 'Failed to submit task' });
  }
}

/**
 * GET /api/submissions/mine
 */
async function getMySubmissions(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, t.title AS task_title, t.type, t.difficulty, t.points
       FROM submissions s
       JOIN tasks t ON t.id = s.task_id
       WHERE s.student_id = $1
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getMySubmissions error:', err);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

/**
 * GET /api/submissions/review?status=pending
 * Industry user: submissions pending review for their tasks.
 */
async function getSubmissionsForReview(req, res) {
  const status = req.query.status || 'pending';

  try {
    // Get task IDs owned by this industry user
    const { rows: taskRows } = await pool.query(
      'SELECT id FROM tasks WHERE created_by = $1',
      [req.user.id]
    );
    if (!taskRows.length) return res.json({ data: [] });

    const taskIds = taskRows.map(t => t.id);

    const { rows } = await pool.query(
      `SELECT s.*,
              t.title AS task_title, t.type, t.difficulty, t.points,
              u.name AS student_name, u.email AS student_email, u.branch AS student_branch
       FROM submissions s
       JOIN tasks t ON t.id = s.task_id
       JOIN users u ON u.id = s.student_id
       WHERE s.task_id = ANY($1) AND s.status = $2
       ORDER BY s.created_at DESC`,
      [taskIds, status]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getSubmissionsForReview error:', err);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
}

/**
 * PUT /api/submissions/:id/review
 * Body: { status, score, feedback }
 */
async function reviewSubmission(req, res) {
  const { id } = req.params;
  const { status, score = 0, feedback = null } = req.body;

  const validStatuses = ['approved', 'needs_revision', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE submissions
       SET status = $1, score = $2, feedback = $3,
           reviewed_by = $4, reviewed_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status, parseInt(score) || 0, feedback, req.user.id, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Submission not found' });
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('reviewSubmission error:', err);
    return res.status(500).json({ error: 'Failed to review submission' });
  }
}

/**
 * GET /api/submissions/progress/:roadmapId
 * Returns a user's progress on a roadmap (submissions, completed skills, score).
 */
async function getUserRoadmapProgress(req, res) {
  const { roadmapId } = req.params;
  const userId = req.user.id;

  try {
    // All tasks for this roadmap
    const { rows: tasks } = await pool.query(
      'SELECT id, skill_id, points FROM tasks WHERE roadmap_id = $1',
      [roadmapId]
    );

    if (!tasks.length) {
      return res.json({
        data: { submissions: [], completedSkills: [], inProgressSkills: [], totalScore: 0, totalPoints: 0, submissionMap: {} },
      });
    }

    const taskIds = tasks.map(t => t.id);

    // User submissions for these tasks
    const { rows: submissions } = await pool.query(
      `SELECT * FROM submissions WHERE student_id = $1 AND task_id = ANY($2)`,
      [userId, taskIds]
    );

    // Build submission map
    const submissionMap = {};
    submissions.forEach(s => { submissionMap[s.task_id] = s; });

    // Compute completed / in-progress skills
    const skillTaskMap = {};
    tasks.forEach(t => {
      if (t.skill_id) {
        if (!skillTaskMap[t.skill_id]) skillTaskMap[t.skill_id] = [];
        skillTaskMap[t.skill_id].push(t.id);
      }
    });

    const completedSkills   = [];
    const inProgressSkills  = [];

    Object.entries(skillTaskMap).forEach(([skillId, ids]) => {
      const allApproved  = ids.every(id => submissionMap[id]?.status === 'approved');
      const anySubmitted = ids.some(id => submissionMap[id]);
      if (allApproved)  completedSkills.push(skillId);
      else if (anySubmitted) inProgressSkills.push(skillId);
    });

    const totalScore  = submissions.filter(s => s.status === 'approved').reduce((sum, s) => sum + (s.score || 0), 0);
    const totalPoints = tasks.reduce((sum, t) => sum + (t.points || 0), 0);

    return res.json({
      data: { submissions, completedSkills, inProgressSkills, totalScore, totalPoints, submissionMap },
    });
  } catch (err) {
    console.error('getUserRoadmapProgress error:', err);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
}

module.exports = { submitTask, getMySubmissions, getSubmissionsForReview, reviewSubmission, getUserRoadmapProgress };
