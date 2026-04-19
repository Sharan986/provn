const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllRoadmaps,
  getRoadmap,
  getRoadmapWithSkills,
  getTasksByRoadmap,
  assignRoadmap,
  getMyRoadmap,
  getRoadmapsWithSkillCounts,
  createSkill,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
} = require('../controllers/roadmapsController');

// NOTE: specific paths must come before parameterised ones
router.get('/me',                requireAuth, getMyRoadmap);
router.get('/with-skill-counts', requireAuth, getRoadmapsWithSkillCounts);
router.get('/',                  requireAuth, getAllRoadmaps);
router.post('/',                 requireAuth, requireRole('admin'), createRoadmap);
router.get('/:id',               requireAuth, getRoadmap);
router.put('/:id',               requireAuth, requireRole('admin'), updateRoadmap);
router.delete('/:id',            requireAuth, requireRole('admin'), deleteRoadmap);
router.get('/:id/skills',        requireAuth, getRoadmapWithSkills);
router.post('/:id/skills',       requireAuth, requireRole('industry', 'admin'), createSkill);
router.get('/:id/tasks',         requireAuth, getTasksByRoadmap);
router.post('/:id/assign',       requireAuth, requireRole('student'), assignRoadmap);


module.exports = router;
