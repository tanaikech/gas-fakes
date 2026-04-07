import { Proxies } from '../../support/proxies.js';
import { Syncit } from '../../support/syncit.js';
import { newFakeJdbcStatement } from './fakejdbcstatement.js';
import { newFakeJdbcPreparedStatement } from './fakejdbcpreparedstatement.js';

class FakeJdbcConnection {
  constructor(url, user, password) {
    this.__fakeObjectType = 'JdbcConnection';
    this._url = url;
    
    // Connect synchronously using the worker
    // Only pass arguments that are provided to avoid passing null/undefined to Syncit
    const args = [url];
    if (user !== null && typeof user !== 'undefined') args.push(user);
    if (password !== null && typeof password !== 'undefined') args.push(password);
    
    const result = Syncit.fxJdbcConnect(...args);
    this._connectionId = result.id;
  }

  createStatement() {
    return newFakeJdbcStatement(this._connectionId);
  }

  prepareStatement(sql) {
    return newFakeJdbcPreparedStatement(this._connectionId, sql);
  }

  commit() {
    Syncit.fxJdbcCommit(this._connectionId);
  }

  rollback() {
    Syncit.fxJdbcRollback(this._connectionId);
  }

  setAutoCommit(autoCommit) {
    Syncit.fxJdbcSetAutoCommit(this._connectionId, autoCommit);
  }

  getAutoCommit() {
    // We don't currently track this in the proxy, but GAS default is true
    return true; 
  }

  getMetaData() {
    // Return an object that mimics DatabaseMetaData
    const url = this._url;
    return Proxies.guard({
      __fakeObjectType: 'JdbcDatabaseMetaData',
      getURL: () => url,
      getUserName: () => {
         try {
           const u = new URL(url.replace(/^jdbc:google:/, '').replace(/^jdbc:/, ''));
           return u.username;
         } catch(e) { return "unknown"; }
      },
      getDatabaseProductName: () => url.includes("postgres") ? "PostgreSQL" : "MySQL",
      getDatabaseProductVersion: () => "Unknown",
      getDriverName: () => "gas-fakes-jdbc-driver",
      getDriverVersion: () => "1.0"
    });
  }

  // To match GAS JdbcConnection basic capabilities
  close() {
    if (this._connectionId) {
      Syncit.fxJdbcClose(this._connectionId);
      this._connectionId = null;
    }
  }

  isClosed() {
    return !this._connectionId;
  }
}

export const newFakeJdbcConnection = (...args) => Proxies.guard(new FakeJdbcConnection(...args));
