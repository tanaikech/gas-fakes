import { FormItemFactory } from './FormItemFactory.js';
import { FormPropertiesManager } from './FormPropertiesManager.js';

/**
 * @class FormGenerator
 * Orchestrates the creation of a Google Form from a template file and a set of rules.
 * It handles placeholder substitution to dynamically build complex forms.
 */
export class FormGenerator {
  /**
   * @param {object} config The configuration object for the generator.
   * @param {object} config.formDetails The name/title/description for the new form.
   * @param {string} config.templateId The Google Drive ID of the template form.
   * @param {object} config.blocks The block definitions that drive the form structure.
   * @param {string} config.itemMapKey The property key to write to the drive properties of the form
   * @param {string} [config.folderId] The ID of the Google Drive folder to save the new form in.
   * @param {object} [config.roster] Roster data for populating dynamic questions.
   */
  constructor({ formDetails, templateId, blocks, folderId, roster, itemMapKey }) {
    /**
     * @type {object}
     * @private
     */
    this.__formDetails = formDetails
    /**
     * @type {string}
     * @private
     */
    this.__itemMapKey = itemMapKey
    /**
     * @type {object}
     * @private
     */
    this.__blocks = blocks
    if (!templateId) throw new Error(`Missing templateId in configuration.`);
    /**
     * @type {string}
     * @private
     */
    this.__templateId = templateId
    /**
     * @type {GoogleAppsScript.Forms.Form | null}
     * @private
     */
    this.__form = null
    /**
     * @type {GoogleAppsScript.Drive.File | null}
     * @private
     */
    this.__file = null
    /**
     * @type {GoogleAppsScript.Drive.File | null}
     * @private
     */
    this.__input = null
    /**
     * @type {GoogleAppsScript.Forms.Form | null}
     * @private
     */
    this.__inputForm = null
    /**
     * @type {GoogleAppsScript.Drive.Folder}
     * @private
     */
    this.__folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder()
    /**
     * @type {Array<Function>}
     * @private
     */
    this.__postProcessTasks = [];
    /**
     * @type {Array<object>}
     * @private
     */
    this.__itemMap = {
      questions: {},
      labels: {}
    };
    /**
     * @type {Map<string, string>}
     * @private
     */
    this.__labelSetMap = new Map();

    /**
     * @type {object | undefined}
     * @private
     */
    this.__roster = roster;    
    this.__itemFactory = null;
  }
  get itemMapKey () {
    return this.__itemMapKey
  }
  get itemMap () {
    return this.__itemMap
  }
  /**
   * The name of the form to be created.
   * @returns {string}
   */
  get formName () {
    return this.__formDetails.formName   || this.input.getName()
  }
  /**
   * The title of the form to be created.
   * @returns {string}
   */
  get formTitle () {
    return this.__formDetails.formTitle
  }
  /**
   * The description of the form to be created.
   * @returns {string}
   */
  get formDescription () {
    return this.__formDetails.formDescription
  }
  /**
   * The roster data for dynamic questions.
   * @returns {object}
   */
  get roster() {
    return this.__roster
  }
  /**
   * The block definitions.
   * @returns {object}
   */
  get blocks() {
    return this.__blocks
  }
  /**
   * The ID of the template form.
   * @returns {string}
   */
  get templateId() {
    return this.__templateId
  }
  /**
   * Creates a new form by copying the template.
   * This is the entry point for the generation process.
   * @returns {FormGenerator} The instance, for chaining.
   * @throws {Error} If the template file cannot be found.
   */
  create() {
    // first create a copy of the template
    const templateId = this.templateId
    this.input = DriveApp.getFileById(templateId)
    this.inputForm = FormApp.openById(templateId)
    if (!this.input) throw new Error(`failed to find template ${templateId}`)
    this.file = this.input.makeCopy(this.formName, this.folder)
    this.form = FormApp.openById(this.file.getId())
    // if these are not supplied then we just leave it and inherit it from the input
    if (this.formTitle) this.form.setTitle (this.formTitle)
    if(this.formDescription)this.form.setDescription (this.formDescription)
    this.__itemFactory = new FormItemFactory(this);
    return this
  }

  /**
   * The destination folder for the new form file.
   * @returns {GoogleAppsScript.Drive.Folder}
   */
  get folder() {
    return this.__folder
  }
  /**
   * Sets the active form object.
   * @param {GoogleAppsScript.Forms.Form} value The form object.
   */
  set form(value) {
    this.__form = value
  }
  /**
   * Sets the template form object.
   * @param {GoogleAppsScript.Forms.Form} value The template form object.
   */
  set inputForm(value) {
    this.__inputForm = value
  }
  /**
   * Sets the template file object.
   * @param {GoogleAppsScript.Drive.File} value The template file object.
   */
  set input(value) {
    this.__input = value
  }
  /**
   * Sets the new form file object.
   * @param {GoogleAppsScript.Drive.File} value The new file object.
   */
  set file(value) {
    this.__file = value
  }
  /**
   * The newly created form file.
   * @returns {GoogleAppsScript.Drive.File}
   * @throws {Error} If the file has not been created yet.
   */
  get file() {
    if (!this.__file) throw new Error(`file hasnt been created yet - use formGenerator.create()`)
    return this.__file
  }
  /**
   * The newly created form object.
   * @returns {GoogleAppsScript.Forms.Form}
   * @throws {Error} If the form has not been created yet.
   */
  get form() {
    if (!this.__form) throw new Error(`form hasnt been created yet - use formGenerator.create()`)
    return this.__form
  }
  /**
   * The template file object.
   * @returns {GoogleAppsScript.Drive.File}
   * @throws {Error} If the input file has not been found.
   */
  get input() {
    if (!this.__input) throw new Error(`input file hasnt been found`)
    return this.__input
  }
  /**
   * The template form object.
   * @returns {GoogleAppsScript.Forms.Form}
   * @throws {Error} If the input form has not been found.
   */
  get inputForm() {
    if (!this.__inputForm) throw new Error(`input form hasnt been found`)
    return this.__inputForm
  }

  /**
   * The main method that processes the form. It finds all placeholders,
   * substitutes them with content based on block definitions, and then
   * runs post-processing tasks.
   * @returns {FormGenerator} The instance, for chaining.
   */
  addBlocks() {
    const placeholders = this._findPlaceholders();

    // First pass: update all the section headers in-place.
    this._substituteSectionHeaders(placeholders);

    // Second pass: insert all the question items into their respective sections.
    this._insertSectionItems(placeholders);

    this._runPostProcessTasks();
    return this;
  }

  /**
   * Scans the form for items containing placeholder text.
   * @private
   * @returns {Array<object>} A list of placeholder objects to be processed.
   */
  _findPlaceholders() {
    const allItems = this.form.getItems();
    return allItems
      .map((item, index) => {
        const titleText = item.getTitle() || '';
        const helpText = item.getHelpText() || '';
        const marked = extractJsonFromDoubleBraces(titleText + helpText);
        if (marked.length > 0) {
          const [blockData] = marked;
          const blockDefinition = this.blocks[blockData.block];
          if (blockDefinition) {
            return { item, index, blockData, blockDefinition };
          }
        }
        return null;
      })
      .filter(Boolean);
  }

  /**
   * First pass: Iterates through placeholders and updates the title/description
   * of the placeholder item in-place.
   * @private
   * @param {Array<object>} placeholders The list of placeholder objects.
   */
  _substituteSectionHeaders(placeholders) {
    placeholders.forEach(placeholder => {
      const { item: placeholderItem, blockDefinition } = placeholder;

      // The placeholder item takes the title/desc from the *first* section of the block.
      const firstSection = blockDefinition.sections?.[0];
      if (!firstSection) {
        console.warn(`Block definition for placeholder at index ${placeholder.index} has no sections.`);
        return;
      }

      // Update the placeholder item (which is a SectionHeaderItem) in-place.
      placeholderItem.setTitle(firstSection.title || '');
      placeholderItem.setHelpText(firstSection.description || '');
    });
  }

  /**
   * Second pass: Iterates through placeholders and inserts the question items
   * for all sections of their corresponding block.
   * @private
   * @param {Array<object>} placeholders The list of placeholder objects.
   */
  _insertSectionItems(placeholders) {
    // Process placeholders in reverse order of their original index.
    // This is critical to ensure that insertions do not invalidate the indices of earlier placeholders.
    const sortedPlaceholders = [...placeholders].sort((a, b) => b.index - a.index);

    sortedPlaceholders.forEach(placeholder => {
      const { item: placeholderItem, blockDefinition } = placeholder;
      const sections = blockDefinition.sections;

      if (!sections || sections.length === 0) return;

      // The insertion point starts immediately after the first section's header (the placeholder).
      let insertionIndex = placeholderItem.getIndex() + 1;

      // Handle the first section's items.
      const firstSection = sections[0];
      if (firstSection.items) {
        [...firstSection.items].reverse().forEach(item => {
          this._insertSingleItem(item, blockDefinition, insertionIndex);
        });
      }

      // Handle any additional sections (sections[1], sections[2], etc.).
      const additionalSections = sections.slice(1);
      if (additionalSections.length > 0) {
        // These need to be inserted after the items of the first section.
        let subsequentInsertionIndex = insertionIndex + (firstSection.items?.length || 0);

        [...additionalSections].reverse().forEach(section => {
          // 2. Add all items for this section, also in reverse.
          if (section.items) {
            [...section.items].reverse().forEach(item => {
              this._insertSingleItem(item, blockDefinition, subsequentInsertionIndex);
            });
          }

          // 1. Add the section header last.
          console.log(`Inserting new section: ${section.title} at ${subsequentInsertionIndex}`);
          this.__itemFactory.addSection({ section, index: subsequentInsertionIndex });
        });
      }
    });
  }

  /**
   * Helper to insert a single question item using the factory.
   * @private
   */
  _insertSingleItem(item, blockDefinition, insertionIndex) {
    // The routing *destinations* (next_block, skip_next_block) are defined on the parent block,
    // not on the individual item. We resolve them here.
    const itemContext = {
      nextBlock: blockDefinition.next_block ? this.blocks[blockDefinition.next_block] : null,
      skipBlock: blockDefinition.skip_next_block ? this.blocks[blockDefinition.skip_next_block] : null,
    };

    console.log(`  Inserting item: ${item.title || item.questionType} at ${insertionIndex}`);
    switch (item.questionType.toLowerCase()) {
      case "multiple_choice_grid":
        this.__itemFactory.addGridItem({ item: { ...item, ...itemContext }, index: insertionIndex });
        break;
      case "linear_scale":
        this.__itemFactory.addScaleItem({ item: { ...item, ...itemContext }, index: insertionIndex });
        break;
      case "multiple_choice":
        this.__itemFactory.addMultipleChoiceItem({ item: { ...item, ...itemContext }, index: insertionIndex });
        break;
      case "dropdown":
        this.__itemFactory.addListItem({ item: { ...item, ...itemContext }, index: insertionIndex });
        break;
      case "short_answer":
        this.__itemFactory.addTextItem({ item: { ...item, ...itemContext }, index: insertionIndex });
        break;
      default:
        throw new Error(`Invalid question type: ${item.questionType}`);
    }
  }

  /**
   * Executes all deferred tasks, such as setting up navigation.
   * @private
   */
  _runPostProcessTasks() {
    this.__postProcessTasks.forEach(task => task());
    this._saveProperties();
  }

  /**
   * Saves the generated itemMap to the form file's custom properties using FormPropertiesManager.
   * @private
   */
  _saveProperties() {
    try {
      const propertiesManager = new FormPropertiesManager(this.file.getId());
      // Use a consistent key for storage
      const sidecar = propertiesManager.write(this.itemMapKey, this.itemMap);
      console.log(`Item map saved to sidecar file: ${sidecar.getName()}`);
      console.log(`Sidecar details saved to properties of form file: ${this.file.getName()}`);
    } catch (e) {
      console.error(`Could not save item map to file properties for ${this.file.getId()}: ${e.message}`);
    }
  }

  /**
   * Adds a task to a queue to be executed after the main form structure has been created.
   * This is useful for tasks that depend on the final layout, such as setting up navigation.
   * @param {Function} task The function to execute.
   */
  addPostProcessTask(task) {
    this.__postProcessTasks.push(task);
  }

  /**
   * Adds a mapping from a source question ID to a created form item ID.
   * @param {object} mapping The mapping object.
   * @param {string} mapping.sourceId The ID of the question from the JSON rules (item.id).
   * @param {string} mapping.createdId The ID of the item created in the Google Form (item.getId()).
   * @param {string} [mapping.labelId] The ID for the set of labels (item.labels).
   * @param {string[]} [mapping.labels] The array of choice labels.
   */
  addMapping(mapping) {
    const { sourceId, createdId, labels } = mapping;
    let finalLabelId = undefined;

    if (labels && Object.keys(labels).length > 0) {
      // Create a consistent key for the set of labels by sorting the keys and joining them.
      const labelTexts = Array.isArray(labels) ? labels : Object.keys(labels);
      const labelKey = [...labelTexts].sort().join('|');

      if (this.__labelSetMap.has(labelKey)) {
        // If we've seen this label set before, reuse its ID.
        finalLabelId = this.__labelSetMap.get(labelKey);
      } else {
        // It's a new label set. Generate a new ID.
        finalLabelId = mapping.labelId || `labels_${this.__labelSetMap.size + 1}`;
        this.__labelSetMap.set(labelKey, finalLabelId);
        this.itemMap.labels[finalLabelId] = labels;
      }
    }

    if (sourceId && createdId) {
      // As requested, the sourceId is the key, so we don't need to repeat it in the value.
      this.itemMap.questions[sourceId] = { createdId, labelId: finalLabelId };
    }

  }

  /**
   * Determines the correct page navigation action based on a routing string and target pages.
   * @param {string} goto The routing instruction (e.g., 'next_section', 'submit').
   * @param {GoogleAppsScript.Forms.PageBreakItem} matchPage The page to navigate to for a "match" condition.
   * @param {GoogleAppsScript.Forms.PageBreakItem} elsePage The page to navigate to for an "else" condition.
   * @returns {GoogleAppsScript.Forms.PageNavigationType | GoogleAppsScript.Forms.PageBreakItem} The navigation target.
   */
  getNavigationAction(goto, matchPage, elsePage) {
    switch (goto) {
      case 'next_section':
        // 'next_section' should always navigate to the page defined as the "match" page.
        return matchPage || FormApp.PageNavigationType.SUBMIT;
      case 'skip_next_section':
        // 'skip_next_section' should always navigate to the page defined as the "else" page.
        return elsePage || FormApp.PageNavigationType.SUBMIT;
      case 'submit':
        return FormApp.PageNavigationType.SUBMIT;
      case 'restart':
        return FormApp.PageNavigationType.RESTART;
      case 'continue':
        return FormApp.PageNavigationType.CONTINUE;
      default:
        // If no specific routing, default to continuing to the next item on the page.
        return FormApp.PageNavigationType.CONTINUE;
    }
  }

}

/**
 * Finds and parses all valid JSON objects enclosed in double curly braces {{...}}
 * from within a larger text string.
 *
 * @param {string} text The string to search for JSON content.
 * @returns {Array<Object|Array>} An array of all successfully parsed JSON objects.
 */
function extractJsonFromDoubleBraces(text) {
  const foundObjects = [];
  const regex = /\{\{(.*?)\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const jsonString = match[1]; 

    try {
      const objectToParse = `{${jsonString}}`;
      const parsedJson = JSON.parse(objectToParse);
      foundObjects.push(parsedJson);
    } catch (e) {
      console.warn(`Found content enclosed in {{...}} that was not valid JSON: "${jsonString}"`);
    }
  }

  return foundObjects;
}
