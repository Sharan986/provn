const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const requirePro = require('../middleware/requirePro');
const {
  getSkillTest,
  submitSkillTest,
  getSkillTestHistory,
  getBestScore,
  createMCQ,
  bulkCreateMCQs,
  getMCQsAdmin,
  updateMCQ,
  deleteMCQ,
} = require('../controllers/skillTestController');
const {
  getSkillProjects,
  submitProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/skillProjectController');
const {
  getSkillResources,
  createSkillResource,
  updateSkillResource,
  deleteSkillResource,
} = require('../controllers/skillResourceController');

// ─── Student: Test ────────────────────────────────────────────────────────────
router.get('/:skillId/test',          requireAuth, getSkillTest);
router.post('/:skillId/test/submit',  requireAuth, requirePro, submitSkillTest);
router.get('/:skillId/test/history',  requireAuth, getSkillTestHistory);
router.get('/:skillId/test/best',     requireAuth, getBestScore);

// ─── Student: Projects ────────────────────────────────────────────────────────
router.get('/:skillId/projects',            requireAuth, getSkillProjects);
router.post('/:skillId/projects/:id/submit', requireAuth, requirePro, submitProject);

// ─── Admin: MCQs ──────────────────────────────────────────────────────────────
router.post('/:skillId/mcqs',       requireAuth, requireRole('admin'), createMCQ);
router.post('/:skillId/mcqs/bulk',  requireAuth, requireRole('admin'), bulkCreateMCQs);
router.get('/:skillId/mcqs',        requireAuth, requireRole('admin'), getMCQsAdmin);
router.put('/mcqs/:mcqId',          requireAuth, requireRole('admin'), updateMCQ);
router.delete('/mcqs/:mcqId',       requireAuth, requireRole('admin'), deleteMCQ);

// ─── Admin: Projects ──────────────────────────────────────────────────────────
router.post('/:skillId/projects',        requireAuth, requireRole('admin'), createProject);
router.put('/projects/:projectId',       requireAuth, requireRole('admin'), updateProject);
router.delete('/projects/:projectId',    requireAuth, requireRole('admin'), deleteProject);

// ─── Student: Resource Links ──────────────────────────────────────────────────
router.get('/:skillId/resources',        requireAuth, getSkillResources);

// ─── Admin: Resource Links ────────────────────────────────────────────────────
router.post('/:skillId/resources',       requireAuth, requireRole('admin'), createSkillResource);
router.put('/resources/:id',             requireAuth, requireRole('admin'), updateSkillResource);
router.delete('/resources/:id',          requireAuth, requireRole('admin'), deleteSkillResource);

module.exports = router;
