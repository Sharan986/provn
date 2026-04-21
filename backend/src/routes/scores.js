const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  getDashboardStats,
  getStudentLeaderboard,
  getStudentProfile,
} = require('../controllers/scoresController');

router.get('/dashboard',         requireAuth, getDashboardStats);
router.get('/leaderboard',       requireAuth, getStudentLeaderboard);
router.get('/profile/:userId',   requireAuth, getStudentProfile);

module.exports = router;
