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
    if (url && url.startsWith('jdbc:google:')) {
       finalUrl = process.env.CLOUD_SQL_DATABASE_URL || url;
    }
    
    return newFakeJdbcConnection(finalUrl, user, password);
  }

  parseCsv(csv) {
    throw new Error('Not implemented: parseCsv');
  }
}

export const newFakeJdbcService = (...args) => Proxies.guard(new FakeJdbcService(...args));
