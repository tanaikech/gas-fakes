import { createMimeMessage } from './fakemimemessage.js';
import { Proxies } from '../../support/proxies.js';
import { newFakeGmailLabel } from './fakegmaillabel.js';
import { newFakeGmailDraft } from './fakegmaildraft.js';
import { newFakeGmailMessage } from './fakegmailmessage.js';
import { newFakeGmailThread } from './fakegmailthread.js';

/**
 * Provides access to Gmail threads, messages, and labels.
 */
class FakeGmailApp {
  constructor() {
    this.__fakeObjectType = 'GmailApp';
  }

  /**
   * Creates a draft email message.
   * @param {string} recipient a comma-separated list of email addresses
   * @param {string} subject the subject of the message
   * @param {string} body the body of the message
   * @param {object} options an object of optional parameters
   * @returns {GmailDraft} the newly created draft
   */
  createDraft(recipient, subject, body, options) {
    // this is a fairly naive implementation of rfc2822
    const raw = createMimeMessage(recipient, subject, body, options);

    // rfc4648 url safe alphabet
    const encoded = Utilities.base64Encode(raw, Utilities.Charset.UTF_8)
      .replace(/\+/g, '-').replace(/\//g, '_');

    const draft = Gmail.Users.Drafts.create({ message: { raw: encoded } }, 'me');
    if (ScriptApp.__behavior.sandboxMode) {
      if (draft.id) ScriptApp.__behavior.addGmailId(draft.id);
      if (draft.message && draft.message.id) ScriptApp.__behavior.addGmailId(draft.message.id);
      if (draft.message && draft.message.threadId) ScriptApp.__behavior.addGmailId(draft.message.threadId);
    }
    return newFakeGmailDraft(draft);
  }

  /**
   * Creates a new user label.
   * @param {string} name The name of the new label.
   * @returns {GmailLabel} The new label.
   */
  createLabel(name) {
    const behavior = ScriptApp.__behavior;
    if (behavior.sandboxMode) {
      const settings = behavior.sandboxService.GmailApp;
      const whitelist = settings && settings.labelWhitelist;
      if (whitelist) {
        const entry = whitelist.find(item => item.name === name);
        if (!entry || !entry.write) {
          throw new Error(`Create label access to ${name} is denied by sandbox rules`);
        }
      }
    }
    const newLabelResource = Gmail.newLabel().setName(name);
    const createdLabelResource = Gmail.Users.Labels.create(newLabelResource, 'me');
    if (behavior.sandboxMode) behavior.addGmailId(createdLabelResource.id);
    return newFakeGmailLabel(createdLabelResource);
  }

  /**
   * Gets a list of user-created labels.
   * @returns {GmailLabel[]} An array of user-created labels.
   */
  getUserLabels() {
    const { labels } = Gmail.Users.Labels.list('me');
    // The documentation for GmailApp.getUserLabels() says "user-created labels".
    // The live environment follows this, so we will filter for type 'user'.
    return labels ? labels.filter(l => l.type === 'user').map(labelResource => newFakeGmailLabel(labelResource)) : [];
  }
  /**
   * Deletes the specified label.
   * @param {GmailLabel} label The label to delete.
   * @returns {GmailApp} The Gmail service, useful for chaining.
   */
  deleteLabel(label) {
    const behavior = ScriptApp.__behavior;
    if (behavior.sandboxMode) {
      const settings = behavior.sandboxService.GmailApp;
      const whitelist = settings && settings.labelWhitelist;
      if (whitelist) {
        const name = label.getName();
        const entry = whitelist.find(item => item.name === name);
        if (!entry || !entry.delete) {
          throw new Error(`Delete label access to ${name} is denied by sandbox rules`);
        }
      }
    }
    Gmail.Users.Labels.remove('me', label.getId());
    return this;
  }

  /**
   * Gets a list of the emails that are set up as aliases for this account in Gmail.
   * // TODO it looks like live apps script does not count the primary email as an alias, but the api does
   * @returns {string[]} An array of aliases for this account.
   */
  getAliases() {
    const { sendAs } = Gmail.Users.Settings.SendAs.list('me');
    let aliases = sendAs ? sendAs.map(alias => alias.sendAsEmail) : [];

    // The live Apps Script environment typically does not include the primary email in getAliases()
    // even though the underlying Gmail API might return it as a 'sendAs' address.
    if (!ScriptApp.isFake) {
      const primaryEmail = Session.getActiveUser().getEmail();
      aliases = aliases.filter(alias => alias !== primaryEmail);
    }
    return aliases;
  }

  /**
   * Retrieve an email message draft by ID.
   * @param {string} draftId The ID of the draft to retrieve.
   * @returns {GmailDraft} The draft with the given ID.
   */
  getDraft(draftId) {
    const draftResource = Gmail.Users.Drafts.get('me', draftId);
    return newFakeGmailDraft(draftResource);
  }

  /**
   * Retrieves all draft messages.
   * @returns {GmailMessage[]} An array of draft Gmail messages.
   */
  getDraftMessages() {
    const { drafts } = Gmail.Users.Drafts.list('me');
    return drafts ? drafts.map(draft => newFakeGmailMessage(draft.message)) : [];
  }

  /**
   * Gets all Gmail draft messages.
   * @returns {GmailDraft[]} An array of Gmail draft messages.
   */
  getDrafts() {
    const { drafts } = Gmail.Users.Drafts.list('me');
    return drafts ? drafts.map(draft => newFakeGmailDraft(draft)) : [];
  }

  /**
   * Retrieves all Inbox threads irrespective of labels.
   * @param {number} [start] - The index of the first thread to return.
   * @param {number} [max] - The maximum number of threads to return.
   * @returns {GmailThread[]} An array of Gmail threads in the Inbox.
   */
  getInboxThreads(start, max) {
    return this._getThreads('in:inbox', start, max);
  }

  /**
   * Gets the number of unread threads in the inbox.
   * @returns {number} The number of threads in the inbox that have unread messages.
   */
  getInboxUnreadCount() {
    return this._getThreads('in:inbox is:unread', 0, 500).length;
  }

  getPriorityInboxThreads(start, max) {
    return this._getThreads('in:inbox is:important', start, max);
  }

  getPriorityInboxUnreadCount() {
    return this._getThreads('in:inbox is:important is:unread', 0, 500).length;
  }

  getSpamThreads(start, max) {
    return this._getThreads('in:spam', start, max);
  }

  getSpamUnreadCount() {
    return this._getThreads('in:spam is:unread', 0, 500).length;
  }

  getStarredThreads(start, max) {
    return this._getThreads('is:starred', start, max);
  }

  getStarredUnreadCount() {
    return this._getThreads('is:starred is:unread', 0, 500).length;
  }

  getTrashThreads(start, max) {
    return this._getThreads('in:trash', start, max);
  }

  /**
   * Search for threads.
   * @param {string} query The query string.
   * @param {number} [start] The index of the first thread to return.
   * @param {number} [max] The maximum number of threads to return.
   * @returns {GmailThread[]} An array of Gmail threads.
   */
  search(query, start, max) {
    return this._getThreads(query, start, max);
  }


  /**
  /**
   * Private helper to get threads with pagination.
   * @param {string} q The query string.
   * @param {number} [start=0] The index of the first thread to return.
   * @param {number} [max=500] The maximum number of threads to return.
   * @returns {GmailThread[]} An array of Gmail threads.
   * @private
   */
  _getThreads(q, start = 0, max = 500) {

    // Sandbox label read check
    const behavior = ScriptApp.__behavior;
    if (behavior.sandboxMode) {
      const settings = behavior.sandboxService.GmailApp;
      const whitelist = settings && settings.labelWhitelist;
      if (whitelist) {
        const labelMatches = q.match(/(?:label|l|in):(\S+)/g);
        if (labelMatches) {
          labelMatches.forEach(match => {
            const labelName = match.split(':')[1].replace(/"/g, '');
            const entry = whitelist.find(item => item.name === labelName);
            if (!entry || !entry.read) {
              throw new Error(`Read access to label ${labelName} is denied by sandbox rules`);
            }
          });
        }
      }
    }

    const threads = [];
    let pageToken;

    do {
      const params = {
        q,
        pageToken,
        maxResults: Math.min(max, 500) // The API max is 500
      };

      const page = Gmail.Users.Threads.list('me', params);
      if (page.threads) {
        threads.push(...page.threads);
      }
      pageToken = page.nextPageToken;

    } while (pageToken && threads.length < start + max);

    // Filter threads for access
    const accessibleThreads = threads.filter(t => {
      try {
        this._checkThreadAccess(t.id);
        return true;
      } catch (e) {
        return false;
      }
    });

    const sliced = accessibleThreads.slice(start, max !== undefined ? start + max : undefined);
    return sliced.map(thread => newFakeGmailThread(thread));
  }

  getMessageById(id) {
    const messageResource = Gmail.Users.Messages.get('me', id);
    return newFakeGmailMessage(messageResource);
  }

  getMessagesForThread(thread) {
    const threadResource = Gmail.Users.Threads.get('me', thread.getId());
    return threadResource.messages ? threadResource.messages.map(message => newFakeGmailMessage(message)) : [];
  }

  getMessagesForThreads(threads) {
    return threads.map(thread => this.getMessagesForThread(thread));
  }

  _checkThreadAccess(threadId) {
    const behavior = ScriptApp.__behavior;
    if (!behavior.sandboxMode) return true;

    // 1. Session check
    if (behavior.isKnownGmail(threadId)) return true;

    // 2. Whitelist check
    const settings = behavior.sandboxService.GmailApp;
    const whitelist = settings && settings.labelWhitelist; // Array of {name, read, ...}

    if (!whitelist) return false; // Sandbox on, no whitelist -> deny external

    // Fetch thread details to see labels
    const thread = Gmail.Users.Threads.get('me', threadId);
    // historyId, messages, id, snippet... 
    // We need labels. messages[0].labelIds? Thread resource doesn't list labels directly at top level?
    // Wait, Gmail API Thread resource: "id", "snippet", "historyId", "messages".
    // Labels are on messages. But Apps Script treats threads as having labels.
    // GmailApp.search uses "label:foo".
    // Typically if any message in thread has label, thread has label.
    // Let's collect all distinct labelIds from all messages.
    const labelIds = new Set();
    if (thread.messages) {
      thread.messages.forEach(m => {
        if (m.labelIds) m.labelIds.forEach(l => labelIds.add(l));
      });
    }

    // Map system label IDs to names if needed? "INBOX", "SENT", "TRASH", "SPAM", "IMPORTANT" (STARRED?)
    // Apps Script/Gmail API uses system ids like "INBOX". Whitelist usually uses names like "Inbox"?
    // User requirement: "label whitelist".
    // Let's assume whitelist names match IDs or we normalize.
    // User might say "inbox" (lowercase) or "INBOX". 
    // Let's try case-insensitive match for convenience or strict ID match. 
    // "INBOX", "UNREAD", "STARRED" are IDs. User labels are "Label_x" IDs but have names.
    // `Gmail.Users.Labels.list` gives mapping.
    // This is getting expensive if we fetch full label list every time.
    // For now, let's assume whitelist contains NAMES, and we match against NAMES.
    // But messages have IDs.
    // We might need to resolve IDs to names.
    // Optimization: If `isKnownGmail` failed, we are here.

    // Shortcut: if whitelist has "INBOX" and thread has "INBOX", allow.
    // But for user labels, we need to know that "Label_3" is "MyLabel".
    // We can fetch label list once or rely on the fact that `FakeGmailLabel` usually simulates this mapping?
    // In `gas-fakes`, how are labels stored? `Gmail.Users.Labels` ...

    // Let's optimistically match IDs first (System labels).
    for (const lid of labelIds) {
      const found = whitelist.find(w => w.name === lid || w.name === lid.toUpperCase() || w.name.toUpperCase() === lid);
      if (found && found.read) return true;
    }

    // If not found by ID, maybe it's a user label ID like "Label_5". We need to fetch label.
    // Because this is 'fake' environment, maybe we can peek at labels?
    // Or just fetch the label resource for that ID.
    for (const lid of labelIds) {
      try {
        const l = Gmail.Users.Labels.get('me', lid);
        if (l) {
          const found = whitelist.find(w => w.name === l.name);
          if (found && found.read) return true;
        }
      } catch (e) { }
    }

    throw new Error(`Access to thread ${threadId} is denied. No whitelisted label found.`);
  }

  getThreadById(id) {
    this._checkThreadAccess(id);
    const threadResource = Gmail.Users.Threads.get('me', id);
    return newFakeGmailThread(threadResource);
  }
  /**
   * Sends an email message.
   * @param {string} recipient - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {string} body - The body of the email.
   * @param {object} [options] - Optional parameters.
   * @returns {GmailApp} - The Gmail service.
   */
  sendEmail(recipient, subject, body, options) {
    const serviceName = 'GmailApp';
    const behavior = ScriptApp.__behavior;

    // Check sandbox rules
    if (behavior.sandboxMode) {
      const settings = behavior.sandboxService[serviceName];
      const whitelist = settings && settings.emailWhitelist;
      const usageLimit = settings && settings.usageLimit;


      // 1. Email Whitelist
      if (whitelist) {
        // Recipients can be comma-separated
        const recipients = recipient.split(',').map(r => r.trim());
        recipients.forEach(r => {
          if (!whitelist.includes(r)) {
            // Also check regex matching if implemented, but simple string match for now as per requirement 1
            // "only send to email addresses on a white list"
            throw new Error(`Email sending to ${r} is denied by sandbox whitelist rules`);
          }
        });
      }

      // 2. Usage Limit
      if (usageLimit !== null && usageLimit !== undefined) {
        if (settings.usageCount >= usageLimit) {
          throw new Error(`Email usage limit of ${usageLimit} exceeded`);
        }
        settings.incrementUsage();
      }
    }

    // Reuse createMimeMessage logic from createDraft
    const raw = createMimeMessage(recipient, subject, body, options);
    // rfc4648 url safe alphabet
    const encoded = Utilities.base64Encode(raw, Utilities.Charset.UTF_8)
      .replace(/\+/g, '-').replace(/\//g, '_');

    const res = Gmail.Users.Messages.send({ raw: encoded }, 'me');
    if (behavior.sandboxMode) {
      if (res.id) behavior.addGmailId(res.id);
      if (res.threadId) behavior.addGmailId(res.threadId);
    }
    return this;
  }

  /**
   * Moves a thread to the trash.
   * @param {GmailThread} thread - The thread to be trashed.
   * @returns {GmailApp} - The Gmail service.
   */
  moveThreadToTrash(thread) {
    this._checkThreadAccess(thread.getId());
    Gmail.Users.Threads.trash('me', thread.getId());
    return this;
  }
}

export const newFakeGmailApp = (...args) => Proxies.guard(new FakeGmailApp(...args));