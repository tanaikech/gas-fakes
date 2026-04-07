import { Proxies } from '../../support/proxies.js';
import { newFakeInputStream, newFakeReader } from '../../support/fakeinputstream.js';

class FakeJdbcClob {
  constructor(data) {
    this.__fakeObjectType = 'JdbcClob';
    this._data = String(data || '');
    this._isClosed = false;
  }

  getAsciiStream() {
    if (this._isClosed) throw new Error('Clob is closed.');
    return newFakeInputStream(Buffer.from(this._data, 'ascii'));
  }

  getCharacterStream() {
    if (this._isClosed) throw new Error('Clob is closed.');
    return newFakeReader(this._data);
  }

  getSubString(pos, len) {
    if (this._isClosed) throw new Error('Clob is closed.');
    // pos is 1-indexed
    return this._data.substring(pos - 1, pos - 1 + len);
  }

  length() {
    if (this._isClosed) throw new Error('Clob is closed.');
    return this._data.length;
  }

  position(pattern, start) {
    if (this._isClosed) throw new Error('Clob is closed.');
    const searchPattern = (pattern instanceof FakeJdbcClob) ? pattern._data : String(pattern);
    const index = this._data.indexOf(searchPattern, start - 1);
    return index === -1 ? -1 : index + 1;
  }

  setAsciiStream(pos) {
    return this.getAsciiStream();
  }

  setCharacterStream(pos) {
    return this.getCharacterStream();
  }

  setString(pos, str) {
    if (this._isClosed) throw new Error('Clob is closed.');
    const start = pos - 1;
    const prefix = this._data.substring(0, start).padEnd(start, ' ');
    const suffix = this._data.substring(start + str.length);
    this._data = prefix + str + suffix;
    return str.length;
  }

  truncate(len) {
    if (this._isClosed) throw new Error('Clob is closed.');
    this._data = this._data.substring(0, len);
  }

  free() {
    this._isClosed = true;
    this._data = null;
  }
}

export const newFakeJdbcClob = (...args) => Proxies.guard(new FakeJdbcClob(...args));
