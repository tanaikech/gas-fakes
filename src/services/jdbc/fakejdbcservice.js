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
   * @param {string|object} user (optional) The user name to connect as, or an object of property/value pairs.
   * @param {string} password (optional) The password for the user.
   * @returns {JdbcConnection} A JDBC connection object.
   */
  getConnection(url, user, password) {
    let finalUrl = url;

    if (!finalUrl) {
      throw new Error('Jdbc.getConnection: URL is required or DATABASE_URL must be set in environment');
    }

    // Explicitly merge user/password into the URL structure for gas-fakes processing
    if (typeof user === 'object' && user !== null) {
      // Handling info object
      const info = user;
      const u = info.user || info.userName;
      const p = info.password;
      if (u && p) {
        finalUrl = this._mergeCredentials(finalUrl, u, p);
      }
      // Note: other info properties aren't currently merged into the URL string,
      // but Syncit.fxJdbcConnect will receive the info object anyway.
    } else if (user !== undefined && user !== null && password !== undefined && password !== null) {
      finalUrl = this._mergeCredentials(finalUrl, user, password);
    }
    
    // Pass user (which might be the info object) and password to the connection
    return newFakeJdbcConnection(finalUrl, user, password);
  }

  _mergeCredentials(url, user, password) {
    try {
      const cleanUrl = url.replace(/^jdbc:google:/, '').replace(/^jdbc:/, '');
      const urlObj = new URL(cleanUrl);
      urlObj.username = encodeURIComponent(String(user));
      urlObj.password = encodeURIComponent(String(password));
      
      // Restore the prefix
      let prefix = "jdbc:";
      if (url.startsWith("jdbc:google:")) prefix = "jdbc:google:";
      return prefix + urlObj.toString();
    } catch (e) {
      return url; // Fallback for malformed URLs
    }
  }

  /**
   * Connects to a Google Cloud SQL instance.
   * @param {string} url The URL of the database to connect to.
   * @param {string|object} user (optional) The user name to connect as, or an object of property/value pairs.
   * @param {string} password (optional) The password for the user.
   * @returns {JdbcConnection} A JDBC connection object.
   */
  getCloudSqlConnection(url, user, password) {
    return this.getConnection(url, user, password);
  }

  __useProxy  (val) {
    if (!val) return false;
    const normal = this.__normalConnection (val)
    return normal.local.useProxy;
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

    let scheme, user, pass, host, db, searchString = "";

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
      db = parsed.pathname.replace(/^\//, ''); 
      
      const remainingParams = new URLSearchParams(parsed.search);
      if (!user && remainingParams.has('user')) user = remainingParams.get('user');
      if (!pass && remainingParams.has('password')) pass = remainingParams.get('password');
      remainingParams.delete('user');
      remainingParams.delete('password');
      
      searchString = remainingParams.toString();
      if (searchString) {
        db = `${db}?${searchString}`;
      }
    } catch (e) {
      const regex = /^([^:]+):\/\/(.+):([^@]+)@([^/]+)(?:\/(.*))?/;
      const match = cleanUrl.match(regex);
      if (!match) throw new Error(`Format not recognized for ${cleanUrl}`);
      scheme = match[1].trim();
      user = match[2].trim();
      pass = match[3].trim();
      host = match[4].trim();
      db = match[5] ? match[5].trim() : "postgres";
    }

    user = decodeURIComponent(user.trim());
    pass = decodeURIComponent(pass.trim());
    host = host.trim();
    
    let pureDb = db ? db.trim() : "postgres";
    if (pureDb.includes('?')) pureDb = pureDb.split('?')[0];

    const isPostgres = scheme.toLowerCase().includes("post");
    const type = isPostgres ? "pg" : "mysql";
    const protocol = isPostgres ? "jdbc:postgresql://" : "jdbc:mysql://";
    const defaultPort = isPostgres ? ":5432" : ":3306";

    let hostWithoutPort = host.replace(/:\d+$/, "");
    let isCloudSql = hostWithoutPort.includes(":");
    let isGoogle = isCloudSql || url.startsWith('jdbc:google:');
    let useProxy = false;
    let remoteHost = host;
    
    const cloudSqlInstanceName = hostWithoutPort;

    if (isCloudSql) {
      try {
        const instanceParts = hostWithoutPort.split(":");
        const instanceName = instanceParts[instanceParts.length - 1];
        useProxy = isProxyRunning(instanceName);

        const instanceInfoStr = execSync(`gcloud sql instances describe ${instanceName} --format=json`, { encoding: "utf-8", stdio: "pipe" });
        const instanceInfo = JSON.parse(instanceInfoStr);
        const primaryIpObj = instanceInfo.ipAddresses?.find((ip) => ip.type === "PRIMARY");
        const ip = primaryIpObj ? primaryIpObj.ipAddress : null;

        if (ip && ip.match(/^[0-9.]+$/)) {
          remoteHost = ip;
        }

        if (!useProxy) {
          const localIp = execSync("curl -s https://ifconfig.me", { encoding: "utf-8", stdio: "pipe" }).trim();
          if (localIp && localIp.match(/^[0-9.]+$/)) {
            const authorizedNetworks = instanceInfo.settings?.ipConfiguration?.authorizedNetworks || [];
            if (!authorizedNetworks.some((net) => net.value === localIp || net.value === `${localIp}/32`)) {
              const newNetworks = authorizedNetworks.map((n) => n.value).concat(`${localIp}/32`).join(",");
              execSync(`gcloud sql instances patch ${instanceName} --authorized-networks="${newNetworks}" --quiet`, { encoding: "utf-8", stdio: "pipe" });
            }
          }
        }
      } catch (e) {}
    }

    if (!remoteHost.includes(":")) remoteHost += defaultPort;

    const encodedUser = aggressiveEncode(user);
    const encodedPass = aggressiveEncode(pass);
    
    // Live Apps Script Java JDBC requires properly encoded URI components to prevent "Connection URL is malformed"
    const gasAuthQuery = (encodedUser || encodedPass) ? `?user=${encodedUser}&password=${encodedPass}` : '';
    
    // --- GAS --- (Rule 3: Strip ALL SSL/Tunneling parameters)
    let gasUrl, gasConnectionString, gasFullConnectionString;
    let isCloudSqlConnection = false;

    if (isGoogle && !isPostgres) {
      gasUrl = `jdbc:google:mysql://${cloudSqlInstanceName}/${pureDb}`;
      gasConnectionString = gasUrl;
      gasFullConnectionString = gasUrl;
      isCloudSqlConnection = true;
    } else {
      gasUrl = `${protocol}${remoteHost}/${pureDb}`;
      gasConnectionString = gasUrl;
      // Single-argument getConnection is discouraged on GAS, but if used, only append credentials
      gasFullConnectionString = `${protocol}${remoteHost}/${pureDb}${gasAuthQuery}`;
    }

    // --- LOCAL ---
    let localHostAddr = useProxy ? `127.0.0.1${defaultPort}` : remoteHost;
    let localSslParam = useProxy ? "ssl=false" : "";
    let localAuthParams = (encodedUser || encodedPass) ? `user=${encodedUser}&password=${encodedPass}` : '';
    
    // Add an ampersand if both auth params and ssl param exist
    if (localAuthParams && localSslParam) {
       localAuthParams += "&";
    }

    let localUrl = `${protocol}${localHostAddr}/${pureDb}`;
    let localQuery = `${localAuthParams}${localSslParam}`;
    let localConnectionString = `${protocol}${localHostAddr}/${pureDb}${localQuery ? '?' + localQuery : ''}`;
    let localFullConnectionString = localConnectionString;

    const proxyCommand = (isCloudSql || isGoogle) && cloudSqlInstanceName.includes(":") ? `cloud-sql-proxy ${cloudSqlInstanceName}` : "";

    const gasObj = {
      url: gasUrl,
      connectionString: gasConnectionString,
      user, password: pass,
      fullConnectionString: gasFullConnectionString,
      isCloudSqlConnection,
      proxyCommand
    };

    const localObj = {
      url: localUrl,
      connectionString: localConnectionString,
      user, password: pass,
      fullConnectionString: localFullConnectionString,
      useProxy, proxyCommand
    };

    return {
      current: (typeof ScriptApp !== 'undefined' && ScriptApp.isFake) ? 'local' : 'gas',
      gas: gasObj,
      local: localObj,
      host: remoteHost,
      proxyCommand,
      isGoogle, type
    };
  }
}

export const newFakeJdbcService = (...args) => Proxies.guard(new FakeJdbcService(...args));
