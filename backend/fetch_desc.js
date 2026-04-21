require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/provn_db'
});

async function run() {
  try {
    const res = await pool.query("SELECT description FROM skills WHERE name = 'Internet' LIMIT 1");
    console.log("RAW DESC:", res.rows[0].description);
    console.log("TYPEOF DESC:", typeof res.rows[0].description);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();
