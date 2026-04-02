import { Proxies } from '../../support/proxies.js';
import { Syncit } from '../../support/syncit.js';
import { newFakeJdbcStatement } from './fakejdbcstatement.js';

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

  getMetaData() {
    // Return an object that mimics DatabaseMetaData
    return Proxies.guard({
      __fakeObjectType: 'JdbcDatabaseMetaData',
      getURL: () => this._url
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
