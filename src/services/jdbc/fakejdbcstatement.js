import { Proxies } from '../../support/proxies.js';
import { Syncit } from '../../support/syncit.js';
import { newFakeJdbcResultSet } from './fakejdbcresultset.js';

class FakeJdbcStatement {
  constructor(connectionId) {
    this.__fakeObjectType = 'JdbcStatement';
    this._connectionId = connectionId;
    this._isClosed = false;
  }

  executeQuery(sql) {
    if (this._isClosed) throw new Error('Statement is closed.');
    
    // Fetch result synchronously from worker
    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    
    return newFakeJdbcResultSet(result);
  }

  execute(sql) {
    if (this._isClosed) throw new Error('Statement is closed.');
    
    // In actual JDBC, execute returns true if the first result is a ResultSet
    // node-postgres gives us an array of rows or a rowCount.
    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    return result.fields && result.fields.length > 0;
  }

  close() {
    this._isClosed = true;
  }

  isClosed() {
    return this._isClosed;
  }
}

export const newFakeJdbcStatement = (...args) => Proxies.guard(new FakeJdbcStatement(...args));
