const pool = require('../db/pool');

// ─── Student Endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/skills/:skillId/test
 * Returns 15 MCQs for a skill (questions only, no correct answers).
 */
async function getSkillTest(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, question, options, order_index
       FROM skill_mcqs
       WHERE skill_id = $1
       ORDER BY order_index ASC
       LIMIT 15`,
      [req.params.skillId]
    );

    return res.json({ data: rows });
  } catch (err) {
    console.error('getSkillTest error:', err);
    return res.status(500).json({ error: 'Failed to fetch test questions' });
  }
}

/**
 * POST /api/skills/:skillId/test/submit
 * Body: { answers: [{questionId, selected}], timeTakenSeconds }
 * Scores the test and stores the attempt.
 */
async function submitSkillTest(req, res) {
  const { answers, timeTakenSeconds } = req.body;
  const skillId = req.params.skillId;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers array is required' });
  }

  try {
    // Fetch the correct answers from DB
    const questionIds = answers.map(a => a.questionId);
    const { rows: mcqs } = await pool.query(
      `SELECT id, correct_option FROM skill_mcqs WHERE id = ANY($1)`,
      [questionIds]
    );

    const correctMap = {};
    for (const mcq of mcqs) {
      correctMap[mcq.id] = mcq.correct_option;
    }

    // Score
    let correctCount = 0;
    const gradedAnswers = answers.map(a => {
      const correct = correctMap[a.questionId];
      const isCorrect = a.selected === correct;
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        selected: a.selected,
        correct,
        isCorrect
      };
    });

    const totalQuestions = answers.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    // Store the attempt
    const { rows: attemptRows } = await pool.query(
      `INSERT INTO skill_test_attempts
         (user_id, skill_id, score, total_questions, percentage, answers, time_taken_seconds, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, score, total_questions, percentage`,
      [req.user.id, skillId, correctCount, totalQuestions, percentage, JSON.stringify(gradedAnswers), timeTakenSeconds || null]
    );

    return res.json({
      data: {
        attemptId: attemptRows[0].id,
        score: correctCount,
        totalQuestions,
        percentage,
        answers: gradedAnswers
      }
    });
  } catch (err) {
    console.error('submitSkillTest error:', err);
    return res.status(500).json({ error: 'Failed to submit test' });
  }
}

/**
 * GET /api/skills/:skillId/test/history
 * Returns all past attempts for a user on a skill.
 */
async function getSkillTestHistory(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT id, score, total_questions, percentage, time_taken_seconds, completed_at, created_at
       FROM skill_test_attempts
       WHERE user_id = $1 AND skill_id = $2
       ORDER BY created_at DESC`,
      [req.user.id, req.params.skillId]
    );

    return res.json({ data: rows });
  } catch (err) {
    console.error('getSkillTestHistory error:', err);
    return res.status(500).json({ error: 'Failed to fetch test history' });
  }
}

/**
 * GET /api/skills/:skillId/test/best
 * Returns the user's best score percentage for a skill.
 */
async function getBestScore(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT COALESCE(MAX(percentage), 0) AS best_percentage,
              COUNT(*)::INT AS attempt_count
       FROM skill_test_attempts
       WHERE user_id = $1 AND skill_id = $2`,
      [req.user.id, req.params.skillId]
    );

    return res.json({
      data: {
        bestPercentage: parseFloat(rows[0].best_percentage),
        attemptCount: rows[0].attempt_count
      }
    });
  } catch (err) {
    console.error('getBestScore error:', err);
    return res.status(500).json({ error: 'Failed to fetch best score' });
  }
}

// ─── Admin Endpoints ──────────────────────────────────────────────────────────

/**
 * POST /api/skills/:skillId/mcqs
 * Body: { question, options, correctOption, explanation }
 */
async function createMCQ(req, res) {
  const { question, options, correctOption, explanation } = req.body;
  const skillId = req.params.skillId;

  if (!question || !options || options.length !== 4 || correctOption === undefined) {
    return res.status(400).json({ error: 'question, options (4 items), and correctOption are required' });
  }

  try {
    // Get the next order_index
    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*)::INT AS count FROM skill_mcqs WHERE skill_id = $1',
      [skillId]
    );

    const { rows } = await pool.query(
      `INSERT INTO skill_mcqs (skill_id, question, options, correct_option, explanation, order_index)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [skillId, question, JSON.stringify(options), correctOption, explanation || null, countRows[0].count]
    );

    return res.status(201).json({ success: true, data: { mcqId: rows[0].id } });
  } catch (err) {
    console.error('createMCQ error:', err);
    return res.status(500).json({ error: 'Failed to create MCQ' });
  }
}

/**
 * POST /api/skills/:skillId/mcqs/bulk
 * Body: { mcqs: [{ question, options, correctOption, explanation }] }
 */
async function bulkCreateMCQs(req, res) {
  const { mcqs } = req.body;
  const skillId = req.params.skillId;

  if (!mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
    return res.status(400).json({ error: 'mcqs array is required' });
  }

  try {
    const { rows: countRows } = await pool.query(
      'SELECT COUNT(*)::INT AS count FROM skill_mcqs WHERE skill_id = $1',
      [skillId]
    );
    let orderIndex = countRows[0].count;

    const createdIds = [];
    for (const mcq of mcqs) {
      if (!mcq.question || !mcq.options || mcq.options.length !== 4 || mcq.correctOption === undefined) {
        continue; // Skip invalid entries
      }
      const { rows } = await pool.query(
        `INSERT INTO skill_mcqs (skill_id, question, options, correct_option, explanation, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [skillId, mcq.question, JSON.stringify(mcq.options), mcq.correctOption, mcq.explanation || null, orderIndex++]
      );
      createdIds.push(rows[0].id);
    }

    return res.status(201).json({ success: true, data: { created: createdIds.length, ids: createdIds } });
  } catch (err) {
    console.error('bulkCreateMCQs error:', err);
    return res.status(500).json({ error: 'Failed to bulk create MCQs' });
  }
}

/**
 * GET /api/skills/:skillId/mcqs (Admin — includes correct answers)
 */
async function getMCQsAdmin(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM skill_mcqs WHERE skill_id = $1 ORDER BY order_index ASC`,
      [req.params.skillId]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getMCQsAdmin error:', err);
    return res.status(500).json({ error: 'Failed to fetch MCQs' });
  }
}

/**
 * PUT /api/mcqs/:mcqId
 */
async function updateMCQ(req, res) {
  const { question, options, correctOption, explanation } = req.body;

  try {
    const sets = [];
    const params = [];
    let idx = 1;

    if (question !== undefined) { sets.push(`question = $${idx++}`); params.push(question); }
    if (options !== undefined) { sets.push(`options = $${idx++}`); params.push(JSON.stringify(options)); }
    if (correctOption !== undefined) { sets.push(`correct_option = $${idx++}`); params.push(correctOption); }
    if (explanation !== undefined) { sets.push(`explanation = $${idx++}`); params.push(explanation); }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.mcqId);
    const { rowCount } = await pool.query(
      `UPDATE skill_mcqs SET ${sets.join(', ')} WHERE id = $${idx}`,
      params
    );

    if (!rowCount) return res.status(404).json({ error: 'MCQ not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('updateMCQ error:', err);
    return res.status(500).json({ error: 'Failed to update MCQ' });
  }
}

/**
 * DELETE /api/mcqs/:mcqId
 */
async function deleteMCQ(req, res) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM skill_mcqs WHERE id = $1',
      [req.params.mcqId]
    );
    if (!rowCount) return res.status(404).json({ error: 'MCQ not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteMCQ error:', err);
    return res.status(500).json({ error: 'Failed to delete MCQ' });
  }
}

module.exports = {
  getSkillTest,
  submitSkillTest,
  getSkillTestHistory,
  getBestScore,
  createMCQ,
  bulkCreateMCQs,
  getMCQsAdmin,
  updateMCQ,
  deleteMCQ,
};
