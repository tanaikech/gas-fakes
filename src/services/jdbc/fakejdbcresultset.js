import { Proxies } from '../../support/proxies.js';
import { newFakeJdbcResultSetMetaData } from './fakejdbcresultsetmetadata.js';
import { FakeJdbcBigDecimal } from './fakejdbcbigdecimal.js';

class FakeJdbcResultSet {
  constructor(result, statement) {
    this.__fakeObjectType = 'JdbcResultSet';
    this._rows = result.rows || [];
    this._fields = result.fields || [];
    this._currentIndex = -1;
    this._isClosed = false;
    this._statement = statement;
    this._lastValue = null;
    this._fetchSize = 0;
    this._fetchDirection = 1000; // FETCH_FORWARD
    this._type = 1003; // TYPE_FORWARD_ONLY
    this._concurrency = 1007; // CONCUR_READ_ONLY
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
    const val = this._rows[this._currentIndex][field.name];
    this._lastValue = val;
    return val;
  }

  wasNull() {
    return this._lastValue === null || this._lastValue === undefined;
  }

  absolute(row) {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    if (row === 0) throw new Error('Rows are 1-indexed.');
    if (row > 0) {
      this._currentIndex = row - 1;
    } else {
      this._currentIndex = this._rows.length + row;
    }
    return this._currentIndex >= 0 && this._currentIndex < this._rows.length;
  }

  afterLast() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    this._currentIndex = this._rows.length;
  }

  beforeFirst() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    this._currentIndex = -1;
  }

  first() {
    return this.absolute(1);
  }

  last() {
    return this.absolute(-1);
  }

  previous() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    if (this._currentIndex > -1) {
      this._currentIndex--;
    }
    return this._currentIndex >= 0 && this._currentIndex < this._rows.length;
  }

  relative(rows) {
    return this.absolute(this._currentIndex + 1 + rows);
  }

  isAfterLast() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    return this._currentIndex >= this._rows.length && this._rows.length > 0;
  }

  isBeforeFirst() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    return this._currentIndex < 0 && this._rows.length > 0;
  }

  isFirst() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    return this._currentIndex === 0 && this._rows.length > 0;
  }

  isLast() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    return this._currentIndex === this._rows.length - 1 && this._rows.length > 0;
  }

  getRow() {
    if (this._isClosed) throw new Error('ResultSet is closed.');
    if (this._currentIndex < 0 || this._currentIndex >= this._rows.length) return 0;
    return this._currentIndex + 1;
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

  getByte(columnIndex) {
    return this.getInt(columnIndex);
  }

  getTime(columnIndex) {
    return this.getDate(columnIndex);
  }

  getURL(columnIndex) {
    return this.getString(columnIndex);
  }

  getFetchDirection() {
    return this._fetchDirection;
  }

  getFetchSize() {
    return this._fetchSize;
  }

  getType() {
    return this._type;
  }

  getConcurrency() {
    return this._concurrency;
  }

  setFetchDirection(direction) {
    this._fetchDirection = direction;
  }

  setFetchSize(rows) {
    this._fetchSize = rows;
  }

  getStatement() {
    return this._statement;
  }

  getWarnings() {
    return null;
  }

  clearWarnings() {
    // No-op for fake
  }

  isClosed() {
    return this._isClosed;
  }
}

export const newFakeJdbcResultSet = (...args) => Proxies.guard(new FakeJdbcResultSet(...args));
