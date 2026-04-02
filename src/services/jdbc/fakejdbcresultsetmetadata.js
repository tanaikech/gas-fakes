import { Proxies } from '../../support/proxies.js';

class FakeJdbcResultSetMetaData {
  constructor(fields) {
    this.__fakeObjectType = 'JdbcResultSetMetaData';
    this._fields = fields || [];
  }

  getColumnCount() {
    return this._fields.length;
  }

  getColumnName(column) {
    const field = this._fields[column - 1];
    if (!field) throw new Error(`Invalid column index: ${column}`);
    return field.name;
  }

  getColumnLabel(column) {
    return this.getColumnName(column);
  }

  getColumnType(column) {
    // Return approximate JDBC type from pg dataTypeID
    const field = this._fields[column - 1];
    if (!field) throw new Error(`Invalid column index: ${column}`);
    // node-postgres gives type ids (OIDs) like 23 for INT4, 25 for TEXT
    // Usually JDBC maps them to java.sql.Types integers. For a fake, returning the OID or a mock type integer is adequate for basic use cases.
    return field.dataTypeID;
  }

  getColumnTypeName(column) {
    const field = this._fields[column - 1];
    if (!field) throw new Error(`Invalid column index: ${column}`);
    return `TYPE_${field.dataTypeID}`; // basic fallback
  }
}

export const newFakeJdbcResultSetMetaData = (...args) => Proxies.guard(new FakeJdbcResultSetMetaData(...args));
