const pool = require('../db/pool');

// ─── Readiness Score Calculator ───────────────────────────────────────────────

async function calculateReadinessScore(userId, roadmapId) {
  // Task scores (50 pts max)
  const { rows: tasks }       = await pool.query('SELECT id, points FROM tasks WHERE roadmap_id = $1', [roadmapId]);
  const { rows: submissions } = await pool.query(
    `SELECT task_id, score FROM submissions WHERE student_id = $1 AND status = 'approved'`,
    [userId]
  );

  const tasksTotal     = tasks.length;
  const tasksCompleted = new Set(submissions.map(s => s.task_id)).size;
  const taskScore      = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 50) : 0;

  // Simulator scores (30 pts max)
  const { rows: challenges } = await pool.query(
    'SELECT id, points FROM simulator_challenges WHERE roadmap_id = $1', [roadmapId]
  );
  const { rows: attempts } = await pool.query(
    `SELECT challenge_id, score FROM simulator_attempts
     WHERE user_id = $1 AND roadmap_id = $2 AND status = 'completed'`,
    [userId, roadmapId]
  );

  const simTotal     = challenges.length;
  const simCompleted = new Set(attempts.map(a => a.challenge_id)).size;
  const maxSimPts    = challenges.reduce((s, c) => s + c.points, 0);
  const earnedSimPts = attempts.reduce((s, a) => s + a.score, 0);
  const simScore     = maxSimPts > 0 ? Math.round((earnedSimPts / maxSimPts) * 30) : 0;

  // Quality score from review ratings (20 pts max)
  const totalTaskPoints  = tasks.reduce((s, t) => s + t.points, 0);
  const earnedTaskPoints = submissions.reduce((s, sub) => s + (sub.score || 0), 0);
  const avgRating        = totalTaskPoints > 0 ? (earnedTaskPoints / totalTaskPoints) * 5 : 0;
  const qualityScore     = Math.round((avgRating / 5) * 20);

  const totalScore = taskScore + simScore + qualityScore;

  await pool.query(
    `INSERT INTO readiness_scores
       (user_id, roadmap_id, task_score, simulator_score, quality_score, total_score,
        tasks_completed, tasks_total, simulator_challenges_completed, simulator_challenges_total,
        avg_review_rating, last_calculated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
     ON CONFLICT (user_id, roadmap_id) DO UPDATE SET
       task_score = EXCLUDED.task_score,
       simulator_score = EXCLUDED.simulator_score,
       quality_score = EXCLUDED.quality_score,
       total_score = EXCLUDED.total_score,
       tasks_completed = EXCLUDED.tasks_completed,
       tasks_total = EXCLUDED.tasks_total,
       simulator_challenges_completed = EXCLUDED.simulator_challenges_completed,
       simulator_challenges_total = EXCLUDED.simulator_challenges_total,
       avg_review_rating = EXCLUDED.avg_review_rating,
       last_calculated_at = NOW()`,
    [userId, roadmapId, taskScore, simScore, qualityScore, totalScore,
     tasksCompleted, tasksTotal, simCompleted, simTotal,
     avgRating.toFixed(2)]
  );

  return { totalScore, taskScore, simScore, qualityScore };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/simulator/challenges/:roadmapId
 */
async function getChallenges(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, difficulty, category, points,
              time_limit_minutes, problem_statement, starter_code, hints
       FROM simulator_challenges
       WHERE roadmap_id = $1
       ORDER BY difficulty ASC`,
      [req.params.roadmapId]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getChallenges error:', err);
    return res.status(500).json({ error: 'Failed to fetch challenges' });
  }
}

/**
 * GET /api/simulator/challenge/:id
 * Filters out hidden test cases.
 */
async function getChallenge(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, difficulty, category, points,
              time_limit_minutes, problem_statement, starter_code, test_cases, hints, roadmap_id
       FROM simulator_challenges WHERE id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Challenge not found' });

    const challenge = { ...rows[0] };
    if (challenge.test_cases) {
      challenge.visible_test_cases = challenge.test_cases.filter(tc => !tc.hidden);
      delete challenge.test_cases; // never expose all test cases
    }
    return res.json({ data: challenge });
  } catch (err) {
    console.error('getChallenge error:', err);
    return res.status(500).json({ error: 'Failed to fetch challenge' });
  }
}

/**
 * POST /api/simulator/attempts
 * Body: { challengeId, roadmapId }
 */
async function startAttempt(req, res) {
  const { challengeId, roadmapId } = req.body;
  if (!challengeId) return res.status(400).json({ error: 'challengeId is required' });

  try {
    // Resume existing in-progress attempt
    const { rows: existing } = await pool.query(
      `SELECT id FROM simulator_attempts
       WHERE user_id = $1 AND challenge_id = $2 AND status = 'in_progress'`,
      [req.user.id, challengeId]
    );
    if (existing[0]) {
      return res.json({ data: { attemptId: existing[0].id }, message: 'Resuming existing attempt' });
    }

    const { rows } = await pool.query(
      `INSERT INTO simulator_attempts (user_id, challenge_id, roadmap_id, started_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [req.user.id, challengeId, roadmapId || null]
    );
    return res.status(201).json({ data: { attemptId: rows[0].id } });
  } catch (err) {
    console.error('startAttempt error:', err);
    return res.status(500).json({ error: 'Failed to start attempt' });
  }
}

/**
 * PUT /api/simulator/attempts/:id/submit
 * Body: { code, testResults }
 */
async function submitAttempt(req, res) {
  const { id } = req.params;
  const { code, testResults = [] } = req.body;

  try {
    // Fetch attempt + challenge
    const { rows: attemptRows } = await pool.query(
      `SELECT sa.*, sc.points AS challenge_points, sc.test_cases AS all_test_cases
       FROM simulator_attempts sa
       JOIN simulator_challenges sc ON sc.id = sa.challenge_id
       WHERE sa.id = $1 AND sa.user_id = $2`,
      [id, req.user.id]
    );
    if (!attemptRows[0]) return res.status(404).json({ error: 'Attempt not found' });

    const attempt     = attemptRows[0];
    const totalTests  = (attempt.all_test_cases || []).length;
    const testsPassed = testResults.filter(r => r.passed).length;
    const score       = totalTests > 0 ? Math.round((testsPassed / totalTests) * attempt.challenge_points) : 0;
    const timeTaken   = Math.round((Date.now() - new Date(attempt.started_at).getTime()) / 1000);

    await pool.query(
      `UPDATE simulator_attempts
       SET code_submitted = $1, test_results = $2, tests_passed = $3,
           total_tests = $4, score = $5, time_taken_seconds = $6,
           status = 'completed', completed_at = NOW()
       WHERE id = $7`,
      [code, JSON.stringify(testResults), testsPassed, totalTests, score, timeTaken, id]
    );

    // Recalculate readiness score if attempt belongs to a roadmap
    if (attempt.roadmap_id) {
      await calculateReadinessScore(req.user.id, attempt.roadmap_id);
    }

    return res.json({
      success: true,
      data: { score, testsPassed, totalTests, timeTakenSeconds: timeTaken, roadmapId: attempt.roadmap_id },
    });
  } catch (err) {
    console.error('submitAttempt error:', err);
    return res.status(500).json({ error: 'Failed to submit attempt' });
  }
}

/**
 * GET /api/simulator/progress/:roadmapId
 */
async function getProgress(req, res) {
  const { roadmapId } = req.params;

  try {
    const { rows: attempts } = await pool.query(
      `SELECT challenge_id, score, tests_passed, total_tests, status
       FROM simulator_attempts
       WHERE user_id = $1 AND roadmap_id = $2 AND status = 'completed'`,
      [req.user.id, roadmapId]
    );

    const { rows: challenges } = await pool.query(
      'SELECT id, points FROM simulator_challenges WHERE roadmap_id = $1',
      [roadmapId]
    );

    const completedIds  = new Set(attempts.map(a => a.challenge_id));
    const totalPoints   = challenges.reduce((s, c) => s + c.points, 0);
    const earnedPoints  = attempts.reduce((s, a) => s + a.score, 0);
    const attemptsOut   = attempts.map(a => ({
      ...a, passed: a.tests_passed === a.total_tests && a.total_tests > 0,
    }));

    return res.json({
      data: {
        completedCount:       completedIds.size,
        totalCount:           challenges.length,
        earnedPoints,
        totalPoints,
        completedChallengeIds: Array.from(completedIds),
        attempts:             attemptsOut,
      },
    });
  } catch (err) {
    console.error('getProgress error:', err);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
}

/**
 * GET /api/simulator/readiness/:roadmapId
 */
async function getReadinessScore(req, res) {
  const { roadmapId } = req.params;
  const userId = req.query.userId || req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT * FROM readiness_scores WHERE user_id = $1 AND roadmap_id = $2`,
      [userId, roadmapId]
    );
    if (!rows[0]) return res.json({ data: null });

    const d = rows[0];
    return res.json({
      data: {
        score:               d.total_score,
        taskScore:           d.task_score,
        simulatorScore:      d.simulator_score,
        qualityScore:        d.quality_score,
        tasksCompleted:      d.tasks_completed,
        tasksTotal:          d.tasks_total,
        challengesCompleted: d.simulator_challenges_completed,
        challengesTotal:     d.simulator_challenges_total,
      },
    });
  } catch (err) {
    console.error('getReadinessScore error:', err);
    return res.status(500).json({ error: 'Failed to fetch readiness score' });
  }
}

/**
 * POST /api/simulator/readiness/:roadmapId
 * Trigger manual calculation of readiness.
 */
async function triggerReadinessScore(req, res) {
  const { roadmapId } = req.params;
  try {
    const result = await calculateReadinessScore(req.user.id, roadmapId);
    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('triggerReadinessScore error:', err);
    return res.status(500).json({ error: 'Failed to calculate readiness' });
  }
}

/**
 * GET /api/simulator/readiness
 * All readiness scores for the logged-in user across roadmaps.
 */
async function getAllReadinessScores(req, res) {
  const userId = req.query.userId || req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT rs.*, r.id AS roadmap_id_ref, r.title AS roadmap_title
       FROM readiness_scores rs
       JOIN roadmaps r ON r.id = rs.roadmap_id
       WHERE rs.user_id = $1
       ORDER BY rs.total_score DESC`,
      [userId]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getAllReadinessScores error:', err);
    return res.status(500).json({ error: 'Failed to fetch scores' });
  }
}

/**
 * GET /api/simulator/leaderboard/:roadmapId?limit=20
 */
async function getLeaderboard(req, res) {
  const { roadmapId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  try {
    const { rows } = await pool.query(
      `SELECT rs.total_score, rs.task_score, rs.simulator_score, rs.quality_score,
              u.id, u.name, u.avatar_url
       FROM readiness_scores rs
       JOIN users u ON u.id = rs.user_id
       WHERE rs.roadmap_id = $1
       ORDER BY rs.total_score DESC
       LIMIT $2`,
      [roadmapId, limit]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

module.exports = {
  getChallenges, getChallenge, startAttempt, submitAttempt,
  getProgress, getReadinessScore, triggerReadinessScore, getAllReadinessScores, getLeaderboard,
  calculateReadinessScore,
};
