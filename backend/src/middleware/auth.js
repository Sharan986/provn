const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const ACCESS_SECRET = process.env.JWT_SECRET || 'provn_access_super_secret_change_me';

/**
 * requireAuth — validates the access token from the httpOnly cookie.
 * Attaches the full user row to req.user on success.
 */
module.exports = async function requireAuth(req, res, next) {
  const token = req.cookies?.provn_access;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: no token provided' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_SECRET);

    const { rows } = await pool.query(
      `SELECT id, email, name, role, branch, interests,
              current_roadmap_id, subscription_tier, company_name, avatar_url
       FROM users WHERE id = $1`,
      [payload.userId]
    );

    if (!rows[0]) {
      return res.status(401).json({ error: 'Unauthorized: user not found' });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: invalid or expired token' });
  }
};
