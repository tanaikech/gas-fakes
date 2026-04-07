import pg from 'pg';
import mysql from 'mysql2/promise';

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
  let connectionString = url;
  let type = 'pg';

  if (url.startsWith('jdbc:postgresql:')) {
    connectionString = url.replace('jdbc:postgresql:', 'postgresql:');
    type = 'pg';
  } else if (url.startsWith('jdbc:mysql:')) {
    connectionString = url.replace('jdbc:mysql:', 'mysql:');
    type = 'mysql';
  } else if (url.startsWith('jdbc:google:mysql:')) {
    connectionString = url.replace('jdbc:google:mysql:', 'mysql:');
    type = 'mysql';
  } else if (url.startsWith('mysql:')) {
    type = 'mysql';
  }

  // Parse custom flags
  const disableSsl = connectionString.includes('ssl=false') || connectionString.includes('127.0.0.1');

  let client;
  const id = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  if (type === 'pg') {
    // Strip ssl parameters to avoid conflict with explicit ssl object
    let pgConnectionString = connectionString.replace(/([?&])ssl=[^&]*(&|$)/g, '$1').replace(/[?&]$/, '');

    // Neon postgres usually requires ssl
    if (pgConnectionString.includes('sslmode=require') && !pgConnectionString.includes('uselibpqcompat')) {
      const separator = pgConnectionString.includes('?') ? '&' : '?';
      pgConnectionString += `${separator}uselibpqcompat=true`;
    }

    const clientConfig = {
      connectionString: pgConnectionString,
      ssl: disableSsl ? false : { rejectUnauthorized: false }
    };

    if (user !== null && typeof user !== 'undefined' && password !== null && typeof password !== 'undefined') {
      client = new pg.Client({
        ...clientConfig,
        user: String(user),
        password: String(password)
      });
    } else {
      client = new pg.Client(clientConfig);
    }
    await client.connect();
  } else if (type === 'mysql') {
    let cleanUrl = connectionString.replace(/^jdbc:/, '');
    if (!cleanUrl.startsWith('mysql://')) {
      cleanUrl = 'mysql://' + cleanUrl;
    }
    
    let host = '127.0.0.1';
    let port = 3306;
    let database = '';
    let urlUser;
    let urlPassword;
    
    try {
      const parsedUrl = new URL(cleanUrl);
      host = parsedUrl.hostname;
      port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : 3306;
      database = parsedUrl.pathname.replace(/^\//, '');
      urlUser = parsedUrl.username ? decodeURIComponent(parsedUrl.username) : parsedUrl.searchParams.get('user');
      urlPassword = parsedUrl.password ? decodeURIComponent(parsedUrl.password) : parsedUrl.searchParams.get('password');
    } catch (e) {
      // Fallback for weird formats (like Cloud SQL instance names without resolved IPs)
      const match = cleanUrl.match(/^mysql:\/\/(?:([^:]+):([^@]+)@)?([^/]+?)(?::(\d+))?(?:\/([^?]+))?(?:\?(.*))?$/);
      if (match) {
        urlUser = match[1] ? decodeURIComponent(match[1]) : undefined;
        urlPassword = match[2] ? decodeURIComponent(match[2]) : undefined;
        host = match[3];
        port = match[4] ? parseInt(match[4], 10) : 3306;
        database = match[5] || '';
      } else {
        host = cleanUrl.replace(/^mysql:\/\//, '');
      }
    }

    const finalUser = (user !== null && typeof user !== 'undefined') ? String(user) : urlUser;
    const finalPassword = (password !== null && typeof password !== 'undefined') ? String(password) : urlPassword;

    const mysqlConfig = {
      host: host,
      port: port,
      database: database,
      user: finalUser,
      password: finalPassword,
      ssl: disableSsl ? undefined : { rejectUnauthorized: false }
    };

    client = await mysql.createConnection(mysqlConfig);
  }

  connections.set(id, { client, type });
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
  const entry = connections.get(connectionId);
  if (!entry) throw new Error('Invalid or closed JDBC connection.');
  
  const { client, type } = entry;
  
  if (type === 'pg') {
    const result = await client.query(sql);
    const rows = Array.isArray(result) ? result[result.length - 1].rows : result.rows;
    const fields = Array.isArray(result) ? result[result.length - 1].fields : result.fields;
    const rowCount = Array.isArray(result) ? result[result.length - 1].rowCount : result.rowCount;
    
    return {
      rows: rows || [],
      fields: fields || [],
      rowCount: rowCount || 0,
    };
  } else if (type === 'mysql') {
    // mysql2 returns [rows, fields]
    const [rows, fields] = await client.query(sql);
    return {
      rows: rows || [],
      fields: fields || [], // mysql2 fields are objects with name, columnType, etc.
      rowCount: (rows && rows.insertId) ? 1 : (rows && rows.affectedRows) || (rows && rows.length) || 0,
    };
  }
};

/**
 * Executes a prepared statement on a given connection.
 * @param {import('./auth.js').Auth} Auth
 * @param {object} params
 * @param {string} params.connectionId The stored connection ID
 * @param {string} params.sql The SQL query with placeholders
 * @param {any[]} params.values The parameter values
 * @returns {object} The query result
 */
export const sxJdbcExecutePrepared = async (Auth, { connectionId, sql, values }) => {
  const entry = connections.get(connectionId);
  if (!entry) throw new Error('Invalid or closed JDBC connection.');
  
  const { client, type } = entry;
  
  if (type === 'pg') {
    // pg uses $1, $2, etc. so we must convert ? to $n
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    const result = await client.query(pgSql, values);
    return {
      rows: result.rows || [],
      fields: result.fields || [],
      rowCount: result.rowCount || 0,
    };
  } else if (type === 'mysql') {
    // mysql2 natively supports ? placeholders
    const [rows, fields] = await client.execute(sql, values);
    return {
      rows: rows || [],
      fields: fields || [],
      rowCount: (rows && (rows.affectedRows || rows.length)) || 0,
    };
  }
};

export const sxJdbcCommit = async (Auth, { connectionId }) => {
  return sxJdbcQuery(Auth, { connectionId, sql: 'COMMIT' });
};

export const sxJdbcRollback = async (Auth, { connectionId }) => {
  return sxJdbcQuery(Auth, { connectionId, sql: 'ROLLBACK' });
};

/**
 * Sets auto-commit mode for the connection.
 * Note: Node drivers are technically always in a state where BEGIN is needed for transactions.
 * @param {import('./auth.js').Auth} Auth
 * @param {object} params
 * @param {string} params.connectionId The stored connection ID
 * @param {boolean} params.autoCommit Whether to enable auto-commit
 */
export const sxJdbcSetAutoCommit = async (Auth, { connectionId, autoCommit }) => {
  const entry = connections.get(connectionId);
  if (!entry) throw new Error('Invalid or closed JDBC connection.');
  
  if (!autoCommit) {
    // If turning off auto-commit, start a transaction
    await sxJdbcQuery(Auth, { connectionId, sql: 'BEGIN' });
  }
  entry.autoCommit = autoCommit;
  return true;
};

/**
 * Closes a given connection.
 * @param {import('./auth.js').Auth} Auth
 * @param {object} params
 * @param {string} params.connectionId The stored connection ID
 * @returns {boolean} True if closed successfully
 */
export const sxJdbcClose = async (Auth, { connectionId }) => {
  const entry = connections.get(connectionId);
  if (entry) {
    const { client, type } = entry;
    if (type === 'pg') {
      await client.end();
    } else if (type === 'mysql') {
      await client.end();
    }
    connections.delete(connectionId);
  }
  return true;
};
