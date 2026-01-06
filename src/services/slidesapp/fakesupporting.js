import { Proxies } from '../../support/proxies.js';

export const newFakeNotesPage = (...args) => {
  return Proxies.guard(new FakeNotesPage(...args));
};

export class FakeNotesPage {
  constructor(resource) {
    this.__resource = resource;
  }
  toString() {
    return 'NotesPage';
  }
}

export const newFakeLayout = (...args) => {
  return Proxies.guard(new FakeLayout(...args));
};

export class FakeLayout {
  constructor(resource) {
    this.__resource = resource;
  }
  getObjectId() {
    return this.__resource.objectId;
  }
  toString() {
    return 'Layout';
  }
}

export const newFakeMaster = (...args) => {
  return Proxies.guard(new FakeMaster(...args));
};

export class FakeMaster {
  constructor(resource) {
    this.__resource = resource;
  }
  getObjectId() {
    return this.__resource.objectId;
  }
  toString() {
    return 'Master';
  }
}

export const newFakePageElement = (...args) => {
  return Proxies.guard(new FakePageElement(...args));
};

export class FakePageElement {
  constructor(resource) {
    this.__resource = resource;
  }
  getObjectId() {
    return this.__resource.objectId;
  }
  toString() {
    return 'PageElement';
  }
}

export const newFakePageBackground = (...args) => {
  return Proxies.guard(new FakePageBackground(...args));
};

export class FakePageBackground {
  constructor(resource) {
    this.__resource = resource;
  }
  toString() {
    return 'PageBackground';
  }
}
