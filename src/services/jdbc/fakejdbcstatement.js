import { Proxies } from '../../support/proxies.js';
import { Syncit } from '../../support/syncit.js';
import { newFakeJdbcResultSet } from './fakejdbcresultset.js';

class FakeJdbcStatement {
  constructor(connectionId) {
    this.__fakeObjectType = 'JdbcStatement';
    this._connectionId = connectionId;
    this._isClosed = false;
    this._batch = [];
  }

  addBatch(sql) {
    if (this._isClosed) throw new Error('Statement is closed.');
    this._batch.push(sql);
  }

  executeBatch() {
    if (this._isClosed) throw new Error('Statement is closed.');
    const results = [];
    for (const sql of this._batch) {
      const result = Syncit.fxJdbcQuery(this._connectionId, sql);
      results.push(result.rowCount || 0);
    }
    this.clearBatch();
    return results;
  }

  clearBatch() {
    this._batch = [];
  }

  executeQuery(sql) {
    if (this._isClosed) throw new Error('Statement is closed.');
    
    // Fetch result synchronously from worker
    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    this._lastUpdateCount = -1;
    this._lastResultSet = newFakeJdbcResultSet(result);
    return this._lastResultSet;
  }

  execute(sql) {
    if (this._isClosed) throw new Error('Statement is closed.');
    
    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    this._lastUpdateCount = result.rowCount;
    if (result.fields && result.fields.length > 0) {
      this._lastResultSet = newFakeJdbcResultSet(result);
      return true;
    } else {
      this._lastResultSet = null;
      return false;
    }
  }

  executeUpdate(sql) {
    if (this._isClosed) throw new Error('Statement is closed.');
    const result = Syncit.fxJdbcQuery(this._connectionId, sql);
    this._lastUpdateCount = result.rowCount;
    this._lastResultSet = null;
    return result.rowCount;
  }

  getUpdateCount() {
    return this._lastUpdateCount || 0;
  }

  getResultSet() {
    return this._lastResultSet;
  }

  close() {
    this._isClosed = true;
    this._lastResultSet = null;
  }

  isClosed() {
    return this._isClosed;
  }
}

export const newFakeJdbcStatement = (...args) => Proxies.guard(new FakeJdbcStatement(...args));
