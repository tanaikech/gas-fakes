import { FakeAdvResource } from '../common/fakeadvresource.js';
import { Syncit } from '../../support/syncit.js';
import { gError } from '../../support/helpers.js';
import { Proxies } from '../../support/proxies.js';

export const newFakeAdvGmailSendAs = (...args) => Proxies.guard(new FakeAdvGmailSendAs(...args));

export class FakeAdvGmailSendAs extends FakeAdvResource {
  constructor(mainService) {
    super(mainService, 'users', Syncit.fxGmail); // The resource path for SendAs is typically under 'users'
    this.gmail = mainService;
    this.__fakeObjectType = 'Gmail.Users.Settings.SendAs';
    this.__aliases = [
      {
        sendAsEmail: 'primary@example.com',
        isPrimary: true,
        displayName: 'Primary Account',
        isDefault: true,
        verificationStatus: 'accepted',
      },
      {
        sendAsEmail: 'alias@example.com',
        isPrimary: false,
        displayName: 'Alias Account',
        isDefault: false,
        verificationStatus: 'accepted',
      },
    ];
  }

  list(userId) {
    // In a real scenario, this would fetch from a mocked Gmail API or an internal store.
    // For now, return the hardcoded aliases.
    return { sendAs: this.__aliases };
  }
}