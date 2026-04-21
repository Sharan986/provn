const pool = require('../db/pool');

/**
 * GET /api/users/:id/profile
 * Public student profile with submission history.
 */
async function getPublicProfile(req, res) {
  const { id } = req.params;

  try {
    const { rows: profileRows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.branch, u.interests,
              u.subscription_tier, u.current_roadmap_id, u.avatar_url,
              r.title AS roadmap_title
       FROM users u
       LEFT JOIN roadmaps r ON r.id = u.current_roadmap_id
       WHERE u.id = $1`,
      [id]
    );

    if (!profileRows[0]) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { rows: submissionRows } = await pool.query(
      `SELECT s.*, t.title AS task_title, t.type, t.difficulty, t.points
       FROM submissions s
       JOIN tasks t ON t.id = s.task_id
       WHERE s.student_id = $1
       ORDER BY s.created_at DESC`,
      [id]
    );

    const completed  = submissionRows.filter(s => s.status === 'approved');
    const pending    = submissionRows.filter(s => s.status === 'pending');
    const totalScore = completed.reduce((sum, s) => sum + (s.score || 0), 0);

    return res.json({
      data: {
        ...profileRows[0],
        completedSubmissions: completed,
        pendingSubmissions:   pending,
        totalScore,
        tasksCompleted: completed.length,
      },
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * GET /api/users/:id/score
 */
async function getStudentScore(req, res) {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(SUM(score), 0) AS total_score,
              COUNT(*)                 AS tasks_completed
       FROM submissions
       WHERE student_id = $1 AND status = 'approved'`,
      [id]
    );

    return res.json({
      data: {
        totalScore:     parseInt(rows[0].total_score) || 0,
        tasksCompleted: parseInt(rows[0].tasks_completed) || 0,
      },
    });
  } catch (err) {
    console.error('getStudentScore error:', err);
    return res.status(500).json({ error: 'Failed to fetch score' });
  }
}

module.exports = { getPublicProfile, getStudentScore };
