import { Proxies } from '../../support/proxies.js';
import { newFakeJdbcConnection } from './fakejdbcconnection.js';
import { execSync } from 'child_process';

class FakeJdbcService {
  constructor() {
    this.__fakeObjectType = 'Jdbc';
  }

  /**
   * Connects to a JDBC database.
   * In gas-fakes, we primarily support postgres via pg module, mapping jdbc:postgresql to it.
   * 
   * @param {string} url The URL of the database to connect to.
   * @param {string} user (optional) The user name to connect as.
   * @param {string} password (optional) The password for the user.
   * @returns {JdbcConnection} A JDBC connection object.
   */
  getConnection(url, user, password) {
    let finalUrl = url;

    if (!finalUrl) {
      throw new Error('Jdbc.getConnection: URL is required or DATABASE_URL must be set in environment');
    }

    // Explicitly merge user/password into the URL structure for gas-fakes processing
    if (user !== undefined && user !== null && password !== undefined && password !== null) {
      try {
        const cleanUrl = finalUrl.replace(/^jdbc:google:/, '').replace(/^jdbc:/, '');
        const urlObj = new URL(cleanUrl);
        urlObj.username = encodeURIComponent(String(user));
        urlObj.password = encodeURIComponent(String(password));
        
        // Restore the prefix
        let prefix = "jdbc:";
        if (finalUrl.startsWith("jdbc:google:")) prefix = "jdbc:google:";
        finalUrl = prefix + urlObj.toString();
      } catch (e) {
        // Fallback for malformed URLs
      }
    }
    
    // We intentionally pass undefined for user and password so the worker only sees finalUrl
    return newFakeJdbcConnection(finalUrl, undefined, undefined);
  }

  /**
   * Connects to a Google Cloud SQL instance - but on gas-fakes its the same thing
   * @param {string} url The URL of the database to connect to.
   * @param {string} user (optional) The user name to connect as.
   * @param {string} password (optional) The password for the user.
   * @returns {JdbcConnection} A JDBC connection object.
   */
  getCloudSqlConnection(url, user, password) {
    return this.getConnection (url, user, password)
  }

  parseCsv(csv) {
    throw new Error('Not implemented: parseCsv');
  }

  __useProxy  (val) {
    if (!val) return false;
    const normal = this.__normalConnect (val)
    const {isCloudSql, hostWithoutPort } = normal
    
    if (isCloudSql && hostWithoutPort && hostWithoutPort.includes(":")) {
      const instanceParts = hostWithoutPort.split(":");
      const instanceName = instanceParts[instanceParts.length - 1];
      try {
        execSync(`pgrep -f "cloud.*sql.*proxy.*${instanceName}"`, {
          stdio: "ignore",
        });
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  };

  /**
   * Converts Database URLs to JDBC-compatible formats for testing and local proxy usage.
   * @param {string} url - Format: protocol://user:pass@host/db OR protocol://host/db?user=X&password=Y
   * @return {object} - Connection metadata.
   */
  __normalConnection(url) {
    const isProxyRunning = (instanceName) => {
      try {
        execSync(`pgrep -f "cloud.*sql.*proxy.*${instanceName}"`, {
          stdio: "ignore",
        });
        return true;
      } catch (e) {
        return false;
      }
    };

    const aggressiveEncode = (str) => {
      return encodeURIComponent(str).replace(/[!'()*]/g, (c) => {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    };

    const cleanUrl = url.replace(/^jdbc:google:/, "").replace(/^jdbc:/, "");

    let scheme, user, pass, host, db, isPostgres;

    // Try parsing with standard URL module to handle both `user:pass@host` and `host?user=x&password=y`
    try {
      const parsed = new URL(cleanUrl);
      scheme = parsed.protocol.replace(':', '');
      user = parsed.username || "";
      pass = parsed.password || "";
      host = parsed.hostname;
      const portFromUrl = parsed.port;
      if (portFromUrl) {
        host = `${host}:${portFromUrl}`;
      }
      db = parsed.pathname.replace(/^\//, ''); // Remove leading slash
      
      // Extract credentials from search params if they weren't in the auth part
      if (!user && parsed.searchParams.has('user')) {
         user = parsed.searchParams.get('user');
      }
      if (!pass && parsed.searchParams.has('password')) {
         pass = parsed.searchParams.get('password');
      }

      // Capture the remaining parameters, preserving everything except user and password
      const remainingParams = new URLSearchParams(parsed.search);
      remainingParams.delete('user');
      remainingParams.delete('password');
      
      // Put remaining params back into db string if they exist
      const searchString = remainingParams.toString();
      if (searchString) {
        db = `${db}?${searchString}`;
      }
    } catch (e) {
      // Fallback for strings that URL() fails on, such as Cloud SQL names with multiple colons
      const regex = /^([^:]+):\/\/(.+):([^@]+)@([^/]+)(?:\/(.*))?/;
      const match = cleanUrl.match(regex);
      if (!match) {
        throw new Error(
          `Format not recognized for ${cleanUrl}. Use: protocol://user:pass@host/db`,
        );
      }
      scheme = match[1].trim();
      user = match[2].trim();
      pass = match[3].trim();
      host = match[4].trim();
      db = match[5] ? match[5].trim() : "postgres";
    }

    // URL Decode credentials!
    user = decodeURIComponent(user.trim());
    pass = decodeURIComponent(pass.trim());

    host = host.trim();
    
    let pureDb = db ? db.trim() : "postgres";
    if (pureDb.includes('?')) {
       pureDb = pureDb.split('?')[0];
    }
    
    db = db ? db.trim() : "postgres"; 

    isPostgres = scheme.toLowerCase().includes("post");
    const type = isPostgres ? "pg" : "mysql";

    let hostWithoutPort = host.replace(/:\d+$/, "");
    let isCloudSql = hostWithoutPort.includes(":");
    let isGoogle = isCloudSql || url.startsWith('jdbc:google:');
    let publicIp = null;
    let useProxy = false;
    let localHost = host;
    
    const cloudSqlInstanceName = hostWithoutPort;

    if (isCloudSql) {
      try {
        const instanceParts = hostWithoutPort.split(":");
        const instanceName = instanceParts[instanceParts.length - 1];
        console.log(
          `...fetching details for Cloud SQL instance: ${instanceName} via gcloud`,
        );

        useProxy = isProxyRunning(instanceName);

        const instanceInfoStr = execSync(
          `gcloud sql instances describe ${instanceName} --format=json`,
          { encoding: "utf-8", stdio: "pipe" },
        );
        const instanceInfo = JSON.parse(instanceInfoStr);

        const primaryIpObj = instanceInfo.ipAddresses?.find(
          (ip) => ip.type === "PRIMARY",
        );
        const ip = primaryIpObj ? primaryIpObj.ipAddress : null;

        if (ip && ip.match(/^[0-9.]+$/)) {
          publicIp = ip;
          localHost = publicIp;
          console.log(
            `...resolved Public IP: ${publicIp}. Rewriting host in URL.`,
          );

          hostWithoutPort = publicIp;
          isCloudSql = false; 
        } else {
          console.warn(
            `...could not resolve valid Public IP for ${instanceName}, got: ${ip}`,
          );
        }

        if (useProxy) {
          console.log(
            `...Cloud SQL Proxy detected for ${instanceName}. Skipping local IP authorization.`,
          );
        } else {
          const localIp = execSync("curl -s https://ifconfig.me", {
            encoding: "utf-8",
            stdio: "pipe",
          }).trim();
          if (localIp && localIp.match(/^[0-9.]+$/)) {
            const authorizedNetworks =
              instanceInfo.settings?.ipConfiguration?.authorizedNetworks || [];
            const isAuthorized = authorizedNetworks.some(
              (net) => net.value === localIp || net.value === `${localIp}/32`,
            );

            if (!isAuthorized) {
              console.log(
                `...authorizing local IP ${localIp} on ${instanceName} (this may take a minute)`,
              );
              const existingNetworks = authorizedNetworks.map((n) => n.value);
              existingNetworks.push(`${localIp}/32`);
              const newNetworks = existingNetworks.join(",");
              execSync(
                `gcloud sql instances patch ${instanceName} --authorized-networks="${newNetworks}" --quiet`,
                { encoding: "utf-8", stdio: "pipe" },
              );
              console.log(`...successfully authorized ${localIp}`);
            } else {
              console.log(`...local IP ${localIp} is already authorized.`);
            }
          }
        }
      } catch (e) {
        console.warn(
          `...failed to fetch or update Cloud SQL instance details via gcloud: ${e.message}`,
        );
      }
    }

    const encodedUser = aggressiveEncode(user);
    const encodedPass = aggressiveEncode(pass);

    const protocol = isPostgres ? "jdbc:postgresql://" : "jdbc:mysql://";
    const port = host.includes(":") ? "" : (isPostgres ? ":5432" : ":3306");
    const ssl = isPostgres ? "ssl=true" : "useSSL=true";

    const sep = db.includes("?") ? "&" : "?";
    
    // Check if localHost already includes a port before appending the default port
    const localPort = localHost.includes(":") ? "" : port;
    
    // Construct local params (Node.js pg/mysql2 drivers usually prefer strings with embedded credentials, especially proxy)
    let localConnectionString;
    let localUrlWithoutCredentials;
    if (useProxy) {
      localUrlWithoutCredentials = `${scheme}://127.0.0.1${port}/${db}${sep}ssl=false`;
      localConnectionString = `${scheme}://${encodedUser}:${encodedPass}@127.0.0.1${port}/${db}${sep}ssl=false`;
    } else {
      localUrlWithoutCredentials = `${protocol}${localHost}${localPort}/${db}`;
      localConnectionString = `${protocol}${localHost}${localPort}/${db}${sep}user=${encodedUser}&password=${encodedPass}&${ssl}`;
    }

    // Ensure we strip conflicting SSL parameters from the naked url used for 3-argument calls
    if (localUrlWithoutCredentials.includes('?')) {
       localUrlWithoutCredentials = localUrlWithoutCredentials
         .replace(/([?&])sslmode=[^&]*(&|$)/gi, '$1')
         .replace(/([?&])ssl=[^&]*(&|$)/gi, '$1')
         .replace(/[?&]$/, '');
    }

    // Construct gas params
    let gasConnectionString, gasFullConnectionString, gasUrlWithoutCredentials;
    let isCloudSqlConnection = false;

    if (isGoogle && !isPostgres) {
      // Google Cloud SQL MySQL must use getCloudSqlConnection on Live Apps Script
      gasConnectionString = `jdbc:google:mysql://${cloudSqlInstanceName}/${pureDb}`;
      gasUrlWithoutCredentials = gasConnectionString;
      gasFullConnectionString = gasConnectionString; 
      isCloudSqlConnection = true;
    } else {
      // Standard getConnection for Postgres (Google or not) and Aiven MySQL
      gasConnectionString = `${protocol}${localHost}${localPort}/${pureDb}`;
      gasUrlWithoutCredentials = gasConnectionString;
      gasFullConnectionString = `${protocol}${localHost}${localPort}/${db}${sep}user=${encodedUser}&password=${encodedPass}&${ssl}`;
    }

    if (gasUrlWithoutCredentials.includes('?')) {
       gasUrlWithoutCredentials = gasUrlWithoutCredentials
         .replace(/([?&])sslmode=[^&]*(&|$)/gi, '$1')
         .replace(/([?&])ssl=[^&]*(&|$)/gi, '$1')
         .replace(/[?&]$/, '');
    }
    
    const proxyCommand = (isCloudSql || isGoogle) && cloudSqlInstanceName.includes(":") ? `cloud-sql-proxy ${cloudSqlInstanceName}` : "";

    const gasObj = {
      url: gasUrlWithoutCredentials,
      connectionString: gasConnectionString, // To be used as arg 1 to Jdbc.getConnection/getCloudSqlConnection
      user: user,                            // To be used as arg 2
      password: pass,                        // To be used as arg 3
      fullConnectionString: gasFullConnectionString, // Optional 1-arg approach if needed for logging
      isCloudSqlConnection,
      proxyCommand
    };

    const localObj = {
      url: localUrlWithoutCredentials,
      connectionString: localConnectionString,
      user: user,
      password: pass,
      fullConnectionString: localConnectionString,
      useProxy,
      proxyCommand
    };

    // Determine the current context. If this code is running locally under gas-fakes, 
    // `typeof ScriptApp` is defined and `ScriptApp.isFake` is true. On Live Apps Script, it's not.
    const isLocalContext = (typeof ScriptApp !== 'undefined' && ScriptApp.isFake);

    return {
      current: isLocalContext ? localObj : gasObj,
      gas: gasObj,
      local: localObj,
      host: localHost,
      proxyCommand,
      isGoogle,
      type
    };
  }
}

export const newFakeJdbcService = (...args) => Proxies.guard(new FakeJdbcService(...args));
