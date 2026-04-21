const dotenv = require('dotenv');

function loadEnv() {
  dotenv.config({ path: '.env.local' });
  dotenv.config();
}

module.exports = { loadEnv };
