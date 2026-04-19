/**
 * requirePro — must be used after requireAuth.
 * Checks that req.user.subscription_tier is 'pro', or the user is an admin.
 *
 * Usage:
 *   router.post('/submit', requireAuth, requirePro, submitTask);
 */
module.exports = function requirePro(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Allow admins to bypass pro check
  if (req.user.role === 'admin' || req.user.subscription_tier === 'pro') {
    return next();
  }
  return res.status(403).json({
    error: 'Pro feature: Upgrade your subscription to access this feature',
    requiresPro: true,
  });
};
