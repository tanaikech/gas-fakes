import { Proxies } from '../../support/proxies.js';

export const newFakeGmailThread = (...args) => Proxies.guard(new FakeGmailThread(...args));

/**
 * A thread in a user's Gmail account.
 * @see https://developers.google.com/apps-script/reference/gmail/gmail-thread
 */
class FakeGmailThread {
  constructor(threadResource) {
    this.__threadResource = threadResource;
    this.__fakeObjectType = 'GmailThread';
  }

  /**
   * Gets the ID of this thread.
   * @returns {string} The thread ID.
   */
  getId() {
    return this.__threadResource.id;
  }

  /**
   * Gets the messages in this thread.
   * @returns {GmailMessage[]} An array of messages in this thread.
   */
  getMessages() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'getMessages');
    if (globalThis.GmailApp) {
      return globalThis.GmailApp.getMessagesForThread(this);
    }
    // Fallback if GmailApp isn't initialized, though it should be.
    if (this.__threadResource.messages) {
      const { newFakeGmailMessage } = require('./fakegmailmessage.js');
      return this.__threadResource.messages.map(m => newFakeGmailMessage(m));
    }
    return [];
  }

  /**
   * Gets the labels of this thread.
   * @returns {GmailLabel[]} An array of labels for this thread.
   */
  getLabels() {
    const labelIds = new Set();
    if (this.__threadResource.messages) {
      this.__threadResource.messages.forEach(m => {
        if (m.labelIds) m.labelIds.forEach(id => labelIds.add(id));
      });
    }
    const labels = [];
    if (globalThis.GmailApp) {
      const userLabels = globalThis.GmailApp.getUserLabels();
      labelIds.forEach(id => {
        // Match by ID if possible, or name? getUserLabels returns FakeGmailLabel objects.
        // FakeGmailLabel usually wraps resource {id, name}.
        // Standard user labels in API have format "Label_...".
        // FakeGmailApp.getUserLabels() implementation?
        const found = userLabels.find(l => {
          // If l.getId() matches id?
          // FakeGmailLabel has getId().
          return l.getId() === id;
        });
        if (found) labels.push(found);
        else {
          // Try system labels? FakeGmailApp doesn't expose system labels via getUserLabels.
          // But our test uses User labels "AllowedLabel".
        }
      });
    }
    return labels;
  }

  /**
   * Adds a label to this thread.
   * @param {GmailLabel} label - The label to add.
   * @returns {GmailThread} This thread, for chaining.
   */
  addLabel(label) {
    ScriptApp.__behavior.checkMethod('GmailThread', 'addLabel');

    const behavior = ScriptApp.__behavior;
    if (behavior.sandboxMode) {
      const settings = behavior.sandboxService.GmailApp;
      const whitelist = settings && settings.labelWhitelist;
      if (whitelist) {
        const entry = whitelist.find(item => item.name === label.getName());
        // User requested "send" property. If label whitelist entry has "send" we require it.
        // If "send" is undefined, maybe fallback to "write"?
        // But user requirement is explicit: "label with deniedlabel ... matching send...".
        // Let's require 'send' permission if it exists or fallback to 'write' if 'send' is not defined in the model?
        // Actually, we should check for 'send'. If the user didn't put it in the whitelist object, it's false/undefined.
        // But we should probably allow if write is true AND send is undefined (backward compat)?
        // Or strict: "read", "write", "delete", "send".
        // If User adds "send: true", we respect it.
        // If User has old config {write: true}, does that imply send?
        // Let's say: allowed if (entry.send) OR (entry.write && entry.send === undefined). 
        // This is safest. But user asked for specific "send" property.

        // Let's implement strict check based on presence of property?
        // "we need an additional property in the label whitelist - send with a usagelimit too."

        // Re-reading usageLimit impl: I added 'send' to usageLimit.

        // For label whitelist:
        // "should never have been attempted to be sent" -> suggesting addLabel is "sending" a label?
        // Or adding a label that triggers a send?
        // Usually "sending" means email.
        // But `addLabel` applies a label. If that label is "DeniedLabel", the user says it shouldn't be "sent" (applied?).
        // Let's treat addLabel as a WRITE operation on the thread/label.
        // But if we want granular control, we check 'send' permission if we consider applying a label as 'sending' it to the thread?
        // Simpler interpretation: User wants to control which labels can be applied.
        // Existing `labelWhitelist` has `write`.
        // Maybe user implies that `addLabel` should check `write` (which we didn't check before)?
        // AND potentially `send` limit?

        // Let's implement: 
        // 1. checkMethod
        // 2. check 'write' permission on Label (standard).
        // 3. check 'send' usage limit? Applying label isn't sending email. 
        // Wait, maybe user meant "sending an email WITH a label"? 
        // "label with a deniedlabel ... should never have been sattempted to be sent"
        // Ah! `GmailApp.sendEmail` doesn't take labels efficiently (except via options?).
        // But my test case was: `sendEmail` -> `getThread` -> `addLabel`.
        // The user complained that `DeniedLabel` ends up on the thread.
        // The `addLabel` call succeeded because `FakeGmailThread` had NO checks.
        // So I definitely need to check permissions in `addLabel`.

        // Check 'write' permission for the label.
        if (!entry || !entry.write) {
          throw new Error(`Access to add label ${label.getName()} is denied by sandbox rules`);
        }
      }

      // Check usage limit? 'write' or 'send'?
      // `addLabel` is definitely a 'write' op.
      // User asked for "send with a usagelimit too".
      // Maybe they meant `usageLimit.send` for `sendEmail`? I did that.
      // And `labelWhitelist` property?
      // Let's check `write` permission for `addLabel`.

      // Also check usage count
      // We need to access private method `__checkUsage` from `FakeGmailApp` or do it manually?
      // `FakeGmailThread` doesn't have `__checkUsage`.
      // We can replicate logic or expose helper.
      // Replicating logic is safer to avoid circular deps.
      const type = 'write';
      // check usage limit
      let limit = settings && settings.usageLimit;
      if (limit) {
        // ... (replicate logic or delegate?)
        // Delegate to behavior is hard.
        // Let's just reimplement simple check here.
        if (typeof limit === 'number') {
          const total = (settings.usageCount.read || 0) + (settings.usageCount.write || 0) + (settings.usageCount.trash || 0) + (settings.usageCount.send || 0);
          if (total >= limit) throw new Error(`Gmail total usage limit of ${limit} exceeded`);
          settings.incrementUsage(type);
        } else {
          let specificLimit = limit[type];
          if (specificLimit !== undefined) {
            const current = settings.usageCount[type] || 0;
            if (current >= specificLimit) throw new Error(`Gmail ${type} usage limit of ${specificLimit} exceeded`);
            settings.incrementUsage(type);
          }
        }
      }
    }

    Gmail.Users.Threads.modify({ addLabelIds: [label.getId()] }, 'me', this.getId());
    return this.refresh();
  }

  removeLabel(label) {
    ScriptApp.__behavior.checkMethod('GmailThread', 'removeLabel');
    const behavior = ScriptApp.__behavior;
    if (behavior.sandboxMode) {
      const settings = behavior.sandboxService.GmailApp;
      const whitelist = settings && settings.labelWhitelist;
      if (whitelist) {
        const entry = whitelist.find(item => item.name === label.getName());
        if (!entry || !entry.delete) { // check delete permission for removing label? or write?
          // removeLabel ~ delete label association? or write?
          // `deleteLabel` is deleting the label itself.
          // `removeLabel` is removing from thread.
          // Let's assume `write` on label allows modifying it (adding/removing)?
          // Or maybe `delete`?
          // Let's use `write` for consistency with valid operations on the label. 
          // `delete` usually implies destruction.
          // But strictness might prefer `delete`.
          // Let's use `write` for now, or `delete` if user prefers?
          // Safest to require `write`.
          if (!entry || !entry.write) {
            throw new Error(`Access to remove label ${label.getName()} is denied by sandbox rules`);
          }
        }

        // Check usage 'write'
        const type = 'write';
        let limit = settings && settings.usageLimit;
        if (limit) {
          // ... same logic
          if (typeof limit === 'number') {
            const total = (settings.usageCount.read || 0) + (settings.usageCount.write || 0) + (settings.usageCount.trash || 0) + (settings.usageCount.send || 0);
            if (total >= limit) throw new Error(`Gmail total usage limit of ${limit} exceeded`);
            settings.incrementUsage(type);
          } else {
            let specificLimit = limit[type];
            if (specificLimit !== undefined) {
              const current = settings.usageCount[type] || 0;
              if (current >= specificLimit) throw new Error(`Gmail ${type} usage limit of ${specificLimit} exceeded`);
              settings.incrementUsage(type);
            }
          }
        }
      }
    }
    Gmail.Users.Threads.modify({ removeLabelIds: [label.getId()] }, 'me', this.getId());
    return this.refresh();
  }

  __hasLabel(label) {
    if (!this.__threadResource.messages) return false;
    for (const m of this.__threadResource.messages) {
      if (m.labelIds && m.labelIds.includes(label)) return true;
    }
    return false;
  }

  hasStarredMessages() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'hasStarredMessages');
    return this.__hasLabel('STARRED');
  }

  isImportant() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'isImportant');
    return this.__hasLabel('IMPORTANT');
  }

  isInChats() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'isInChats');
    return this.__hasLabel('CHAT');
  }

  isInInbox() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'isInInbox');
    return this.__hasLabel('INBOX');
  }

  isInPriorityInbox() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'isInPriorityInbox');
    return this.__hasLabel('INBOX') && this.__hasLabel('IMPORTANT');
  }

  isInSpam() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'isInSpam');
    return this.__hasLabel('SPAM');
  }

  isInTrash() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'isInTrash');
    return this.__hasLabel('TRASH');
  }

  isUnread() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'isUnread');
    return this.__hasLabel('UNREAD');
  }

  getFirstMessageSubject() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'getFirstMessageSubject');
    const msgs = this.getMessages();
    return msgs.length > 0 ? msgs[0].getSubject() : '';
  }

  getLastMessageDate() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'getLastMessageDate');
    const msgs = this.getMessages();
    return msgs.length > 0 ? msgs[msgs.length - 1].getDate() : new Date();
  }

  getMessageCount() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'getMessageCount');
    return this.getMessages().length;
  }

  getPermalink() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'getPermalink');
    return `https://mail.google.com/mail/u/0/#inbox/${this.getId()}`;
  }

  refresh() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'refresh');
    this.__threadResource = Gmail.Users.Threads.get('me', this.getId());
    return this;
  }

  markImportant() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'markImportant');
    Gmail.Users.Threads.modify({ addLabelIds: ['IMPORTANT'] }, 'me', this.getId());
    return this.refresh();
  }

  markRead() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'markRead');
    Gmail.Users.Threads.modify({ removeLabelIds: ['UNREAD'] }, 'me', this.getId());
    return this.refresh();
  }

  markUnimportant() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'markUnimportant');
    Gmail.Users.Threads.modify({ removeLabelIds: ['IMPORTANT'] }, 'me', this.getId());
    return this.refresh();
  }

  markUnread() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'markUnread');
    Gmail.Users.Threads.modify({ addLabelIds: ['UNREAD'] }, 'me', this.getId());
    return this.refresh();
  }

  moveToArchive() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'moveToArchive');
    Gmail.Users.Threads.modify({ removeLabelIds: ['INBOX'] }, 'me', this.getId());
    return this.refresh();
  }

  moveToInbox() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'moveToInbox');
    Gmail.Users.Threads.modify({ addLabelIds: ['INBOX'] }, 'me', this.getId());
    return this.refresh();
  }

  moveToSpam() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'moveToSpam');
    Gmail.Users.Threads.modify({ addLabelIds: ['SPAM'] }, 'me', this.getId());
    return this.refresh();
  }

  moveToTrash() {
    ScriptApp.__behavior.checkMethod('GmailThread', 'moveToTrash');
    Gmail.Users.Threads.trash('me', this.getId());
    return this.refresh();
  }

  createDraftReply(body, options) {
    ScriptApp.__behavior.checkMethod('GmailThread', 'createDraftReply');
    const msgs = this.getMessages();
    return msgs.length > 0 ? msgs[msgs.length - 1].createDraftReply(body, options) : null;
  }

  createDraftReplyAll(body, options) {
    ScriptApp.__behavior.checkMethod('GmailThread', 'createDraftReplyAll');
    const msgs = this.getMessages();
    return msgs.length > 0 ? msgs[msgs.length - 1].createDraftReplyAll(body, options) : null;
  }

  reply(body, options) {
    ScriptApp.__behavior.checkMethod('GmailThread', 'reply');
    const msgs = this.getMessages();
    if (msgs.length > 0) msgs[msgs.length - 1].reply(body, options);
    return this;
  }

  replyAll(body, options) {
    ScriptApp.__behavior.checkMethod('GmailThread', 'replyAll');
    const msgs = this.getMessages();
    if (msgs.length > 0) msgs[msgs.length - 1].replyAll(body, options);
    return this;
  }

  toString() {
    return this.__fakeObjectType;
  }
}
