const { loadEnv } = require('./loadEnv');
loadEnv();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const roadmapsRoutes = require('./routes/roadmaps');
const tasksRoutes = require('./routes/tasks');
const submissionsRoutes = require('./routes/submissions');
const simulatorRoutes = require('./routes/simulator');
const marketplaceRoutes = require('./routes/marketplace');
const scoresRoutes = require('./routes/scores');

const app = express();
const PORT = 3000;

// ──────────────────────────────────────────
// Global Middleware
// ──────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ──────────────────────────────────────────
// Routes
// ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roadmaps', roadmapsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/scores', scoresRoutes);

// Health check
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ──────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Provn backend running on http://localhost:${PORT}`);
});
