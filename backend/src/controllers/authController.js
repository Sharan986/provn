const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { OAuth2Client } = require('google-auth-library');
const githubService = require('../services/githubService');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

// ─── Startup validation: fail fast if secrets are missing ─────────────────────

const ACCESS_SECRET  = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET)  throw new Error('JWT_SECRET env var is required');
if (!REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET env var is required');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signTokens(userId, role) {
  const accessToken  = jwt.sign({ userId, role }, ACCESS_SECRET,  { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId },       REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function isLocalRequest(req) {
  const host = req?.get?.('host') || '';
  return host.includes('localhost') || host.includes('127.0.0.1');
}

function setTokenCookies(req, res, accessToken, refreshToken) {
  const isLocal = isLocalRequest(req);
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: isLocal ? 'lax' : 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };

  // Only set cross-subdomain domain when actually on provn.live, not localhost
  if (!isLocal && process.env.NODE_ENV === 'production') {
    cookieOptions.domain = '.provn.live';
  }

  res.cookie('provn_access', accessToken, cookieOptions);
  res.cookie('provn_refresh', refreshToken, cookieOptions);
}

function clearTokenCookies(req, res) {
  const isLocal = isLocalRequest(req);
  const opts = {
    httpOnly: true,
    secure: true,
    sameSite: isLocal ? 'lax' : 'none',
    path: '/',
    ...( !isLocal && process.env.NODE_ENV === 'production' ? { domain: '.provn.live' } : {}),
  };
  res.clearCookie('provn_access', opts);
  res.clearCookie('provn_refresh', opts);
}

function safeUser(row) {
  const { password_hash, github_access_token, ...safe } = row;
  return safe;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * Body: { email, password, name }
 */
async function register(req, res) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password and name are required' });
  }

  try {
    // Check duplicate
    const { rows: existing } = await pool.query(
      'SELECT id FROM users WHERE email = $1', [email.toLowerCase()]
    );
    if (existing.length) {
      return res.status(409).json({ error: 'This email is already registered. Please log in.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, branch, interests,
                 current_roadmap_id, subscription_tier, company_name, avatar_url, created_at`,
      [email.toLowerCase(), password_hash, name, 'student']
    );

    const user = rows[0];
    const { accessToken, refreshToken } = signTokens(user.id, user.role);
    setTokenCookies(req, res, accessToken, refreshToken);

    return res.status(201).json({ success: true, role: user.role, data: safeUser(user) });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * POST /auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, email, password_hash, name, role, branch, interests,
              current_roadmap_id, subscription_tier, company_name, avatar_url
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = signTokens(user.id, user.role);
    setTokenCookies(req, res, accessToken, refreshToken);

    return res.json({ success: true, role: user.role, data: safeUser(user) });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * POST /auth/logout
 */
function logout(req, res) {
  clearTokenCookies(req, res);
  return res.json({ success: true });
}

/**
 * POST /auth/refresh
 * Uses refresh token cookie to issue a new access token.
 */
async function refresh(req, res) {
  const token = req.cookies?.provn_refresh;
  if (!token) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);

    const { rows } = await pool.query(
      'SELECT id, role FROM users WHERE id = $1', [payload.userId]
    );
    if (!rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken } = signTokens(rows[0].id, rows[0].role);
    setTokenCookies(req, res, accessToken, refreshToken);

    return res.json({ success: true });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

/**
 * GET /auth/me
 */
function me(req, res) {
  return res.json({ data: req.user });
}

/**
 * PUT /auth/profile
 * Body: { name, branch, interests }  (interests as comma-separated string or array)
 */
async function updateProfile(req, res) {
  const { name, branch, interests } = req.body;

  const interestsArr = Array.isArray(interests)
    ? interests
    : (interests || '').split(',').map(s => s.trim()).filter(Boolean);

  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           branch = COALESCE($2, branch),
           interests = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, name, role, branch, interests,
                 current_roadmap_id, subscription_tier, company_name, avatar_url`,
      [name || null, branch || null, interestsArr, req.user.id]
    );
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * PUT /auth/onboarding
 * Body: { branch, interests, currentRoadmapId, orgName }
 */
async function updateOnboarding(req, res) {
  const { branch, interests, currentRoadmapId, orgName } = req.body;

  const interestsArr = Array.isArray(interests)
    ? interests
    : interests
    ? interests.split(',').map(s => s.trim()).filter(Boolean)
    : null;

  try {
    await pool.query(
      `UPDATE users
       SET branch             = COALESCE($1, branch),
           interests          = COALESCE($2, interests),
           current_roadmap_id = COALESCE($3, current_roadmap_id),
           name               = CASE WHEN $4::TEXT IS NOT NULL THEN $4 ELSE name END,
           updated_at         = NOW()
       WHERE id = $5`,
      [branch || null, interestsArr, currentRoadmapId || null, orgName || null, req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('updateOnboarding error:', err);
    return res.status(500).json({ error: 'Failed to update onboarding' });
  }
}

/**
 * PUT /auth/upgrade
 */
async function upgradeToPro(req, res) {
  try {
    await pool.query(
      `UPDATE users SET subscription_tier = 'pro', updated_at = NOW() WHERE id = $1`,
      [req.user.id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error('upgradeToPro error:', err);
    return res.status(500).json({ error: 'Failed to upgrade' });
  }
}

/**
 * GET /auth/google
 */
function googleAuth(req, res) {
  const referer = req.get('Referer') || '';
  const isLocal = referer.includes('localhost') || referer.includes('127.0.0.1');
  const baseUrl = isLocal
    ? 'http://localhost:3000'
    : (process.env.BASE_URL || 'https://api.provn.live');
  const redirectUri = `${baseUrl}/auth/google/callback`;

  const stateObj = { path: '/dashboard/student', isLocal };
  const stateStr = Buffer.from(JSON.stringify(stateObj)).toString('base64');

  const url = client.generateAuthUrl({
    access_type: 'offline',
    state: stateStr,
    redirect_uri: redirectUri,
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  res.redirect(url);
}

/**
 * GET /auth/google/callback
 */
async function googleCallback(req, res) {
  // Bug fix #1: destructure code and state from req.query
  const { code, state } = req.query;

  // Decode state first so FRONTEND_URL is available for the catch block (bug fix #2)
  let isLocal = false;
  let originalPath = '/dashboard/student';
  if (state) {
    try {
      const stateObj = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      isLocal = stateObj.isLocal;
      originalPath = stateObj.path || originalPath;
    } catch(e) { /* ignore malformed state */ }
  }

  // Declare FRONTEND_URL before try so catch block can access it (bug fix #2)
  const FRONTEND_URL = isLocal
    ? 'http://localhost:3001'
    : (process.env.FRONTEND_URL || 'https://provn.live');

  try {
    const baseUrl = isLocal
      ? 'http://localhost:3000'
      : (process.env.BASE_URL || 'https://api.provn.live');
    const redirectUri = `${baseUrl}/auth/google/callback`;

    const { tokens } = await client.getToken({ code, redirect_uri: redirectUri });
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    let { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    let user = rows[0];
    let isNewUser = false;

    if (!user) {
      const { rows: newRows } = await pool.query(
        `INSERT INTO users (email, name, role, avatar_url, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [email.toLowerCase(), name, 'student', picture, 'oauth_placeholder']
      );
      user = newRows[0];
      isNewUser = true;
    }

    const { accessToken, refreshToken } = signTokens(user.id, user.role);
    setTokenCookies(req, res, accessToken, refreshToken);

    const redirectPath = isNewUser ? '/onboarding/student' : originalPath;
    return res.redirect(`${FRONTEND_URL}${redirectPath}`);
  } catch (err) {
    console.error('googleCallback error:', err);
    return res.redirect(`${FRONTEND_URL}/auth?error=google_failed`);
  }
}

/**
 * GET /auth/github
 */
function githubAuth(req, res) {
  const referer = req.get('Referer') || '';
  const isLocal = referer.includes('localhost') || referer.includes('127.0.0.1');
  const baseUrl = isLocal
    ? 'http://localhost:3000'
    : (process.env.BASE_URL || 'https://api.provn.live');
  const redirectUri = `${baseUrl}/auth/github/callback`;

  const stateObj = { path: '/dashboard/student', isLocal };
  const stateStr = Buffer.from(JSON.stringify(stateObj)).toString('base64');

  const url = githubService.getGithubAuthUrl(stateStr, redirectUri);
  res.redirect(url);
}

/**
 * GET /auth/github/callback
 */
async function githubCallback(req, res) {
  // Bug fix #1: destructure code and state from req.query
  const { code, state } = req.query;

  // Decode state first so FRONTEND_URL is available for the catch block (bug fix #2)
  let isLocal = false;
  let originalPath = '/dashboard/student';
  if (state) {
    try {
      const stateObj = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      isLocal = stateObj.isLocal;
      originalPath = stateObj.path || originalPath;
    } catch(e) { /* ignore malformed state */ }
  }

  // Declare FRONTEND_URL before try so catch block can access it (bug fix #2)
  const FRONTEND_URL = isLocal
    ? 'http://localhost:3001'
    : (process.env.FRONTEND_URL || 'https://provn.live');

  try {
    const baseUrl = isLocal
      ? 'http://localhost:3000'
      : (process.env.BASE_URL || 'https://api.provn.live');
    const redirectUri = `${baseUrl}/auth/github/callback`;

    const tokenData = await githubService.getGithubAccessToken(code, redirectUri);
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('No access token received from GitHub');
    }

    const githubUser = await githubService.getGithubUserProfile(accessToken);
    const email = githubUser.email || `${githubUser.login}@github.com`;
    const name = githubUser.name || githubUser.login;
    const picture = githubUser.avatar_url;

    let { rows } = await pool.query(
      'SELECT * FROM users WHERE github_id = $1 OR email = $2',
      [githubUser.id.toString(), email.toLowerCase()]
    );

    let user = rows[0];
    let isNewUser = false;

    if (!user) {
      const { rows: newRows } = await pool.query(
        `INSERT INTO users (email, name, role, avatar_url, password_hash, github_id, github_username, github_access_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [email.toLowerCase(), name, 'student', picture, 'oauth_placeholder',
         githubUser.id.toString(), githubUser.login, accessToken]
      );
      user = newRows[0];
      isNewUser = true;
    } else {
      // Update github token and identifiers
      await pool.query(
        `UPDATE users SET github_id = $1, github_username = $2, github_access_token = $3, updated_at = NOW() WHERE id = $4`,
        [githubUser.id.toString(), githubUser.login, accessToken, user.id]
      );
    }

    const { accessToken: jwtAccess, refreshToken: jwtRefresh } = signTokens(user.id, user.role);
    setTokenCookies(req, res, jwtAccess, jwtRefresh);

    const redirectPath = isNewUser ? '/onboarding/student' : originalPath;
    return res.redirect(`${FRONTEND_URL}${redirectPath}`);
  } catch (err) {
    console.error('githubCallback error:', err);
    return res.redirect(`${FRONTEND_URL}/auth?error=github_failed`);
  }
}

module.exports = {
  register, login, logout, refresh, me,
  updateProfile, updateOnboarding, upgradeToPro,
  googleAuth, googleCallback, githubAuth, githubCallback
};
