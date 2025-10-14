/**
 * @file advchat/fakeadvchat.js
 * @author Bruce Mcpherson
 *
 * @description This is a fake for the advanced chat service
 *
 */
import { Proxies } from "../../support/proxies.js";
import { advClassMaker } from "../../support/helpers.js";
import { newFakeAdvChatSpaces } from "./fakeadvchatspaces.js";
import { chatCacher } from "../../support/chatcacher.js";

const propsList =
{
  newGoogleAppsCardV1Columns: [
    "columnItems"
  ],
  newCustomEmojiMetadata: [
    "customEmoji"
  ],
  newCustomEmoji: [
    "emojiName",
    "name",
    "payload",
    "temporaryImageUri",
    "uid"
  ],
  newPermissionSetting: [
    "managersAllowed",
    "membersAllowed"
  ],
  newAttachmentDataRef: [
    "attachmentUploadToken",
    "resourceName"
  ],
  newGoogleAppsCardV1ActionParameter: [
    "key",
    "value"
  ],
  newGoogleAppsCardV1SwitchControl: [
    "controlType",
    "name",
    "onChangeAction",
    "selected",
    "value"
  ],
  newGoogleAppsCardV1TextParagraph: [
    "maxLines",
    "text",
    "textSyntax"
  ],
  newGoogleAppsCardV1MaterialIcon: [
    "fill",
    "grade",
    "name",
    "weight"
  ],
  newGoogleAppsCardV1NestedWidget: [
    "buttonList",
    "image",
    "textParagraph"
  ],
  newUploadAttachmentRequest: [
    "filename"
  ],
  newMessage: [
    "accessoryWidgets",
    "actionResponse",
    "annotations",
    "argumentText",
    "attachedGifs",
    "attachment",
    "cards",
    "cardsV2",
    "clientAssignedMessageId",
    "createTime",
    "deleteTime",
    "deletionMetadata",
    "emojiReactionSummaries",
    "fallbackText",
    "formattedText",
    "lastUpdateTime",
    "matchedUrl",
    "name",
    "privateMessageViewer",
    "quotedMessageMetadata",
    "sender",
    "slashCommand",
    "space",
    "text",
    "thread",
    "threadReply"
  ],
  newImageButton: [
    "icon",
    "iconUrl",
    "name",
    "onClick"
  ],
  newSpaceReadState: [
    "lastReadTime",
    "name"
  ],
  newGoogleAppsCardV1CardAction: [
    "actionLabel",
    "onClick"
  ],
  newPermissionSettings: [
    "manageApps",
    "manageMembersAndGroups",
    "manageWebhooks",
    "modifySpaceDetails",
    "postMessages",
    "replyMessages",
    "toggleHistory",
    "useAtMentionAll"
  ],
  newEmoji: [
    "customEmoji",
    "unicode"
  ],
  newCard: [
    "cardActions",
    "header",
    "name",
    "sections"
  ],
  newColor: [
    "alpha",
    "blue",
    "green",
    "red"
  ],
  newRichLinkMetadata: [
    "calendarEventLinkData",
    "chatSpaceLinkData",
    "driveLinkData",
    "meetSpaceLinkData",
    "richLinkType",
    "uri"
  ],
  newDriveDataRef: [
    "driveFileId"
  ],
  newSpace: [
    "accessSettings",
    "adminInstalled",
    "createTime",
    "customer",
    "displayName",
    "externalUserAllowed",
    "importMode",
    "importModeExpireTime",
    "lastActiveTime",
    "membershipCount",
    "name",
    "permissionSettings",
    "predefinedPermissionSettings",
    "singleUserBotDm",
    "spaceDetails",
    "spaceHistoryState",
    "spaceThreadingState",
    "spaceType",
    "spaceUri",
    "threaded",
    "type"
  ],
  newGoogleAppsCardV1DecoratedText: [
    "bottomLabel",
    "bottomLabelText",
    "button",
    "contentText",
    "endIcon",
    "icon",
    "onClick",
    "startIcon",
    "startIconVerticalAlignment",
    "switchControl",
    "text",
    "topLabel",
    "topLabelText",
    "wrapText"
  ],
  newKeyValue: [
    "bottomLabel",
    "button",
    "content",
    "contentMultiline",
    "icon",
    "iconUrl",
    "onClick",
    "topLabel"
  ],
  newCalendarEventLinkData: [
    "calendarId",
    "eventId"
  ],
  newGoogleAppsCardV1CollapseControl: [
    "collapseButton",
    "expandButton",
    "horizontalAlignment"
  ],
  newQuotedMessageMetadata: [
    "lastUpdateTime",
    "name"
  ],
  newGoogleAppsCardV1ExpressionData: [
    "conditions",
    "eventActions",
    "expression",
    "id"
  ],
  newGoogleAppsCardV1EventAction: [
    "actionRuleId",
    "commonWidgetAction",
    "postEventTriggers"
  ],
  newGoogleAppsCardV1Divider: [],
  newMembership: [
    "createTime",
    "deleteTime",
    "groupMember",
    "member",
    "name",
    "role",
    "state"
  ],
  newGoogleAppsCardV1CardFixedFooter: [
    "primaryButton",
    "secondaryButton"
  ],
  newAnnotation: [
    "customEmojiMetadata",
    "length",
    "richLinkMetadata",
    "slashCommand",
    "startIndex",
    "type",
    "userMention"
  ],
  newDeletionMetadata: [
    "deletionType"
  ],
  newGoogleAppsCardV1ImageComponent: [
    "altText",
    "borderStyle",
    "cropStyle",
    "imageUri"
  ],
  newWorkflowDataSourceMarkup: [
    "includeVariables",
    "type"
  ],
  newGoogleAppsCardV1PlatformDataSource: [
    "commonDataSource",
    "hostAppDataSource"
  ],
  newGoogleAppsCardV1GridItem: [
    "id",
    "image",
    "layout",
    "subtitle",
    "title"
  ],
  newThread: [
    "name",
    "threadKey"
  ],
  newImage: [
    "aspectRatio",
    "imageUrl",
    "onClick"
  ],
  newGoogleAppsCardV1OnClick: [
    "action",
    "card",
    "openDynamicLinkAction",
    "openLink",
    "overflowMenu"
  ],
  newSlashCommandMetadata: [
    "bot",
    "commandId",
    "commandName",
    "triggersDialog",
    "type"
  ],
  newDriveLinkData: [
    "driveDataRef",
    "mimeType"
  ],
  newEmojiReactionSummary: [
    "emoji",
    "reactionCount"
  ],
  newDialog: [
    "body"
  ],
  newGoogleAppsCardV1Grid: [
    "borderStyle",
    "columnCount",
    "items",
    "onClick",
    "title"
  ],
  newUserMentionMetadata: [
    "type",
    "user"
  ],
  newGoogleAppsCardV1ChipList: [
    "chips",
    "layout"
  ],
  newGoogleAppsCardV1Section: [
    "collapseControl",
    "collapsible",
    "header",
    "id",
    "uncollapsibleWidgetsCount",
    "widgets"
  ],
  newGoogleAppsCardV1ImageCropStyle: [
    "aspectRatio",
    "type"
  ],
  newGoogleAppsCardV1TextInput: [
    "autoCompleteAction",
    "hintText",
    "hostAppDataSource",
    "initialSuggestions",
    "label",
    "name",
    "onChangeAction",
    "placeholderText",
    "type",
    "validation",
    "value"
  ],
  newGoogleAppsCardV1Suggestions: [
    "items"
  ],
  newSlashCommand: [
    "commandId"
  ],
  newGoogleAppsCardV1UpdateVisibilityAction: [
    "visibility"
  ],
  newGoogleAppsCardV1Validation: [
    "characterLimit",
    "inputType"
  ],
  newGoogleAppsCardV1BorderStyle: [
    "cornerRadius",
    "strokeColor",
    "type"
  ],
  newDialogAction: [
    "actionStatus",
    "dialog"
  ],
  newGoogleAppsCardV1Card: [
    "cardActions",
    "displayStyle",
    "expressionData",
    "fixedFooter",
    "header",
    "name",
    "peekCardHeader",
    "sectionDividerStyle",
    "sections"
  ],
  newGoogleAppsCardV1CardHeader: [
    "imageAltText",
    "imageType",
    "imageUrl",
    "subtitle",
    "title"
  ],
  newUser: [
    "displayName",
    "domainId",
    "isAnonymous",
    "name",
    "type"
  ],
  newGoogleAppsCardV1Column: [
    "horizontalAlignment",
    "horizontalSizeStyle",
    "verticalAlignment",
    "widgets"
  ],
  newButton: [
    "imageButton",
    "textButton"
  ],
  newGroup: [
    "name"
  ],
  newWidgetMarkup: [
    "buttons",
    "image",
    "keyValue",
    "textParagraph"
  ],
  newMembershipCount: [
    "joinedDirectHumanUserCount",
    "joinedGroupCount"
  ],
  newGoogleAppsCardV1OpenLink: [
    "onClose",
    "openAs",
    "url"
  ],
  newGoogleAppsCardV1OverflowMenuItem: [
    "disabled",
    "onClick",
    "startIcon",
    "text"
  ],
  newGoogleAppsCardV1SuggestionItem: [
    "text"
  ],
  newSelectionItems: [
    "items"
  ],
  newGoogleAppsCardV1Icon: [
    "altText",
    "iconUrl",
    "imageType",
    "knownIcon",
    "materialIcon"
  ],
  newCardAction: [
    "actionLabel",
    "onClick"
  ],
  newGoogleAppsCardV1CommonWidgetAction: [
    "updateVisibilityAction"
  ],
  newGoogleAppsCardV1Action: [
    "allWidgetsAreRequired",
    "function",
    "interaction",
    "loadIndicator",
    "parameters",
    "persistValues",
    "requiredWidgets"
  ],
  newTextParagraph: [
    "text"
  ],
  newCompleteImportSpaceRequest: [],
  newTextButton: [
    "onClick",
    "text"
  ],
  newFormAction: [
    "actionMethodName",
    "parameters"
  ],
  newGoogleAppsCardV1DataSourceConfig: [
    "platformDataSource",
    "remoteDataSource"
  ],
  newGoogleAppsCardV1Condition: [
    "actionRuleId",
    "expressionDataCondition"
  ],
  newChatClientDataSourceMarkup: [
    "spaceDataSource"
  ],
  newGoogleAppsCardV1Image: [
    "altText",
    "imageUrl",
    "onClick"
  ],
  newMatchedUrl: [
    "url"
  ],
  newSpaceDetails: [
    "description",
    "guidelines"
  ],
  newGoogleAppsCardV1Widgets: [
    "buttonList",
    "chipList",
    "dateTimePicker",
    "decoratedText",
    "image",
    "selectionInput",
    "textInput",
    "textParagraph"
  ],
  newAttachment: [
    "attachmentDataRef",
    "contentName",
    "contentType",
    "downloadUri",
    "driveDataRef",
    "name",
    "source",
    "thumbnailUri"
  ],
  newGoogleAppsCardV1ButtonList: [
    "buttons"
  ],
  newGoogleAppsCardV1SelectionInput: [
    "dataSourceConfigs",
    "externalDataSource",
    "hintText",
    "items",
    "label",
    "multiSelectMaxSelectedItems",
    "multiSelectMinQueryLength",
    "name",
    "onChangeAction",
    "platformDataSource",
    "type"
  ],
  newGoogleAppsCardV1DateTimePicker: [
    "hostAppDataSource",
    "label",
    "name",
    "onChangeAction",
    "timezoneOffsetDate",
    "type",
    "valueMsEpoch"
  ],
  newChatSpaceLinkData: [
    "message",
    "space",
    "thread"
  ],
  newHostAppDataSourceMarkup: [
    "chatDataSource",
    "workflowDataSource"
  ],
  newAccessoryWidget: [
    "buttonList"
  ],
  newSpaceDataSource: [
    "defaultToCurrentSpace"
  ],
  newCustomEmojiPayload: [
    "fileContent",
    "filename"
  ],
  newGoogleAppsCardV1Chip: [
    "altText",
    "disabled",
    "enabled",
    "icon",
    "label",
    "onClick"
  ],
  newMeetSpaceLinkData: [
    "huddleStatus",
    "meetingCode",
    "type"
  ],
  newActionParameter: [
    "key",
    "value"
  ],
  newGoogleAppsCardV1ExpressionDataCondition: [
    "conditionType"
  ],
  newGoogleAppsCardV1Widget: [
    "buttonList",
    "carousel",
    "chipList",
    "columns",
    "dateTimePicker",
    "decoratedText",
    "divider",
    "eventActions",
    "grid",
    "horizontalAlignment",
    "id",
    "image",
    "selectionInput",
    "textInput",
    "textParagraph",
    "visibility"
  ],
  newSpaceNotificationSetting: [
    "muteSetting",
    "name",
    "notificationSetting"
  ],
  newAttachedGif: [
    "uri"
  ],
  newGoogleAppsCardV1Carousel: [
    "carouselCards"
  ],
  newSetUpSpaceRequest: [
    "memberships",
    "requestId",
    "space"
  ],
  newGoogleAppsCardV1OverflowMenu: [
    "items"
  ],
  newSection: [
    "header",
    "widgets"
  ],
  newGoogleAppsCardV1CarouselCard: [
    "footerWidgets",
    "widgets"
  ],
  newCardHeader: [
    "imageStyle",
    "imageUrl",
    "subtitle",
    "title"
  ],
  newReaction: [
    "emoji",
    "name",
    "user"
  ],
  newGoogleAppsCardV1Trigger: [
    "actionRuleId"
  ],
  newActionStatus: [
    "statusCode",
    "userFacingMessage"
  ],
  newGoogleAppsCardV1SelectionItem: [
    "bottomText",
    "selected",
    "startIconUri",
    "text",
    "value"
  ],
  newAccessSettings: [
    "accessState",
    "audience"
  ],
  newCardWithId: [
    "card",
    "cardId"
  ],
  newUpdatedWidget: [
    "suggestions",
    "widget"
  ],
  newOpenLink: [
    "url"
  ],
  newGoogleAppsCardV1Button: [
    "altText",
    "color",
    "disabled",
    "icon",
    "onClick",
    "text",
    "type"
  ],
  newActionResponse: [
    "dialogAction",
    "type",
    "updatedWidget",
    "url"
  ],
  newOnClick: [
    "action",
    "openLink"
  ]
}


class FakeAdvChat {
  constructor() {
    this.__fakeObjectType = "Chat";

    Reflect.ownKeys(propsList).forEach((p) => {
      this[p] = () => advClassMaker(propsList[p]);
    });
  }
  toString() {
    return "AdvancedServiceIdentifier{name=chat, version=v1}";
  }

  getVersion() {
    return "v1";
  }

  get Spaces() {
    return newFakeAdvChatSpaces(this);
  }

  __getChatPerformance() {
    return chatCacher.getPerformance();
  }
}

export const newFakeAdvChat = (...args) =>
  Proxies.guard(new FakeAdvChat(...args));