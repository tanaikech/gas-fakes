import { Proxies } from '../../support/proxies.js';
import { newFakeJdbcResultSetMetaData } from './fakejdbcresultsetmetadata.js';
import { FakeJdbcBigDecimal } from './fakejdbcbigdecimal.js';

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

  _getValue(columnIdentifier) {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    if (this._currentIndex < 0 || this._currentIndex >= this._rows.length) {
      throw new Error('No current row.');
    }
    
    let index;
    if (typeof columnIdentifier === 'number') {
      index = columnIdentifier;
    } else {
      index = this.findColumn(columnIdentifier);
    }
    
    // JDBC columns are 1-indexed
    const field = this._fields[index - 1];
    if (!field) throw new Error(`Invalid column identifier: ${columnIdentifier}`);
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

  getLong(columnIndex) {
    return this.getInt(columnIndex);
  }

  getShort(columnIndex) {
    return this.getInt(columnIndex);
  }

  getBoolean(columnIndex) {
    const val = this._getValue(columnIndex);
    return Boolean(val);
  }

  getFloat(columnIndex) {
    const val = this._getValue(columnIndex);
    return val !== null && val !== undefined ? parseFloat(val) : 0.0;
  }

  getDouble(columnIndex) {
    return this.getFloat(columnIndex);
  }

  getBigDecimal(columnIndex) {
    const val = this._getValue(columnIndex);
    return val !== null && val !== undefined ? new FakeJdbcBigDecimal(val) : null;
  }
  
  getDate(columnIndex) {
    const val = this._getValue(columnIndex);
    return val ? new Date(val) : null;
  }

  getTimestamp(columnIndex) {
    return this.getDate(columnIndex);
  }

  getObject(columnIndex) {
    return this._getValue(columnIndex);
  }

  findColumn(columnLabel) {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    const index = this._fields.findIndex(f => f.name.toLowerCase() === columnLabel.toLowerCase());
    if (index === -1) throw new Error(`Column not found: ${columnLabel}`);
    return index + 1;
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
