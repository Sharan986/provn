const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  getChallenges,
  getChallenge,
  startAttempt,
  submitAttempt,
  getProgress,
  getReadinessScore,
  triggerReadinessScore,
  getAllReadinessScores,
  getLeaderboard,
} = require('../controllers/simulatorController');

router.get('/challenges/:roadmapId',   requireAuth, getChallenges);
router.get('/challenge/:id',           requireAuth, getChallenge);
router.post('/attempts',               requireAuth, startAttempt);
router.put('/attempts/:id/submit',     requireAuth, submitAttempt);
router.get('/progress/:roadmapId',     requireAuth, getProgress);
router.get('/readiness',               requireAuth, getAllReadinessScores);
router.get('/readiness/:roadmapId',    requireAuth, getReadinessScore);
router.post('/readiness/:roadmapId',   requireAuth, triggerReadinessScore);
router.get('/leaderboard/:roadmapId',  requireAuth, getLeaderboard);

module.exports = router;
