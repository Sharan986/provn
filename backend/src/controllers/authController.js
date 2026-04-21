const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { OAuth2Client } = require('google-auth-library');
const githubService = require('../services/githubService');

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL || 'https://api.provn.live/auth/google/callback'
);


const ACCESS_SECRET  = process.env.JWT_SECRET         || 'provn_access_super_secret_change_me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'provn_refresh_super_secret_change_me';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function signTokens(userId, role) {
  const accessToken  = jwt.sign({ userId, role }, ACCESS_SECRET,  { expiresIn: '7d' });
  const refreshToken = jwt.sign({ userId },       REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

function setTokenCookies(res, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  if (isProd) {
    cookieOptions.domain = '.provn.live';
  }

  res.cookie('provn_access', accessToken, cookieOptions);
  res.cookie('provn_refresh', refreshToken, cookieOptions);
}

function safeUser(row) {
  const { password_hash, ...safe } = row;
  return safe;
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body: { email, password, name, role }
 */
async function register(req, res) {
  const { email, password, name, role = 'student' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password and name are required' });
  }

  const validRoles = ['student', 'industry', 'college', 'admin'];
  // Role is always student for now as per request
  const finalRole = 'student';


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
      [email.toLowerCase(), password_hash, name, finalRole]
    );


    const user = rows[0];
    const { accessToken, refreshToken } = signTokens(user.id, user.role);
    setTokenCookies(res, accessToken, refreshToken);

    return res.status(201).json({ success: true, role: user.role, data: safeUser(user) });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * POST /api/auth/login
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
    setTokenCookies(res, accessToken, refreshToken);

    return res.json({ success: true, role: user.role, data: safeUser(user) });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  res.clearCookie('provn_access');
  res.clearCookie('provn_refresh');
  return res.json({ success: true });
}

/**
 * POST /api/auth/refresh
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
    setTokenCookies(res, accessToken, refreshToken);

    return res.json({ success: true });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}

/**
 * GET /api/auth/me
 */
function me(req, res) {
  return res.json({ data: req.user });
}

/**
 * PUT /api/auth/profile
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
 * PUT /api/auth/onboarding
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
 * PUT /api/auth/upgrade
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
 * GET /api/auth/google
 */
function googleAuth(req, res) {
  const state = encodeURIComponent('/dashboard/student');
  const url = client.generateAuthUrl({
    access_type: 'offline',
    state: state,
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  res.redirect(url);
}

/**
 * GET /api/auth/google/callback
 */
async function googleCallback(req, res) {
  const { code, state } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://provn.live';

  try {
    const { tokens } = await client.getToken(code);
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
      // Create new user with student role
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
    setTokenCookies(res, accessToken, refreshToken);

    const redirectPath = isNewUser ? '/onboarding/student' : (state ? decodeURIComponent(state) : `/dashboard/${user.role}`);
    return res.redirect(`${FRONTEND_URL}${redirectPath}`);
  } catch (err) {
    console.error('googleCallback error:', err);
    return res.redirect(`${FRONTEND_URL}/auth?error=google_failed`);
  }
}

/**
 * GET /api/auth/github
 */
function githubAuth(req, res) {
  const state = encodeURIComponent('/dashboard/student');
  const url = githubService.getGithubAuthUrl(state);
  res.redirect(url);
}

/**
 * GET /api/auth/github/callback
 */
async function githubCallback(req, res) {
  const { code, state } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://provn.live';
  
  try {
    const tokenData = await githubService.getGithubAccessToken(code);
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
      // Create new user with student role
      const { rows: newRows } = await pool.query(
        `INSERT INTO users (email, name, role, avatar_url, password_hash, github_id, github_username, github_access_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [email.toLowerCase(), name, 'student', picture, 'oauth_placeholder', githubUser.id.toString(), githubUser.login, accessToken]
      );
      user = newRows[0];
      isNewUser = true;
    } else {
      // Update github token just in case
      await pool.query(
        `UPDATE users SET github_id = $1, github_username = $2, github_access_token = $3, updated_at = NOW() WHERE id = $4`,
        [githubUser.id.toString(), githubUser.login, accessToken, user.id]
      );
    }

    const { accessToken: jwtAccess, refreshToken: jwtRefresh } = signTokens(user.id, user.role);
    setTokenCookies(res, jwtAccess, jwtRefresh);

    const redirectPath = isNewUser ? '/onboarding/student' : (state ? decodeURIComponent(state) : `/dashboard/${user.role}`);
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

