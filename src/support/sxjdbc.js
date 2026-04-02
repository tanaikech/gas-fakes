import pg from 'pg';

const connections = new Map();

/**
 * Creates and stores a connection to the database.
 * @param {import('./auth.js').Auth} Auth
 * @param {object} params
 * @param {string} params.url JDBC connection URL
 * @param {string} params.user Optional username
 * @param {string} params.password Optional password
 * @returns {object} Connection details/ID
 */
export const sxJdbcConnect = async (Auth, { url, user, password }) => {
  // gas-fakes primarily supports PostgreSQL mapping jdbc:postgresql to node-postgres (pg)
  let connectionString = url;
  if (url.startsWith('jdbc:postgresql:')) {
    connectionString = url.replace('jdbc:postgresql:', 'postgresql:');
  }

  // Strip ssl parameters to avoid conflict with explicit ssl object
  connectionString = connectionString.replace(/([?&])ssl=[^&]*(&|$)/g, '$1').replace(/[?&]$/, '');

  // Neon postgres usually requires ssl
  // To avoid the pg security warning regarding sslmode=require, we append the recommended compat flag
  if (connectionString.includes('sslmode=require') && !connectionString.includes('uselibpqcompat')) {
    const separator = connectionString.includes('?') ? '&' : '?';
    connectionString += `${separator}uselibpqcompat=true`;
  }

  const clientConfig = {
    connectionString,
    ssl: { rejectUnauthorized: false }
  };

  let client;
  if (user !== null && typeof user !== 'undefined' && password !== null && typeof password !== 'undefined') {
    // If explicit credentials are provided, use them with a config object
    client = new pg.Client({
      ...clientConfig,
      user: String(user),
      password: String(password)
    });
  } else {
    // Otherwise rely on the connection string (which might already have them)
    client = new pg.Client(clientConfig);
  }
  
  await client.connect();
  const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  connections.set(id, client);
  
  return { id };
};

/**
 * Executes a query on a given connection.
 * @param {import('./auth.js').Auth} Auth
 * @param {object} params
 * @param {string} params.connectionId The stored connection ID
 * @param {string} params.sql The SQL query to execute
 * @returns {object} The query result (rows, fields, etc.)
 */
export const sxJdbcQuery = async (Auth, { connectionId, sql }) => {
  const client = connections.get(connectionId);
  if (!client) throw new Error('Invalid or closed JDBC connection.');
  
  const result = await client.query(sql);
  
  return {
    rows: result.rows,
    fields: result.fields,
    rowCount: result.rowCount,
  };
};

/**
 * Closes a given connection.
 * @param {import('./auth.js').Auth} Auth
 * @param {object} params
 * @param {string} params.connectionId The stored connection ID
 * @returns {boolean} True if closed successfully
 */
export const sxJdbcClose = async (Auth, { connectionId }) => {
  const client = connections.get(connectionId);
  if (client) {
    await client.end();
    connections.delete(connectionId);
  }
  return true;
};
