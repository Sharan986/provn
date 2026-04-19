function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '');
}

function toStringValue(value) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'string') return value;
  return String(value);
}

function hasPasswordInConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    return Boolean(url.password);
  } catch {
    return false;
  }
}

function withInjectedPassword(connectionString, password) {
  const url = new URL(connectionString);
  url.password = password;
  return url.toString();
}

function buildPgConfig(env = process.env) {
  const databaseUrl = toStringValue(env.DATABASE_URL);
  const fallbackUser = toStringValue(firstDefined(env.DB_USER, env.PGUSER));
  const fallbackPassword = toStringValue(firstDefined(env.DB_PASSWORD, env.PGPASSWORD));
  const fallbackDatabase = toStringValue(firstDefined(env.DB_NAME, env.PGDATABASE));
  const fallbackHost = toStringValue(firstDefined(env.DB_HOST, env.PGHOST));
  const fallbackPort = toStringValue(firstDefined(env.DB_PORT, env.PGPORT));

  if (databaseUrl) {
    let mergedUrl = databaseUrl;
    let url;
    try {
      url = new URL(databaseUrl);
    } catch {
      url = null;
    }

    if (url) {
      if (fallbackUser) url.username = fallbackUser;
      if (fallbackPassword) url.password = fallbackPassword;
      if (fallbackDatabase) url.pathname = `/${fallbackDatabase}`;
      if (fallbackHost) url.hostname = fallbackHost;
      if (fallbackPort) url.port = fallbackPort;
      mergedUrl = url.toString();
    }

    if (hasPasswordInConnectionString(mergedUrl)) {
      return { connectionString: mergedUrl };
    }

    return { connectionString: mergedUrl, password: '' };
  }

  const host = fallbackHost || 'localhost';
  const portRaw = fallbackPort;
  const user = fallbackUser;
  const password = fallbackPassword;
  const database = fallbackDatabase;
  const parsedPort = portRaw ? Number(portRaw) : 5432;
  const hasStructuredConfig = Boolean(user || database || host !== 'localhost' || portRaw);

  if (!databaseUrl && !hasStructuredConfig) {
    throw new Error(
      'Database config missing: set DATABASE_URL (recommended) or DB_USER/DB_PASSWORD/DB_NAME.'
    );
  }

  return {
    host,
    port: Number.isFinite(parsedPort) ? parsedPort : 5432,
    user,
    password: password || '',
    database,
  };
}

module.exports = { buildPgConfig };
