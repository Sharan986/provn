const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  register,
  login,
  logout,
  refresh,
  me,
  updateProfile,
  updateOnboarding,
  upgradeToPro,
  googleAuth,
  googleCallback,
} = require('../controllers/authController');

router.post('/register',    register);
router.post('/login',       login);
router.post('/logout',      requireAuth, logout);
router.post('/refresh',     refresh);
router.get('/me',           requireAuth, me);
router.put('/profile',      requireAuth, updateProfile);
router.put('/onboarding',   requireAuth, updateOnboarding);
router.put('/upgrade',      requireAuth, upgradeToPro);

router.get('/google',          googleAuth);
router.get('/google/callback', googleCallback);


module.exports = router;
