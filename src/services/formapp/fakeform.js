import { Proxies } from '../../support/proxies.js';
import { newFakeFormItem } from './fakeformitem.js';
import './formitems.js'; // Import for side effects (item class registration)

export const newFakeForm = (...args) => {
  return Proxies.guard(new FakeForm(...args));
};

/**
 * @class FakeForm
 * A fake for the Form class in Apps Script.
 * @see https://developers.google.com/apps-script/reference/forms/form
 */
export class FakeForm {
  /**
   * @param {object} resource the form resource from Forms API
   */
  constructor(resource) {
    this.__id = resource.formId;
    this.__file = DriveApp.getFileById(this.__id);
  }

  get __resource() {
    return Forms.Form.get(this.__id);
  }

  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }
  /**
   * Gets the ID of the form.
   * @returns {string} The form ID.
   */
  getId() {
    return this.__id;
  }

  /**
   * Gets the form item with the given ID.
   * @param {Integer} id The ID of the item to retrieve.
   * @returns {import('./fakeformitem.js').FakeFormItem | null} The form item, or null if the item does not exist.
   */
  getItemById(id) {
    if (!this.__resource.items) {
      return null;
    }
    // The API uses string IDs, but Apps Script often uses numbers.
    // We'll handle both by converting the input to a string for comparison.
    const stringId = id.toString();
    const itemResource = this.__resource.items.find(item => item.itemId === stringId);
    if (!itemResource) {
      return null;
    }
    return newFakeFormItem(this, itemResource.itemId);
  }

  /**
   * Gets all items in the form.
   * @returns {import('./fakeformitem.js').FakeFormItem[]} An array of all items in the form.
   */
  getItems() {
    return this.__resource.items?.map((item) => newFakeFormItem(this, item.itemId)) || [];
  }

  /**
   * Gets the title of the form.
   * @returns {string} The form title.
   */
  getTitle() {
    return this.__resource.info.title;
  }

  /**
   * Gets the name of the form file in Google Drive.
   * @returns {string} The file name.
   */
  getName() {
    return this.__file.getName();
  }

  /**
   * Sets the name of the form file in Google Drive.
   * @param {string} name The new file name.
   * @returns {FakeForm} The form, for chaining.
   */
  setName(name) {
    this.__file.setName(name);
    return this;
  }

  /**
   * Sets the title of the form.
   * @param {string} title The new title for the form.
   * @returns {FakeForm} The form, for chaining.
   */
  setTitle(title) {
    const updateInfo = Forms.newFormInfo().setTitle(title);
    const updateRequest = Forms.newRequest().setUpdateFormInfo(
      Forms.newUpdateFormInfoRequest()
        .setInfo(updateInfo)
        .setUpdateMask("title")
    );
    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setRequests([updateRequest]);

    Forms.Form.batchUpdate(batchRequest, this.getId());

    return this;
  }

  /**
   * Gets the URL to edit the form.
   * @returns {string} The form URL.
   */
  getEditUrl() {
    return `https://docs.google.com/forms/d/${this.getId()}/edit`;
  }

  toString() {
    return 'Form';
  }
}
