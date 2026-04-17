const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  submitTask,
  getMySubmissions,
  getSubmissionsForReview,
  reviewSubmission,
  getUserRoadmapProgress,
} = require('../controllers/submissionsController');

router.post('/',                       requireAuth, requireRole('student'), submitTask);
router.get('/mine',                    requireAuth, getMySubmissions);
router.get('/review',                  requireAuth, requireRole('industry', 'admin'), getSubmissionsForReview);
router.put('/:id/review',              requireAuth, requireRole('industry', 'admin'), reviewSubmission);
router.get('/progress/:roadmapId',     requireAuth, getUserRoadmapProgress);

module.exports = router;
