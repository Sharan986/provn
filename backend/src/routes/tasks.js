const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllTasks,
  getMyRoadmapTasks,
  getTasksBySkill,
  createTask,
} = require('../controllers/tasksController');

router.get('/my-roadmap',      requireAuth, getMyRoadmapTasks);
router.get('/skill/:skillId',  requireAuth, getTasksBySkill);
router.get('/',                requireAuth, getAllTasks);
router.post('/',               requireAuth, requireRole('industry', 'admin'), createTask);

module.exports = router;
