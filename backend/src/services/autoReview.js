const pool = require('../db/pool');
const { calculateReadinessScore } = require('../controllers/simulatorController');

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Trigger auto-review immediately after a platform task submission.
 * Returns the review result.
 */
async function triggerAutoReview(submissionId) {
  // Fetch submission + task type
  const { rows } = await pool.query(
    `SELECT s.id, s.task_id, t.type AS task_type, t.auto_review_enabled
     FROM submissions s
     JOIN tasks t ON t.id = s.task_id
     WHERE s.id = $1`,
    [submissionId]
  );

  if (!rows[0]) return { queued: false, reason: 'Submission not found' };

  const { task_type, auto_review_enabled } = rows[0];
  const shouldReview = auto_review_enabled !== false && (!task_type || task_type === 'platform');

  if (!shouldReview) {
    return { queued: false, reason: 'Auto-review not enabled for this task' };
  }

  try {
    const result = await autoReviewSubmission(submissionId);
    return { queued: true, result };
  } catch (err) {
    console.error('triggerAutoReview error:', err);
    return { queued: false, error: err.message };
  }
}

/**
 * Core review logic for a single submission.
 */
async function autoReviewSubmission(submissionId) {
  const { rows } = await pool.query(
    `SELECT s.*, s.student_id,
            t.id AS task_id_ref, t.title AS task_title, t.description AS task_desc,
            t.type AS task_type, t.difficulty, t.points, t.roadmap_id, t.requirements
     FROM submissions s
     JOIN tasks t ON t.id = s.task_id
     WHERE s.id = $1`,
    [submissionId]
  );

  if (!rows[0]) return { error: 'Submission not found' };

  const submission = rows[0];
  const task = {
    id:          submission.task_id_ref,
    title:       submission.task_title,
    description: submission.task_desc,
    type:        submission.task_type,
    difficulty:  submission.difficulty,
    points:      submission.points,
    roadmap_id:  submission.roadmap_id,
    requirements: submission.requirements,
  };

  const evaluation  = await evaluateSubmission(submission.content, task);
  const score       = calculateScore(evaluation, task.points || 10);
  const feedback    = generateFeedback(evaluation, task);

  const passThreshold = 0.6;
  const scorePercent  = score / (task.points || 10);
  const status        = scorePercent >= passThreshold ? 'approved' : 'needs_revision';

  await pool.query(
    `UPDATE submissions
     SET status = $1, score = $2, feedback = $3,
         reviewed_by = 'auto', reviewed_at = NOW()
     WHERE id = $4`,
    [status, score, feedback, submissionId]
  );

  // Update readiness score if approved and has a roadmap
  if (status === 'approved' && task.roadmap_id) {
    try {
      await calculateReadinessScore(submission.student_id, task.roadmap_id);
    } catch (e) {
      console.error('Error recalculating readiness after auto-review:', e);
    }
  }

  return {
    success: true,
    data: { status, score, maxScore: task.points, scorePercent: Math.round(scorePercent * 100), feedback, evaluation },
  };
}

// ─── Evaluation Helpers ───────────────────────────────────────────────────────

async function evaluateSubmission(submissionUrl, task) {
  const checks = {
    urlValid: false, urlAccessible: false, hasReadme: false,
    hasCode: false, platform: null, isDeployed: false,
    meetsRequirements: [], codeQuality: 0, completeness: 0, errors: [],
  };

  try {
    const url = new URL(submissionUrl);
    checks.urlValid = true;

    const h = url.hostname;
    if (h.includes('github.com')) {
      checks.platform = 'github';
      checks.urlAccessible = checks.hasCode = checks.hasReadme = true;
    } else if (h.includes('gitlab.com')) {
      checks.platform = 'gitlab';
      checks.urlAccessible = checks.hasCode = checks.hasReadme = true;
    } else if (h.includes('vercel.app')) {
      checks.platform = 'vercel';
      checks.urlAccessible = checks.hasCode = checks.isDeployed = true;
    } else if (h.includes('netlify.app')) {
      checks.platform = 'netlify';
      checks.urlAccessible = checks.hasCode = checks.isDeployed = true;
    } else if (h.includes('codesandbox.io')) {
      checks.platform = 'codesandbox';
      checks.urlAccessible = checks.hasCode = true;
    } else if (h.includes('stackblitz.com')) {
      checks.platform = 'stackblitz';
      checks.urlAccessible = checks.hasCode = true;
    } else if (h.includes('replit.com')) {
      checks.platform = 'replit';
      checks.urlAccessible = checks.hasCode = true;
    } else {
      checks.urlAccessible = true;
    }
  } catch {
    checks.errors.push('Invalid URL format');
  }

  const requirements         = parseRequirements(task);
  checks.meetsRequirements   = evaluateRequirements(requirements, checks, submissionUrl);
  checks.codeQuality         = calcCodeQuality(checks);

  const metCount     = checks.meetsRequirements.filter(r => r.met).length;
  const totalReqs    = checks.meetsRequirements.length || 1;
  checks.completeness = Math.round((metCount / totalReqs) * 100);

  return checks;
}

function parseRequirements(task) {
  const reqs = [];

  if (task.requirements) {
    try {
      const parsed = typeof task.requirements === 'string'
        ? JSON.parse(task.requirements) : task.requirements;
      if (Array.isArray(parsed)) reqs.push(...parsed);
    } catch { /* ignore parse errors */ }
  }

  const desc = task.description || '';
  const patterns = [
    { pattern: /responsive|mobile/i,        req: 'Responsive design' },
    { pattern: /api|fetch|axios/i,           req: 'API integration' },
    { pattern: /form|input|validation/i,     req: 'Form handling' },
    { pattern: /state|redux|context|zustand/i, req: 'State management' },
    { pattern: /test|jest|testing/i,         req: 'Testing included' },
    { pattern: /deploy|vercel|netlify|live/i, req: 'Deployment' },
    { pattern: /css|style|tailwind|scss/i,   req: 'Styling' },
    { pattern: /database|postgres|prisma|sql/i, req: 'Database integration' },
    { pattern: /auth|login|signup/i,         req: 'Authentication' },
    { pattern: /component|react|vue/i,       req: 'Component structure' },
  ];

  patterns.forEach(({ pattern, req }) => {
    if (pattern.test(desc) && !reqs.includes(req)) reqs.push(req);
  });

  if (!reqs.length) {
    const defaults = {
      beginner:     ['Working code', 'Basic functionality'],
      intermediate: ['Working code', 'Clean structure', 'Basic styling'],
      advanced:     ['Working code', 'Clean architecture', 'Error handling', 'Documentation'],
    };
    reqs.push(...(defaults[task.difficulty] || ['Working code']));
  }

  return reqs;
}

function evaluateRequirements(requirements, checks, url) {
  return requirements.map(req => {
    const r = req.toLowerCase();
    let met = false, reason = '';

    if (r.includes('deploy') || r.includes('live')) {
      met    = checks.isDeployed;
      reason = met ? 'Deployed site detected' : 'No deployment URL found';
    } else if (r.includes('code') || r.includes('working')) {
      met    = checks.hasCode || checks.urlValid;
      reason = met ? 'Code submission provided' : 'No code found';
    } else if (r.includes('github') || r.includes('repo')) {
      met    = ['github', 'gitlab'].includes(checks.platform);
      reason = met ? 'Repository link provided' : 'No repository link';
    } else if (r.includes('documentation') || r.includes('readme')) {
      met    = checks.hasReadme;
      reason = met ? 'Documentation likely present' : 'Documentation not verified';
    } else {
      met    = checks.urlValid && checks.urlAccessible;
      reason = met ? 'Submission provided' : 'Unable to verify';
    }

    return { requirement: req, met, reason };
  });
}

function calcCodeQuality(checks) {
  let score = 50;
  if (checks.urlValid)      score += 10;
  if (checks.urlAccessible) score += 10;
  if (checks.hasReadme)     score += 10;
  if (checks.hasCode)       score += 10;
  if (checks.isDeployed)    score += 15;
  if (['github', 'gitlab'].includes(checks.platform)) score += 5;
  return Math.min(score, 100);
}

function calculateScore(evaluation, maxPoints) {
  let w = 0;
  if (evaluation.urlValid)      w += 0.10;
  if (evaluation.urlAccessible) w += 0.10;
  w += (evaluation.completeness / 100) * 0.50;
  w += (evaluation.codeQuality  / 100) * 0.30;
  return Math.round(w * maxPoints);
}

function generateFeedback(evaluation, task) {
  const lines = [];

  if (evaluation.completeness >= 80)      lines.push('🎉 Great work on this submission!');
  else if (evaluation.completeness >= 60) lines.push('👍 Good effort! Here\'s some feedback to help you improve.');
  else                                    lines.push('📝 Thanks for submitting. Here are some areas to work on.');

  lines.push('');

  if (!evaluation.urlValid) {
    lines.push('❌ **URL Issue**: The submission URL appears to be invalid.');
  } else if (evaluation.platform) {
    const names = {
      github: 'GitHub repository', gitlab: 'GitLab repository',
      vercel: 'Vercel deployment', netlify: 'Netlify deployment',
      codesandbox: 'CodeSandbox project', stackblitz: 'StackBlitz project', replit: 'Replit project',
    };
    lines.push(`✅ **Submission**: ${names[evaluation.platform] || 'Project link'} received.`);
  }

  if (evaluation.meetsRequirements?.length) {
    lines.push('', '**Requirements Check:**');
    evaluation.meetsRequirements.forEach(({ requirement, met, reason }) => {
      lines.push(`${met ? '✅' : '⚠️'} ${requirement}: ${reason}`);
    });
  }

  lines.push('', '**Suggestions:**');
  if (!evaluation.isDeployed && task.difficulty !== 'beginner')
    lines.push('• Consider deploying your project (Vercel, Netlify) to showcase it live.');
  if (!evaluation.hasReadme)
    lines.push('• Add a README.md with setup instructions and project description.');
  if (evaluation.codeQuality < 70)
    lines.push('• Focus on code organisation and comments for complex logic.');
  if (task.difficulty === 'advanced') {
    lines.push('• For advanced tasks, include error handling and edge cases.');
    lines.push('• Consider adding unit tests to demonstrate code quality.');
  }

  lines.push('', `**Completeness Score**: ${evaluation.completeness}%`);
  return lines.join('\n');
}

module.exports = { triggerAutoReview, autoReviewSubmission };
