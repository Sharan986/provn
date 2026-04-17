require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');

async function setup() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to DB.');

    // Check if tasks table exists to guess if schema is loaded
    const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_name = 'users'`);
    if (res.rows.length === 0) {
      console.log('Applying schema.sql...');
      const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
      await client.query(schema);
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
