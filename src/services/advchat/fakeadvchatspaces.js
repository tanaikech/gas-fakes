import { FakeAdvResource } from "../common/fakeadvresource.js";
import { Syncit } from "../../support/syncit.js";
import { Proxies } from "../../support/proxies.js";

export const newFakeAdvChatSpaces = (...args) =>
  Proxies.guard(new FakeAdvChatSpaces(...args));

/**
 * @see https://developers.google.com/workspace/chat/api/reference/rest/v1/spaces
 */
class FakeAdvChatSpaces extends FakeAdvResource {
  /**
   *
   * @param {object} mainService the main service
   */
  constructor(mainService) {
    super(mainService, "spaces", Syncit.fxChat);
    this.chat = mainService;
    this.__fakeObjectType = "Chat.Spaces";
  }

  // get Messages() {
  //   return newFakeAdvChatMessages(this.chat);
  // }

  // get Members() {
  //   return newFakeAdvChatMembers(this.chat);
  // }
}