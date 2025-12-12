import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Syncit } from '../../support/syncit.js';
import { signatureArgs, ssError, gError } from '../../support/helpers.js';
import { newFakeAdvGmailLabels } from './fakeadvgmaillabels.js';
import { newFakeAdvGmailDrafts } from './fakeadvgmaildrafts.js';
import { newFakeAdvGmailSettings } from './fakeadvgmailsettings.js';

import { Proxies } from '../../support/proxies.js';
import { Utils } from '../../support/utils.js';
const { is } = Utils

export const newFakeAdvGmailUsers = (...args) => Proxies.guard(new FakeAdvGmailUsers(...args))

class FakeAdvGmailUsers extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'gmail', Syncit.fxGmail);
    this.gmail = mainService;
    this.__fakeObjectType = 'Gmail.Users';
  }

  get Labels() {
    return newFakeAdvGmailLabels(this.gmail);
  }

  get Drafts() {
    return newFakeAdvGmailDrafts(this.gmail);
  }

  get Settings() {
    return newFakeAdvGmailSettings(this.gmail);
  }

}
