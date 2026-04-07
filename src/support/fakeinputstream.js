import { Proxies } from './proxies.js';

class FakeInputStream {
  constructor(data) {
    this.__fakeObjectType = 'InputStream';
    this._data = data instanceof Uint8Array ? data : Buffer.from(data || '');
    this._pos = 0;
  }

  read() {
    if (this._pos >= this._data.length) return -1;
    return this._data[this._pos++];
  }

  available() {
    return this._data.length - this._pos;
  }

  close() {
    this._pos = this._data.length;
  }
}

class FakeReader {
  constructor(data) {
    this.__fakeObjectType = 'Reader';
    this._data = String(data || '');
    this._pos = 0;
  }

  read() {
    if (this._pos >= this._data.length) return -1;
    return this._data.charCodeAt(this._pos++);
  }

  close() {
    this._pos = this._data.length;
  }
}

export const newFakeInputStream = (...args) => Proxies.guard(new FakeInputStream(...args));
export const newFakeReader = (...args) => Proxies.guard(new FakeReader(...args));
