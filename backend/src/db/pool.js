const { Pool } = require('pg');
const { buildPgConfig } = require('./config');

const pool = new Pool(buildPgConfig());

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL client error:', err);
});

module.exports = pool;
