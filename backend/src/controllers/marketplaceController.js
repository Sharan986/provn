const pool = require('../db/pool');

// ─── Job Postings ─────────────────────────────────────────────────────────────

/**
 * GET /api/marketplace/jobs?jobType=&experienceLevel=&isRemote=&minSalary=
 */
async function getJobPostings(req, res) {
  const { jobType, experienceLevel, isRemote, minSalary } = req.query;
  const params = ['active'];
  const conditions = ['jp.status = $1'];
  let idx = 2;

  if (jobType)         { conditions.push(`jp.job_type = $${idx++}`);           params.push(jobType); }
  if (experienceLevel) { conditions.push(`jp.experience_level = $${idx++}`);   params.push(experienceLevel); }
  if (isRemote !== undefined) { conditions.push(`jp.is_remote = $${idx++}`);  params.push(isRemote === 'true'); }
  if (minSalary)       { conditions.push(`jp.salary_min >= $${idx++}`);        params.push(parseInt(minSalary)); }

  try {
    const { rows } = await pool.query(
      `SELECT jp.*,
              u.id AS company_user_id, u.name AS company_name_user,
              u.avatar_url AS company_avatar, u.company_name
       FROM job_postings jp
       LEFT JOIN users u ON u.id = jp.company_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY jp.created_at DESC`,
      params
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getJobPostings error:', err);
    return res.status(500).json({ error: 'Failed to fetch job postings' });
  }
}

/**
 * GET /api/marketplace/jobs/:id
 */
async function getJobPosting(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT jp.*, u.id AS company_user_id, u.name AS company_name_user,
              u.avatar_url AS company_avatar, u.company_name
       FROM job_postings jp
       LEFT JOIN users u ON u.id = jp.company_id
       WHERE jp.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Job not found' });
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('getJobPosting error:', err);
    return res.status(500).json({ error: 'Failed to fetch job' });
  }
}

/**
 * POST /api/marketplace/jobs
 */
async function createJobPosting(req, res) {
  const {
    title, description, jobType = 'full-time', location,
    isRemote = false, salaryMin, salaryMax, salaryCurrency = 'INR',
    requiredRoadmaps = [], minReadinessScore = 0, requiredSkills = [],
    experienceLevel = 'fresher', deadline,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO job_postings
         (company_id, title, description, job_type, location, is_remote,
          salary_min, salary_max, salary_currency, required_roadmaps,
          min_readiness_score, required_skills, experience_level, deadline, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'active')
       RETURNING id`,
      [req.user.id, title, description, jobType, location, isRemote,
       salaryMin, salaryMax, salaryCurrency, requiredRoadmaps,
       minReadinessScore, requiredSkills, experienceLevel, deadline || null]
    );
    return res.status(201).json({ success: true, data: { jobId: rows[0].id } });
  } catch (err) {
    console.error('createJobPosting error:', err);
    return res.status(500).json({ error: 'Failed to create job posting' });
  }
}

/**
 * PUT /api/marketplace/jobs/:id/status
 * Body: { status }
 */
async function updateJobStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['draft', 'active', 'paused', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const { rowCount } = await pool.query(
      `UPDATE job_postings SET status = $1, updated_at = NOW()
       WHERE id = $2 AND company_id = $3`,
      [status, req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Job not found or not yours' });
    return res.json({ success: true });
  } catch (err) {
    console.error('updateJobStatus error:', err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}

/**
 * GET /api/marketplace/jobs/mine
 */
async function getMyJobPostings(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT jp.*, COUNT(a.id)::INT AS application_count
       FROM job_postings jp
       LEFT JOIN applications a ON a.job_id = jp.id
       WHERE jp.company_id = $1
       GROUP BY jp.id
       ORDER BY jp.created_at DESC`,
      [req.user.id]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getMyJobPostings error:', err);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}

// ─── Task Openings ────────────────────────────────────────────────────────────

/**
 * GET /api/marketplace/tasks?category=&minBudget=
 */
async function getTaskOpenings(req, res) {
  const { category, minBudget } = req.query;
  const params = [['open', 'in_progress']];
  const conditions = ['to2.status = ANY($1)'];
  let idx = 2;

  if (category)  { conditions.push(`to2.category = $${idx++}`);     params.push(category); }
  if (minBudget) { conditions.push(`to2.budget_min >= $${idx++}`);  params.push(parseInt(minBudget)); }

  try {
    const { rows } = await pool.query(
      `SELECT to2.*, u.id AS company_user_id, u.name AS company_name_user,
              u.avatar_url AS company_avatar, u.company_name
       FROM task_openings to2
       LEFT JOIN users u ON u.id = to2.company_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY to2.created_at DESC`,
      params
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getTaskOpenings error:', err);
    return res.status(500).json({ error: 'Failed to fetch task openings' });
  }
}

/**
 * GET /api/marketplace/tasks/:id
 */
async function getTaskOpening(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT to2.*, u.id AS company_user_id, u.name AS company_name_user,
              u.avatar_url AS company_avatar, u.company_name
       FROM task_openings to2
       LEFT JOIN users u ON u.id = to2.company_id
       WHERE to2.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Task opening not found' });
    return res.json({ data: rows[0] });
  } catch (err) {
    console.error('getTaskOpening error:', err);
    return res.status(500).json({ error: 'Failed to fetch task opening' });
  }
}

/**
 * POST /api/marketplace/tasks
 */
async function createTaskOpening(req, res) {
  const {
    title, description, category, deliverables,
    budgetMin, budgetMax, budgetCurrency = 'INR',
    paymentType = 'fixed', requiredRoadmaps = [],
    minReadinessScore = 0, estimatedHours, deadline,
  } = req.body;

  if (!title) return res.status(400).json({ error: 'title is required' });

  try {
    const { rows } = await pool.query(
      `INSERT INTO task_openings
         (company_id, title, description, category, deliverables,
          budget_min, budget_max, budget_currency, payment_type,
          required_roadmaps, min_readiness_score, estimated_hours, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [req.user.id, title, description, category, deliverables,
       budgetMin, budgetMax, budgetCurrency, paymentType,
       requiredRoadmaps, minReadinessScore, estimatedHours, deadline || null]
    );
    return res.status(201).json({ success: true, data: { taskId: rows[0].id } });
  } catch (err) {
    console.error('createTaskOpening error:', err);
    return res.status(500).json({ error: 'Failed to create task opening' });
  }
}

// ─── Applications ─────────────────────────────────────────────────────────────

/**
 * POST /api/marketplace/apply
 * Body: { type: 'job'|'task', opportunityId, coverLetter, resumeUrl, portfolioUrl }
 */
async function applyToOpportunity(req, res) {
  const { type, opportunityId, coverLetter, resumeUrl, portfolioUrl } = req.body;

  if (!type || !opportunityId) {
    return res.status(400).json({ error: 'type and opportunityId are required' });
  }
  if (!['job', 'task'].includes(type)) {
    return res.status(400).json({ error: 'type must be "job" or "task"' });
  }

  try {
    // Get best readiness score snapshot
    const { rows: scoreRows } = await pool.query(
      `SELECT total_score FROM readiness_scores
       WHERE user_id = $1 ORDER BY total_score DESC LIMIT 1`,
      [req.user.id]
    );
    const readinessSnapshot = scoreRows[0]?.total_score || 0;

    // Check duplicate
    const dupCol = type === 'job' ? 'job_id' : 'task_opening_id';
    const { rows: existing } = await pool.query(
      `SELECT id FROM applications WHERE user_id = $1 AND ${dupCol} = $2`,
      [req.user.id, opportunityId]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'You have already applied to this opportunity' });
    }

    const jobId         = type === 'job'  ? opportunityId : null;
    const taskOpeningId = type === 'task' ? opportunityId : null;

    const { rows } = await pool.query(
      `INSERT INTO applications
         (user_id, job_id, task_opening_id, cover_letter, resume_url, portfolio_url, readiness_score_snapshot)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [req.user.id, jobId, taskOpeningId, coverLetter, resumeUrl, portfolioUrl, readinessSnapshot]
    );

    // Increment applications_count
    const countTable = type === 'job' ? 'job_postings' : 'task_openings';
    await pool.query(
      `UPDATE ${countTable} SET applications_count = applications_count + 1 WHERE id = $1`,
      [opportunityId]
    );

    return res.status(201).json({ success: true, data: { applicationId: rows[0].id } });
  } catch (err) {
    console.error('applyToOpportunity error:', err);
    return res.status(500).json({ error: 'Failed to apply' });
  }
}

/**
 * GET /api/marketplace/applications/mine
 */
async function getMyApplications(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT a.*,
              jp.title AS job_title, jp.company_id AS job_company_id,
              jpu.name AS job_company_name,
              to2.title AS task_title, to2.company_id AS task_company_id,
              tou.name AS task_company_name
       FROM applications a
       LEFT JOIN job_postings jp ON jp.id = a.job_id
       LEFT JOIN users jpu ON jpu.id = jp.company_id
       LEFT JOIN task_openings to2 ON to2.id = a.task_opening_id
       LEFT JOIN users tou ON tou.id = to2.company_id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getMyApplications error:', err);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

/**
 * GET /api/marketplace/applications/:type/:id
 * type = 'job' | 'task'
 */
async function getApplicationsForOpportunity(req, res) {
  const { type, id } = req.params;
  if (!['job', 'task'].includes(type)) {
    return res.status(400).json({ error: 'type must be "job" or "task"' });
  }

  const filterCol = type === 'job' ? 'a.job_id' : 'a.task_opening_id';

  try {
    const { rows } = await pool.query(
      `SELECT a.*, u.id AS student_id, u.name, u.avatar_url, u.branch, u.interests
       FROM applications a
       JOIN users u ON u.id = a.user_id
       WHERE ${filterCol} = $1
       ORDER BY a.readiness_score_snapshot DESC`,
      [id]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('getApplicationsForOpportunity error:', err);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
}

/**
 * PUT /api/marketplace/applications/:id/status
 * Body: { status }
 */
async function updateApplicationStatus(req, res) {
  const { status } = req.body;
  const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const { rowCount } = await pool.query(
      `UPDATE applications SET status = $1, reviewed_at = NOW() WHERE id = $2`,
      [status, req.params.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Application not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('updateApplicationStatus error:', err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}

// ─── Candidate Search ─────────────────────────────────────────────────────────

/**
 * GET /api/marketplace/candidates?minScore=&roadmapId=&limit=
 */
async function searchCandidates(req, res) {
  const { minScore, roadmapId, limit = 50 } = req.query;
  const params = [];
  const conditions = [];
  let idx = 1;

  if (minScore)   { conditions.push(`rs.total_score >= $${idx++}`);  params.push(parseInt(minScore)); }
  if (roadmapId)  { conditions.push(`rs.roadmap_id = $${idx++}`);    params.push(roadmapId); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await pool.query(
      `SELECT rs.*, u.id AS student_id, u.name, u.avatar_url, u.branch, u.interests, u.email,
              r.id AS roadmap_id, r.title AS roadmap_title
       FROM readiness_scores rs
       JOIN users u ON u.id = rs.user_id
       JOIN roadmaps r ON r.id = rs.roadmap_id
       ${where}
       ORDER BY rs.total_score DESC
       LIMIT $${idx}`,
      [...params, parseInt(limit)]
    );
    return res.json({ data: rows });
  } catch (err) {
    console.error('searchCandidates error:', err);
    return res.status(500).json({ error: 'Failed to search candidates' });
  }
}

module.exports = {
  getJobPostings, getJobPosting, createJobPosting, updateJobStatus, getMyJobPostings,
  getTaskOpenings, getTaskOpening, createTaskOpening,
  applyToOpportunity, getMyApplications, getApplicationsForOpportunity,
  updateApplicationStatus, searchCandidates,
};
