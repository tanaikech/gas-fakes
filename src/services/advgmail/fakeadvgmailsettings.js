import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Syncit } from '../../support/syncit.js';
import { Proxies } from '../../support/proxies.js';
import { newFakeAdvGmailSendAs } from './fakeadvgmailsendas.js';

export const newFakeAdvGmailSettings = (...args) => Proxies.guard(new FakeAdvGmailSettings(...args));

class FakeAdvGmailSettings extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'gmail', Syncit.fxGmail);
    this.gmail = mainService;
    this.__fakeObjectType = 'Gmail.Users.Settings';
  }

  get SendAs() {
    return newFakeAdvGmailSendAs(this.gmail);
  }
}
