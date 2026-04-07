import { Proxies } from '../../support/proxies.js';
import { Syncit } from '../../support/syncit.js';
import { newFakeJdbcResultSet } from './fakejdbcresultset.js';

class FakeJdbcPreparedStatement {
  constructor(connection, connectionId, sql) {
    this.__fakeObjectType = 'JdbcPreparedStatement';
    this._connection = connection;
    this._connectionId = connectionId;
    this._sql = sql;
    this._params = [];
    this._batch = [];
    this._isClosed = false;
    this._fetchSize = 0;
    this._maxRows = 0;
    this._queryTimeout = 0;
    this._maxFieldSize = 0;
    this._fetchDirection = 1000; // FETCH_FORWARD
    this._isPoolable = false;
    this._lastUpdateCount = -1;
  }

  cancel() { }
  clearWarnings() { }
  getConnection() { return this._connection; }
  getFetchDirection() { return this._fetchDirection; }
  getFetchSize() { return this._fetchSize; }
  getGeneratedKeys() { return newFakeJdbcResultSet({ fields: [], rows: [] }, this); }
  getMaxFieldSize() { return this._maxFieldSize; }
  getMaxRows() { return this._maxRows; }
  getMoreResults(current) { return false; }
  getQueryTimeout() { return this._queryTimeout; }
  getResultSetConcurrency() { return 1007; }
  getResultSetHoldability() { return 1; }
  getResultSetType() { return 1003; }
  getWarnings() { return null; }
  isPoolable() { return this._isPoolable; }
  setCursorName(name) { }
  setEscapeProcessing(enable) { }
  setFetchDirection(direction) { this._fetchDirection = direction; }
  setFetchSize(rows) { this._fetchSize = rows; }
  setMaxFieldSize(max) { this._maxFieldSize = max; }
  setMaxRows(max) { this._maxRows = max; }
  setPoolable(poolable) { this._isPoolable = poolable; }
  setQueryTimeout(seconds) { this._queryTimeout = seconds; }

  getMetaData() {
    return this._lastResultSet ? this._lastResultSet.getMetaData() : null;
  }

  addBatch() {
    if (this._isClosed) throw new Error('Statement is closed.');
    this._batch.push([...this._params]);
  }

  executeBatch() {
    if (this._isClosed) throw new Error('Statement is closed.');
    const results = [];
    for (const params of this._batch) {
      const result = Syncit.fxJdbcExecutePrepared(this._connectionId, this._sql, params);
      results.push(result.rowCount || 0);
    }
    this.clearBatch();
    return results;
  }

  clearBatch() {
    this._batch = [];
  }

  executeQuery() {
    if (this._isClosed) throw new Error('Statement is closed.');
    const result = Syncit.fxJdbcExecutePrepared(this._connectionId, this._sql, this._params);
    this._lastUpdateCount = -1;
    this._lastResultSet = newFakeJdbcResultSet(result, this);
    return this._lastResultSet;
  }

  executeUpdate() {
    if (this._isClosed) throw new Error('Statement is closed.');
    const result = Syncit.fxJdbcExecutePrepared(this._connectionId, this._sql, this._params);
    this._lastUpdateCount = result.rowCount;
    this._lastResultSet = null;
    return result.rowCount;
  }

  execute() {
    if (this._isClosed) throw new Error('Statement is closed.');
    const result = Syncit.fxJdbcExecutePrepared(this._connectionId, this._sql, this._params);
    this._lastUpdateCount = result.rowCount;
    if (result.fields && result.fields.length > 0) {
      this._lastResultSet = newFakeJdbcResultSet(result, this);
      return true;
    } else {
      this._lastResultSet = null;
      return false;
    }
  }

  setBoolean(index, value) { this._params[index - 1] = Boolean(value); }
  setDouble(index, value) { this._params[index - 1] = Number(value); }
  setFloat(index, value) { this._params[index - 1] = Number(value); }
  setInt(index, value) { this._params[index - 1] = parseInt(value, 10); }
  setLong(index, value) { this._params[index - 1] = parseInt(value, 10); }
  setString(index, value) { this._params[index - 1] = String(value); }
  setBigDecimal(index, value) { 
    this._params[index - 1] = value !== null && value !== undefined ? String(value) : null; 
  }
  setObject(index, value) { this._params[index - 1] = value; }
  setNull(index, type) { this._params[index - 1] = null; }
  clearParameters() { this._params = []; }
  setTimestamp(index, value) { 
    // GAS uses JdbcTimestamp, but we'll use standard Date/String for fake
    this._params[index - 1] = value instanceof Date ? value.toISOString() : String(value); 
  }

  getUpdateCount() { return this._lastUpdateCount || 0; }
  getResultSet() { return this._lastResultSet; }

  close() {
    this._isClosed = true;
    this._lastResultSet = null;
  }

  isClosed() {
    return this._isClosed;
  }
}

export const newFakeJdbcPreparedStatement = (...args) => Proxies.guard(new FakeJdbcPreparedStatement(...args));
