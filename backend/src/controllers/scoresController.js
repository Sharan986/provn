const pool = require('../db/pool');

/**
 * GET /api/scores/dashboard
 * Returns role-aware stats for the current user's dashboard.
 */
async function getDashboardStats(req, res) {
  const { id: userId, role } = req.user;

  try {
    if (role === 'student') {
      const { rows: submissionRows } = await pool.query(
        `SELECT status, score FROM submissions WHERE student_id = $1`, [userId]
      );
      const completed   = submissionRows.filter(s => s.status === 'approved');
      const pending     = submissionRows.filter(s => s.status === 'pending');
      const totalScore  = completed.reduce((sum, s) => sum + (s.score || 0), 0);

      const { rows: countRows } = await pool.query('SELECT COUNT(*)::INT AS cnt FROM tasks');

      return res.json({
        data: {
          totalScore,
          tasksCompleted:  completed.length,
          tasksPending:    pending.length,
          tasksAvailable:  countRows[0].cnt,
        },
      });
    }

    if (role === 'industry') {
      const { rows: taskRows } = await pool.query(
        'SELECT id FROM tasks WHERE created_by = $1', [userId]
      );
      const taskIds = taskRows.map(t => t.id);

      let pendingReviews = 0;
      if (taskIds.length) {
        const { rows: revRows } = await pool.query(
          `SELECT COUNT(*)::INT AS cnt FROM submissions WHERE task_id = ANY($1) AND status = 'pending'`,
          [taskIds]
        );
        pendingReviews = revRows[0].cnt;
      }

      const { rows: studentRows } = await pool.query(
        `SELECT COUNT(*)::INT AS cnt FROM users WHERE role = 'student'`
      );

      return res.json({
        data: {
          myTasks:       taskRows.length,
          pendingReviews,
          totalStudents: studentRows[0].cnt,
        },
      });
    }

    if (role === 'college') {
      const { rows } = await pool.query(
        `SELECT COUNT(*)::INT AS cnt FROM users WHERE role = 'student'`
      );
      return res.json({ data: { totalStudents: rows[0].cnt } });
    }

    return res.json({ data: {} });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

/**
 * GET /api/scores/leaderboard
 * Students ranked by total approved submission score.
 */
async function getStudentLeaderboard(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.name, u.email, u.branch, u.interests,
              COALESCE(SUM(s.score), 0)::INT  AS total_score,
              COUNT(s.id)::INT                AS tasks_completed
       FROM users u
       LEFT JOIN submissions s ON s.student_id = u.id AND s.status = 'approved'
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY total_score DESC`
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getStudentLeaderboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

/**
 * GET /api/scores/profile/:userId
 * Full student profile with all submissions and score totals.
 */
async function getStudentProfile(req, res) {
  const { userId } = req.params;

  try {
    const { rows: profileRows } = await pool.query(
      `SELECT u.*, r.title AS roadmap_title
       FROM users u
       LEFT JOIN roadmaps r ON r.id = u.current_roadmap_id
       WHERE u.id = $1`,
      [userId]
    );
    if (!profileRows[0]) return res.status(404).json({ error: 'Student not found' });

    const { rows: submissionRows } = await pool.query(
      `SELECT s.*, t.title AS task_title, t.type, t.difficulty, t.points
       FROM submissions s
       JOIN tasks t ON t.id = s.task_id
       WHERE s.student_id = $1
       ORDER BY s.created_at DESC`,
      [userId]
    );

    const completed  = submissionRows.filter(s => s.status === 'approved');
    const totalScore = completed.reduce((sum, s) => sum + (s.score || 0), 0);

    const { password_hash, ...profile } = profileRows[0];

    return res.json({
      data: {
        ...profile,
        submissions:    submissionRows,
        totalScore,
        tasksCompleted: completed.length,
      },
    });
  } catch (err) {
    console.error('getStudentProfile error:', err);
    return res.status(500).json({ error: 'Failed to fetch student profile' });
  }
}

module.exports = { getDashboardStats, getStudentLeaderboard, getStudentProfile };
