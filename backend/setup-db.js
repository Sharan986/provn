const { loadEnv } = require('./src/loadEnv');
loadEnv();
const fs = require('fs');
const { Client } = require('pg');
const { buildPgConfig } = require('./src/db/config');

async function setup() {
  const client = new Client(buildPgConfig());

  try {
    await client.connect();
    console.log('Connected to DB.');

    // Check if tasks table exists to guess if schema is loaded
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_name = 'users'`);
    if (res.rows.length === 0) {
      console.log('Applying schema.sql...');
      const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
      try {
        await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
      } catch (error) {
        if (error.code === '42501') {
          console.warn('Skipping pgcrypto extension creation (insufficient privileges).');
        } else {
          throw error;
        }
      }
      const schemaWithoutExtension = schema
        .split('\n')
        .filter((line) => !line.includes('CREATE EXTENSION IF NOT EXISTS "pgcrypto"'))
        .join('\n');
      await client.query(schemaWithoutExtension);
      console.log('Applying seed.sql...');
      const seed = fs.readFileSync('./src/db/seed.sql', 'utf-8');
      await client.query(seed);
      console.log('Database successfully seeded!');
    } else {
      console.log('Schema already exists. Skipping setup.');
    }
  } catch (error) {
    console.error('Setup failed:', error);
  } finally {
    await client.end();
  }
}

setup();
