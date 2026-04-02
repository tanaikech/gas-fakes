import { Proxies } from '../../support/proxies.js';
import { newFakeJdbcResultSetMetaData } from './fakejdbcresultsetmetadata.js';

class FakeJdbcResultSet {
  constructor(result) {
    this.__fakeObjectType = 'JdbcResultSet';
    this._rows = result.rows || [];
    this._fields = result.fields || [];
    this._currentIndex = -1;
    this._isClosed = false;
  }

  next() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    this._currentIndex++;
    return this._currentIndex < this._rows.length;
  }

  _getValue(columnIndex) {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    if (this._currentIndex < 0 || this._currentIndex >= this._rows.length) {
      throw new Error('No current row.');
    }
    // JDBC columns are 1-indexed
    const field = this._fields[columnIndex - 1];
    if (!field) throw new Error(`Invalid column index: ${columnIndex}`);
    return this._rows[this._currentIndex][field.name];
  }

  getString(columnIndex) {
    const val = this._getValue(columnIndex);
    return val !== null && val !== undefined ? String(val) : null;
  }

  getInt(columnIndex) {
    const val = this._getValue(columnIndex);
    return val !== null && val !== undefined ? parseInt(val, 10) : 0;
  }

  getFloat(columnIndex) {
    const val = this._getValue(columnIndex);
    return val !== null && val !== undefined ? parseFloat(val) : 0.0;
  }
  
  getDate(columnIndex) {
    const val = this._getValue(columnIndex);
    return val ? new Date(val) : null;
  }

  getObject(columnIndex) {
    return this._getValue(columnIndex);
  }

  getMetaData() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    return newFakeJdbcResultSetMetaData(this._fields);
  }

  close() {
    this._isClosed = true;
    this._rows = [];
    this._fields = [];
  }

  isClosed() {
    return this._isClosed;
  }
}

export const newFakeJdbcResultSet = (...args) => Proxies.guard(new FakeJdbcResultSet(...args));
