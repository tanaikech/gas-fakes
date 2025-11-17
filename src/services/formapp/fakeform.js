import { Proxies } from '../../support/proxies.js';
import { newFakeFormItem } from './fakeformitem.js';
import { newFakeGridItem } from './fakegriditem.js';
import { newFakeSectionHeaderItem } from './fakesectionheaderitem.js';
import { newFakeScaleItem } from './fakescaleitem.js';
import './formitems.js'; // Import for side effects (item class registration)
import { newFakeMultipleChoiceItem } from './fakemultiplechoiceitem.js';
import { newFakeCheckboxItem } from './fakecheckboxitem.js';
import { newFakeListItem } from './fakelistitem.js';
import { newFakePageBreakItem } from './fakepagebreakitem.js';
import { newFakeTextItem } from './faketextitem.js';

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
    // Since the API doesn't allow setting the published state, we'll manage it internally for the fake.
    // A new form defaults to accepting responses (true).
    this.__publishedState = this.__resource.settings?.state !== 'INACTIVE';
  }

  get __resource() {
    return Forms.Form.get(this.__id);
  }

  saveAndClose() {
    // this is a no-op in fake environment since it is stateless
  }

  __addItem(itemResource, itemFactory) {
    const createRequest = Forms.newRequest().setCreateItem({
      item: itemResource,
      location: {
        index: this.__resource.items?.length || 0,
      },
    });

    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setIncludeFormInResponse(true)
      .setRequests([createRequest]);

    const response = Forms.Form.batchUpdate(batchRequest, this.getId());

    const createdItemReply = response.replies.find(r => r.createItem);
    if (createdItemReply && createdItemReply.createItem.itemId) {
      const newItemId = createdItemReply.createItem.itemId;
      return itemFactory(this, newItemId);
    }

    throw new Error(`Could not find created item in batchUpdate response.`);
  }

  /**
   * Adds a new checkbox item to the form.
   * @returns {import('./fakecheckboxitem.js').FakeCheckboxItem} The new checkbox item.
   */
  addCheckboxItem() {
    const itemResource = {
      questionItem: {
        question: {
          choiceQuestion: {
            type: 'CHECKBOX',
            // The API requires at least one option on creation.
            options: [{ value: 'Option 1' }],
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeCheckboxItem);
  }

  /**
   * Appends a new question item, presented as a grid of columns and rows, that allows the
   * respondent to select one choice per row from a sequence of radio buttons.
   * @returns {import('./fakegriditem.js').FakeGridItem} The new grid item.
   */
  addGridItem() { 
    const itemResource = {
      questionGroupItem: {
        grid: {
          columns: {
            type: 'RADIO',
            // The API requires at least one column
            options: [{ value: 'Column 1' }],
          },
        },
        // and at least one row
        questions: [
          {
            rowQuestion: {
              title: 'Row 1',
            },
          },
        ],
      },
    };
    return this.__addItem(itemResource, newFakeGridItem);
  }

  /**
   * Appends a new question item, presented as a grid of columns and rows, that allows the
   * respondent to select multiple choices per row from a sequence of checkboxes.
   * @returns {import('./fakecheckboxgriditem.js').FakeCheckboxGridItem} The new checkbox grid item.
   */
  addCheckboxGridItem() {
    const itemResource = {
      questionGroupItem: {
        grid: {
          columns: {
            type: 'CHECKBOX',
            // The API requires at least one column
            options: [{ value: 'Column 1' }],
          },
        },
        // and at least one row
        questions: [
          {
            rowQuestion: {
              title: 'Row 1',
            },
          },
        ],
      },
    };
    // Note: This will require a newFakeCheckboxGridItem factory.
    return this.__addItem(itemResource, newFakeCheckboxGridItem);
  }

  /**
   * Appends a new layout item that marks the beginning of a new page in the form.
   * @returns {import('./fakepagebreakitem.js').FakePageBreakItem} The new page-break item.
   */
  addPageBreakItem() {
    const itemResource = {
      pageBreakItem: {},
    };
    return this.__addItem(itemResource, newFakePageBreakItem);
  }


  /**
   * Appends a new question item that allows the respondent to choose one option
   * from a drop-down list.
   * @returns {import('./fakelistitem.js').FakeListItem} The new list item.
   */
  addListItem() {
    const itemResource = {
      questionItem: {
        question: {
          choiceQuestion: {
            type: 'DROP_DOWN',
            // The API requires at least one option on creation.
            options: [{ value: 'Option 1' }],
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeListItem);
  }


  /**
   * Appends a new question item that allows the respondent to choose one option
   * from a list of choices.
   * @returns {import('./fakemultiplechoiceitem.js').FakeMultipleChoiceItem} The new multiple choice item.
   */
  addMultipleChoiceItem() {
    const itemResource = {
      questionItem: {
        question: {
          choiceQuestion: {
            type: 'RADIO',
            // The API requires at least one option on creation.
            options: [{ value: 'Option 1' }],
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeMultipleChoiceItem);
  }

  /**
   * Appends a new layout item that visually indicates the start of a section.
   * @returns {import('./fakesectionheaderitem.js').FakeSectionHeaderItem} The new section header item.
   */
  addSectionHeaderItem() {
    const itemResource = {
      // The API resource for a section header is an item with a title and description.
      // It is identified by the presence of the `textItem` property.
      title: '',
      textItem: {},
    };
    return this.__addItem(itemResource, newFakeSectionHeaderItem);
  }

  /**
   * Appends a new question item that allows the respondent to choose one option
   * from a numbered sequence of radio buttons.
   * @returns {import('./fakescaleitem.js').FakeScaleItem} The new scale item.
   */
  addScaleItem() {
    const itemResource = {
      questionItem: {
        question: {
          scaleQuestion: {
            low: 1,
            high: 5,
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeScaleItem);
  }

  /**
   * Appends a new question item that allows the respondent to enter a single
   * line of text.
   * @returns {import('./faketextitem.js').FakeTextItem} The new text item.
   */
  addTextItem() {
    const itemResource = {
      questionItem: {
        question: {
          textQuestion: {
            paragraph: false, // false for short-answer
          },
        },
      },
    };
    return this.__addItem(itemResource, newFakeTextItem);
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
   * Gets the title of the form.
   * @returns {string} The form title.
   */
  getDescription() {
    return this.__resource.info.description;
  }
  /**
   * Gets the name of the form file in Google Drive.
   * @returns {string} The file name.
   */
  getName() {
    return this.__file.getName();
  }

  /**
   * Gets whether the form is accepting responses.
   * @returns {boolean} true if the form is accepting responses; false otherwise.
   */
  isPublished() {
    // ACTIVE is the state for accepting responses. The default if not set is ACTIVE.
    return this.__publishedState;
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
   * Deletes the item at the given index.
   * @param {Integer} index The 0-indexed position of the item to delete.
   * @returns {FakeForm} The form, for chaining.
   */
  deleteItem(index) {
    const deleteRequest = Forms.newRequest().setDeleteItem({
      location: { index: index },
    });
    return this.__update(deleteRequest);
  }

  /**
   * Moves the given form item to the specified index.
   * @param {Integer} from The 0-indexed position of the item to move.
   * @param {Integer} toIndex The 0-indexed position to move the item to.
   * @returns {import('./fakeformitem.js').FakeFormItem} The moved item.
   */
  moveItem(from, toIndex) {
    // Enforce the live Apps Script signature: moveItem(from, to)
    if (typeof from !== 'number') {
      throw new Error(`The parameters (${typeof from},number) don't match the method signature for FormApp.Form.moveItem.`);
    }
    const items = this.getItems();
    if (from < 0 || from >= items.length) {
      throw new Error(`The starting position ${from} is out of bounds.`);
    }
    const itemToMove = items[from];
    const moveRequest = Forms.newRequest().setMoveItem({
      originalLocation: { index: from },
      newLocation: { index: toIndex },
    });
    this.__update(moveRequest);
    return itemToMove;
  }
  /**
   * Sets whether the form is accepting responses.
   * @param {boolean} enabled true if the form should accept responses; false otherwise.
   * @returns {FakeForm} The form, for chaining.
   */
  setPublished(enabled) {
    throw new Error('setPublished is not yet implemented in the fake environment.');
  }

  __update (updateRequest) {
    const batchRequest = Forms.newBatchUpdateFormRequest()
      .setRequests([updateRequest])
    Forms.Form.batchUpdate(batchRequest, this.getId());
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
    return this.__update (updateRequest)
  }

  /**
   * sets the description of the form.
   * @param {string} description The new title for the form.
   * @returns {FakeForm} The form, for chaining.
   */
  setDescription(description) {
    const updateInfo = Forms.newFormInfo().setDescription(description);
    const updateRequest = Forms.newRequest().setUpdateFormInfo(
      Forms.newUpdateFormInfoRequest()
        .setInfo(updateInfo)
        .setUpdateMask("description")
    );
    return this.__update (updateRequest)
  }

  /**
   * Gets the URL to edit the form.
   * @returns {string} The form URL.
   */
  getEditUrl() {
    return `https://docs.google.com/forms/d/${this.getId()}/edit`;
  }

  /**
   * Gets the URL to respond to the form.
   * @returns {string} The form URL.
   */
  getPublishedUrl() {
    return `https://docs.google.com/forms/d/e/${this.getId()}/viewform`;
  }

  toString() {
    return 'Form';
  }
}
