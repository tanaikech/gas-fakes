
/**
 * Advanced gmail service
 */
import { Proxies } from '../../support/proxies.js';
import { advClassMaker } from '../../support/helpers.js';
import { gmailCacher } from '../../support/gmailcacher.js';

const propsList = {  "newModifyMessageRequest": ["addLabelIds", "removeLabelIds"], "newObliterateCseKeyPairRequest": [], "newFilter": ["action", "criteria", "id"], "newHardwareKeyMetadata": ["description"], "newImapSettings": ["autoExpunge", "enabled", "expungeBehavior", "maxFolderSize"], "newDisableCseKeyPairRequest": [], "newFilterAction": ["addLabelIds", "forward", "removeLabelIds"], "newMessagePartHeader": ["name", "value"], "newVacationSettings": ["enableAutoReply", "endTime", "responseBodyHtml", "responseBodyPlainText", "responseSubject", "restrictToContacts", "restrictToDomain", "startTime"], "newFilterCriteria": ["excludeChats", "from", "hasAttachment", "negatedQuery", "query", "size", "sizeComparison", "subject", "to"], "newModifyThreadRequest": ["addLabelIds", "removeLabelIds"], "newSmimeInfo": ["encryptedKeyPassword", "expiration", "id", "isDefault", "issuerCn", "pem", "pkcs12"], "newMessage": ["historyId", "id", "internalDate", "labelIds", "payload", "raw", "sizeEstimate", "snippet", "threadId"], "newMessagePartBody": ["attachmentId", "data", "size"], "newBatchDeleteMessagesRequest": ["ids"], "newCsePrivateKeyMetadata": ["hardwareKeyMetadata", "kaclsKeyMetadata", "privateKeyMetadataId"], "newAutoForwarding": ["disposition", "emailAddress", "enabled"], "newLabelColor": ["backgroundColor", "textColor"], "newLanguageSettings": ["displayLanguage"], "newBatchModifyMessagesRequest": ["addLabelIds", "ids", "removeLabelIds"], "newForwardingAddress": ["forwardingEmail", "verificationStatus"], "newSignAndEncryptKeyPairs": ["encryptionKeyPairId", "signingKeyPairId"], "newSendAs": ["displayName", "isDefault", "isPrimary", "replyToAddress", "sendAsEmail", "signature", "smtpMsa", "treatAsAlias", "verificationStatus"], "newSmtpMsa": ["host", "password", "port", "securityMode", "username"], "newMessagePart": ["body", "filename", "headers", "mimeType", "partId", "parts"], "newLabel": ["color", "id", "labelListVisibility", "messageListVisibility", "messagesTotal", "messagesUnread", "name", "threadsTotal", "threadsUnread", "type"], "newWatchRequest": ["labelFilterAction", "labelFilterBehavior", "labelIds", "topicName"], "newKaclsKeyMetadata": ["kaclsData", "kaclsUri"], "newEnableCseKeyPairRequest": [], "newDraft": ["id", "message"], "newPopSettings": ["accessWindow", "disposition"], "newDelegate": ["delegateEmail", "verificationStatus"], "newCseIdentity": ["emailAddress", "primaryKeyPairId", "signAndEncryptKeyPairs"], "newCseKeyPair": ["disableTime", "enablementState", "keyPairId", "pem", "pkcs7", "privateKeyMetadata", "subjectEmailAddresses"] }


class FakeAdvGmail {
  constructor() {
    this.__fakeObjectType = "Gmail"

    Reflect.ownKeys(propLists).forEach(p => {
      this[p] = () => advClassMaker(propLists[p])
    })

  }
  toString() {
    return 'AdvancedServiceIdentifier{name=gmail, version=v1}'
  }

  getVersion() {
    return 'v1'
  }

  get Form() {
    return newFakeAdvFormsForm(this)
  }

  __getGmailPerformance() {
    return gmailCacher.getPerformance()
  }
}

export const newFakeAdvGmail = (...args) => Proxies.guard(new FakeAdvGmail(...args))
