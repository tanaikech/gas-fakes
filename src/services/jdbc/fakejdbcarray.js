import { Proxies } from '../../support/proxies.js';

class FakeJdbcArray {
  constructor(data, baseType, baseTypeName) {
    this.__fakeObjectType = 'JdbcArray';
    this._data = Array.isArray(data) ? data : [data];
    this._baseType = baseType || 12; // VARCHAR
    this._baseTypeName = baseTypeName || 'VARCHAR';
    this._isClosed = false;
  }

  getArray() {
    if (this._isClosed) throw new Error('Array is closed.');
    return this._data;
  }

  getBaseType() {
    return this._baseType;
  }

  getBaseTypeName() {
    return this._baseTypeName;
  }

  getResultSet() {
    // In actual JDBC this returns a result set with columns INDEX and VALUE
    // For now, returning null as it's rarely used in Apps Script JDBC context
    return null;
  }

  free() {
    this._isClosed = true;
    this._data = null;
  }
}

export const newFakeJdbcArray = (...args) => Proxies.guard(new FakeJdbcArray(...args));
