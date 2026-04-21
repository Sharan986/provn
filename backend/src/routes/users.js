const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { getPublicProfile, getStudentScore } = require('../controllers/usersController');

router.get('/:id/profile', requireAuth, getPublicProfile);
router.get('/:id/score',   requireAuth, getStudentScore);

module.exports = router;
