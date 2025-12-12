import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Proxies } from '../../support/proxies.js';
import { gError, normalizeSerialization } from '../../support/helpers.js';
import { Syncit } from '../../support/syncit.js';

export const newFakeAdvGmailDrafts = (...args) => Proxies.guard(new FakeAdvGmailDrafts(...args));

class FakeAdvGmailDrafts extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'users', Syncit.fxGmail);
    this.gmail = mainService;
    this.__fakeObjectType = 'Gmail.Users.Drafts';
  }

  create(resource, userId) {
    const { data, response } = this._call(
      'create',
      { userId, requestBody: normalizeSerialization(resource) },
      null,
      'drafts'
    );
    gError(response, 'gmail', 'users.drafts.create');
    return data;
  }

  get(userId, id) {
    const { data, response } = this._call(
      'get',
      { userId, id },
      null,
      'drafts'
    );
    gError(response, 'gmail', 'users.drafts.get', true);
    return data;
  }

  list(userId, params = {}) {
    const { data, response } = this._call(
      'list',
      { userId, ...params, maxResults: 500 },
      null,
      'drafts'
    );
    gError(response, 'gmail', 'users.drafts.list');
    return data;
  }

  remove(userId, id) {
    const { data, response } = this._call('delete', { userId, id }, null, 'drafts');
    gError(response, 'gmail', 'users.drafts.delete', true);
    return data;
  }
}