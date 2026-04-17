const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getJobPostings,
  getJobPosting,
  createJobPosting,
  updateJobStatus,
  getMyJobPostings,
  getTaskOpenings,
  getTaskOpening,
  createTaskOpening,
  applyToOpportunity,
  getMyApplications,
  getApplicationsForOpportunity,
  updateApplicationStatus,
  searchCandidates,
} = require('../controllers/marketplaceController');

// Jobs
router.get('/jobs/mine',                   requireAuth, requireRole('industry', 'admin'), getMyJobPostings);
router.get('/jobs/:id',                    requireAuth, getJobPosting);
router.get('/jobs',                        requireAuth, getJobPostings);
router.post('/jobs',                       requireAuth, requireRole('industry', 'admin'), createJobPosting);
router.put('/jobs/:id/status',             requireAuth, requireRole('industry', 'admin'), updateJobStatus);

// Task openings
router.get('/tasks/:id',                   requireAuth, getTaskOpening);
router.get('/tasks',                       requireAuth, getTaskOpenings);
router.post('/tasks',                      requireAuth, requireRole('industry', 'admin'), createTaskOpening);

// Applications
router.post('/apply',                      requireAuth, applyToOpportunity);
router.get('/applications/mine',           requireAuth, getMyApplications);
router.get('/applications/:type/:id',      requireAuth, requireRole('industry', 'admin'), getApplicationsForOpportunity);
router.put('/applications/:id/status',     requireAuth, requireRole('industry', 'admin'), updateApplicationStatus);

// Candidate search
router.get('/candidates',                  requireAuth, requireRole('industry', 'college', 'admin'), searchCandidates);

module.exports = router;
