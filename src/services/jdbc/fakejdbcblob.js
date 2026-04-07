import { Proxies } from '../../support/proxies.js';
import { newFakeInputStream } from '../../support/fakeinputstream.js';

class FakeJdbcBlob {
  constructor(data) {
    this.__fakeObjectType = 'JdbcBlob';
    // Ensure we have a Buffer/Uint8Array
    this._data = (data instanceof Uint8Array || Buffer.isBuffer(data)) 
      ? data 
      : Buffer.from(data || '');
    this._isClosed = false;
  }

  getBinaryStream() {
    if (this._isClosed) throw new Error('Blob is closed.');
    return newFakeInputStream(this._data);
  }

  getBytes(pos, len) {
    if (this._isClosed) throw new Error('Blob is closed.');
    // pos is 1-indexed in JDBC
    const start = pos - 1;
    const end = start + len;
    return Array.from(this._data.slice(start, end));
  }

  length() {
    if (this._isClosed) throw new Error('Blob is closed.');
    return this._data.length;
  }

  position(pattern, start) {
    if (this._isClosed) throw new Error('Blob is closed.');
    // Simple implementation for parity
    const patternBuffer = (pattern instanceof FakeJdbcBlob) ? pattern._data : Buffer.from(pattern);
    const index = this._data.indexOf(patternBuffer, start - 1);
    return index === -1 ? -1 : index + 1;
  }

  setBinaryStream(pos) {
    // Not fully supported in fake, but allows setting direction
    return this.getBinaryStream();
  }

  setBytes(pos, bytes) {
    if (this._isClosed) throw new Error('Blob is closed.');
    const start = pos - 1;
    const newBytes = Buffer.from(bytes);
    const newData = Buffer.alloc(Math.max(this._data.length, start + newBytes.length));
    this._data.copy(newData);
    newBytes.copy(newData, start);
    this._data = newData;
    return newBytes.length;
  }

  truncate(len) {
    if (this._isClosed) throw new Error('Blob is closed.');
    this._data = this._data.slice(0, len);
  }

  free() {
    this._isClosed = true;
    this._data = null;
  }
}

export const newFakeJdbcBlob = (...args) => Proxies.guard(new FakeJdbcBlob(...args));
