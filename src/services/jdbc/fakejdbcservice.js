import { Proxies } from '../../support/proxies.js';
import { newFakeJdbcConnection } from './fakejdbcconnection.js';

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
    let finalUser = user;
    let finalPassword = password;

    if (!finalUrl && process.env.DATABASE_URL) {
      finalUrl = process.env.DATABASE_URL;
    }

    if (!finalUrl) {
      throw new Error('Jdbc.getConnection: URL is required or DATABASE_URL must be set in environment');
    }
    
    return newFakeJdbcConnection(finalUrl, finalUser, finalPassword);
  }

  /**
   * Connects to a Google Cloud SQL instance.
   * @param {string} url The URL of the database to connect to.
   * @param {string} user (optional) The user name to connect as.
   * @param {string} password (optional) The password for the user.
   * @returns {JdbcConnection} A JDBC connection object.
   */
  getCloudSqlConnection(url, user, password) {
    let finalUrl = url;
    let finalUser = user;
    let finalPassword = password;
    
    if (url && url.startsWith('jdbc:google:')) {
       const isMysql = url.includes('mysql');
       if (isMysql) {
         finalUrl = process.env.CLOUD_SQL_DATABASE_MYSQL_URL || url;
       } else {
         finalUrl = process.env.CLOUD_SQL_DATABASE_PG_URL || process.env.CLOUD_SQL_DATABASE_URL || url;
       }
       
       // Try to extract user/pass if provided in the URL string
       try {
         const cleanUrl = finalUrl.replace(/^jdbc:google:/, '').replace(/^jdbc:/, '');
         const regex = /^([^:]+):\/\/(.+):([^@]+)@([^/]+)(?:\/(.*))?/;
         const match = cleanUrl.match(regex);
         if (match) {
           // We found credentials embedded in the URL from the environment
           if (!finalUser) finalUser = decodeURIComponent(match[2].trim());
           if (!finalPassword) finalPassword = decodeURIComponent(match[3].trim());
         }
       } catch (e) {
         // Silently fail parsing, rely on explicit params or downstream handling
       }
    }
    
    return newFakeJdbcConnection(finalUrl, finalUser, finalPassword);
  }

  parseCsv(csv) {
    throw new Error('Not implemented: parseCsv');
  }
}

export const newFakeJdbcService = (...args) => Proxies.guard(new FakeJdbcService(...args));
