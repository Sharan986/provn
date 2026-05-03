const dotenv = require('dotenv');
const path = require('path');

function loadEnv() {
  // Use absolute paths so env files load correctly regardless of CWD
  // (critical for PM2 which may start from a different directory)
  const backendRoot = path.resolve(__dirname, '..');
  dotenv.config({ path: path.join(backendRoot, '.env.local'), override: true });
  dotenv.config({ path: path.join(backendRoot, '.env') });
}

module.exports = { loadEnv };
