import "@mcpher/gas-fakes";
import { initTests } from "./testinit.js";
import { wrapupTest, trasher, getSharedScriptStore } from "./testassist.js";
import { execSync } from "child_process";

/**
 * testJdbc
 * @param {object} pack - the result of initTests
 */
export const testJdbc = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  const isProxyRunning = (instanceName) => {
    if (!ScriptApp.isFake) return false;
    try {
      execSync(`pgrep -f "cloud.*sql.*proxy.*${instanceName}"`, { stdio: 'ignore' });
      return true;
    } catch (e) {
      return false;
    }
  };

/**
 * Converts Database URLs to JDBC-compatible formats.
 * FIXES:
 * 1. Provides 'jdbcUrl' (Clean) for Apps Script Cloud SQL.
 * 2. Provides 'standardUrl' (Full) for Node.js / External JDBC.
 * 3. Correctly handles Postgres protocol 'jdbc:postgresql://'.
 * * @param {string} url - Format: protocol://user:pass@host/db
 * @return {object} - Connection metadata.
 */
const convertToUniversalJdbc = (url) => {
  // Enhanced regex to handle complex passwords
  const regex = /^([^:]+):\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error("Format not recognized. Use: protocol://user:pass@host/db");
  }

  let [, scheme, user, pass, host, db] = match;
  scheme = scheme.trim();
  user = user.trim();
  pass = pass.trim();
  host = host.trim();
  db = db.trim();
  
  const isPostgres = scheme.toLowerCase().includes("post");
  
  // If host contains ':' it might be a Cloud SQL instance or host:port
  // We remove the port if it's there to check if it's a Cloud SQL instance name
  let hostWithoutPort = host.replace(/:\d+$/, "");
  
  // If it still contains a ':', it's likely a Google Cloud SQL instance connection name (project:region:instance)
  let isCloudSql = hostWithoutPort.includes(":");
  let publicIp = null;
  let useProxy = false;
  
  // Apps Script PostgreSQL driver requires a public IP.
  // If we detect a Cloud SQL instance format locally, we use gcloud to resolve its public IP
  // so the saved connection string uses the IP, bypassing the issue on Live Apps Script.
  // We also ensure the local machine's IP is authorized to avoid local connection timeouts.
  if (isCloudSql && isPostgres && ScriptApp.isFake) {
    try {
      const instanceParts = hostWithoutPort.split(":");
      const instanceName = instanceParts[instanceParts.length - 1];
      console.log(`...fetching details for Cloud SQL instance: ${instanceName} via gcloud`);
      
      useProxy = isProxyRunning(instanceName);

      const instanceInfoStr = execSync(`gcloud sql instances describe ${instanceName} --format=json`, { encoding: 'utf-8', stdio: 'pipe' });
      const instanceInfo = JSON.parse(instanceInfoStr);
      
      const primaryIpObj = instanceInfo.ipAddresses?.find(ip => ip.type === 'PRIMARY');
      const ip = primaryIpObj ? primaryIpObj.ipAddress : null;

      if (ip && ip.match(/^[0-9.]+$/)) {
        publicIp = ip;
        console.log(`...resolved Public IP: ${publicIp}. Rewriting host in URL.`);
        
        // Rewrite the host variables to use the IP, so it acts like a standard database
        hostWithoutPort = publicIp;
        host = publicIp;
        isCloudSql = false; // It's now just a standard IP-based connection
      } else {
         console.warn(`...could not resolve valid Public IP for ${instanceName}, got: ${ip}`);
      }

      if (useProxy) {
        console.log(`...Cloud SQL Proxy detected for ${instanceName}. Skipping local IP authorization.`);
      } else {
        // Check and authorize local IP
        const localIp = execSync('curl -s https://ifconfig.me', { encoding: 'utf-8', stdio: 'pipe' }).trim();
        if (localIp && localIp.match(/^[0-9.]+$/)) {
          const authorizedNetworks = instanceInfo.settings?.ipConfiguration?.authorizedNetworks || [];
          const isAuthorized = authorizedNetworks.some(net => net.value === localIp || net.value === `${localIp}/32`);
          
          if (!isAuthorized) {
            console.log(`...authorizing local IP ${localIp} on ${instanceName} (this may take a minute)`);
            const existingNetworks = authorizedNetworks.map(n => n.value);
            existingNetworks.push(`${localIp}/32`);
            const newNetworks = existingNetworks.join(',');
            execSync(`gcloud sql instances patch ${instanceName} --authorized-networks="${newNetworks}" --quiet`, { encoding: 'utf-8', stdio: 'pipe' });
            console.log(`...successfully authorized ${localIp}`);
          } else {
            console.log(`...local IP ${localIp} is already authorized.`);
          }
        }
      }
    } catch (e) {
      console.warn(`...failed to fetch or update Cloud SQL instance details via gcloud: ${e.message}`);
    }
  }
  
  // URL Encode for string-based URLs
  const encodedUser = encodeURIComponent(user);
  const encodedPass = encodeURIComponent(pass);

  const protocol = isPostgres ? "jdbc:postgresql://" : "jdbc:mysql://";
  const port = isPostgres ? "5432" : "3306";
  const ssl = isPostgres ? "ssl=true" : "useSSL=true";

  /**
   * standardUrl (The "Full" URL)
   * Use this for Node.js, Apps Script via Public IP, or any external JDBC client.
   * It ALWAYS includes the port, encoded credentials, and SSL.
   */
  const standardUrl = `${protocol}${hostWithoutPort}:${port}/${db}?user=${encodedUser}&password=${encodedPass}&${ssl}`;

  /**
   * localUrl (The "Proxy" URL)
   * Specifically for Node.js pg-client connecting via 127.0.0.1.
   */
  const localUrl = `${scheme}://${encodedUser}:${encodedPass}@127.0.0.1:${port}/${db}`;

  // If we rewrote the connection to use an IP, provide the updated full string
  // so we can store the valid IP-based string in the property store
  const rewrittenConnectionString = `${scheme}://${user}:${pass}@${hostWithoutPort}/${db}`;

  return {
    jdbcUrl: standardUrl, // The standard URL is what we use now for everything
    standardUrl,
    localUrl,
    rewrittenConnectionString, // Clean, raw string with resolved IP
    user,          // Raw user
    pass,          // Raw pass
    db,
    isCloudSql,
    isPostgres,
    host,
    hostWithoutPort,
    encodedUser,
    encodedPass,
    ssl,
    port,
    publicIp,
    useProxy
  };
};

  const getUseProxy = (envVar) => {
    if (!ScriptApp.isFake) return false;
    const val = process.env[envVar];
    if (!val) return false;
    const match = val.match(/^([^:]+):\/\/([^:]+):([^@]+)@([^/]+)\/([^?]+)/);
    if (!match) return false;
    const hostWithoutPort = match[4].trim().replace(/:\d+$/, "");
    if (hostWithoutPort.includes(":")) {
      const instanceParts = hostWithoutPort.split(":");
      const instanceName = instanceParts[instanceParts.length - 1];
      return isProxyRunning(instanceName);
    }
    return false;
  };

  // Define potential backends
  const potentialBackends = [
    {
      prop: "CLOUD_PG_SQL_DATABASE_PG_URL",
      label: "Google Cloud SQL PG",
      isGoogle: true,
      type: "pg",
      useProxy: getUseProxy("CLOUD_PG_SQL_DATABASE_PG_URL")
    },
    {
      prop: "DATABASE_PG_URL",
      label: "Neon Postgres",
      type: "pg",
      isGoogle: false,
      useProxy: false
    },
  ];

  // Handle sharing and discovery for each backend
  // the idea is to share creds that originate in env via the shared property store
  // we can delegate this to a shared function
  const props = getSharedScriptStore("property");

  // now we have a property store to target, we can write the creds if we are in fake
  if (ScriptApp.isFake) {
    potentialBackends.forEach((f) => {
      const val = process.env[f.prop];
      if (val) {
        // Resolve and rewrite IP early so the property store holds the valid Live string
        const universal = convertToUniversalJdbc(val);
        props.setProperty(f.prop, universal.rewrittenConnectionString);
      } else {
        // get rid of stale tests
        props.deleteProperty(f.prop);
        console.log(
          "...skipping backend " +
            f.label +
            " because " +
            f.prop +
            " is not set in environment",
        );
      }
    });
  }

  // only do the ones for which we have credentials
  const backends = potentialBackends.filter((b) => {
    const connectionString = props.getProperty(b.prop);
    return connectionString;
  });

  // Run tests for each configured and credentialed backend
  backends.forEach((backend) => {
    const { prop, label, isGoogle, type } = backend;
    let connectionString = props.getProperty(prop);

    unit.section(`Jdbc Basics - ${label}`, (t) => {
      if (!connectionString) {
        console.warn(
          `...skipping ${backend.label} tests: ${backend.prop} not set in ScriptProperties`,
        );
        return;
      }

      // various fiddle options with the url
      let universal = convertToUniversalJdbc(connectionString);

      // in live apps script we perhaps need to fiddle with the url
      let jdbcUrl = universal.standardUrl;

      // another wrinkle is that we might be using a proxy if running locally
      // if so we need to redirect to 127.0.0.1
      if (universal.useProxy) {
        jdbcUrl = universal.localUrl;
      }

      // If the URL is an IP address rather than an instance connection string, it's fine.
      // We no longer throw an error because Live Apps Script actually requires a Public IP for PostgreSQL.
      if (isGoogle && !universal.isCloudSql) {
        console.log(`...${backend.label} is using a Public IP pattern (${universal.host}).`);
      }

      console.log(
        `...connecting to ${backend.label}${universal.useProxy ? " (via local proxy)" : ""}`,
      );

      // Test 1: Connection
      console.log(jdbcUrl, universal);

      // The URL is now guaranteed to be an IP-based standard JDBC connection string for Postgres (or local proxy)
      const connectFn = () => Jdbc.getConnection(jdbcUrl);
      
      t.is(t.threw(connectFn)?.message || "ok", "ok");

      const conn = connectFn();
      t.truthy(
        conn,
        `Jdbc Connection to ${backend.label} should return a connection object`,
      );
      t.false(conn.isClosed(), "Connection should be open");

      // Test 2: Table Operations

      const stmt = conn.createStatement();
      const tableName = (
        fixes.PREFIX +
        "_" +
        backend.prop.toLowerCase() +
        "_airports"
      )
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .toLowerCase();

      // Fetch data from Spreadsheet
      const ss = SpreadsheetApp.openById(fixes.TEST_AIRPORTS_ID);
      const sheet = ss.getSheets()[0];
      const data = sheet.getDataRange().getValues();
      const headers = data.shift();

      // Sanitize header names for SQL
      const sanitizedHeaders = headers.map((h) =>
        h.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase(),
      );
      const colDef = sanitizedHeaders.map((h) => `"${h}" TEXT`).join(", ");

      stmt.execute(`DROP TABLE IF EXISTS "${tableName}";`);
      stmt.execute(`CREATE TABLE "${tableName}" (${colDef});`);

      // Insert Data
      let currentValues = [];
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const vals = row
          .map((v) => `'${String(v).replace(/'/g, "''")}'`)
          .join(", ");
        currentValues.push(`(${vals})`);

        if (currentValues.length >= 100 || i === data.length - 1) {
          const insertSql = `INSERT INTO "${tableName}" (${sanitizedHeaders.map((h) => `"${h}"`).join(", ")}) VALUES ${currentValues.join(",")};`;
          stmt.execute(insertSql);
          currentValues = [];
        }
      }

      // Full Data Comparison (Unordered)
      const rsAll = stmt.executeQuery(`SELECT * FROM "${tableName}";`);
      const dbSet = new Set();
      while (rsAll.next()) {
        const rowData = [];
        for (let j = 1; j <= headers.length; j++) {
          rowData.push(rsAll.getString(j));
        }
        dbSet.add(rowData.join("|"));
      }
      rsAll.close();

      const sheetRows = data.map((row) => row.map((v) => String(v)).join("|"));
      t.is(
        dbSet.size,
        sheetRows.length,
        `Row count should match for ${backend.label}`,
      );

      let allFound = true;
      for (const rowKey of sheetRows) {
        if (!dbSet.has(rowKey)) {
          allFound = false;
          t.true(false, `Row not found in ${backend.label} DB: ${rowKey}`);
          break;
        }
      }
      t.true(allFound, `All rows should match for ${backend.label}`);

      // Cleanup
      stmt.close();
      conn.close();
      t.is(conn.isClosed(), true, "Connection should be closed");
    });
  });

  // running standalone
  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);

  return { unit, fixes };
};

wrapupTest(testJdbc);
