import { FormItemFactory } from './FormItemFactory.js';

/**
 * @class FormGenerator
 * Orchestrates the creation of a Google Form from a template file and a set of rules.
 * It handles placeholder substitution to dynamically build complex forms.
 */
export class FormGenerator {
  /**
   * @param {object} config The configuration object for the generator.
   * @param {string} config.formName The name for the new form.
   * @param {string} config.templateId The Google Drive ID of the template form.
   * @param {object} config.templates The template data for substitutions.
   * @param {object} config.blocks The block definitions that drive the form structure.
   * @param {string} [config.folderId] The ID of the Google Drive folder to save the new form in.
   * @param {object} [config.roster] Roster data for populating dynamic questions.
   */
  constructor({ formName, templateId, templates, blocks, folderId, roster }) {
    /**
     * @type {string}
     * @private
     */
    this.__formName = formName
    /**
     * @type {object}
     * @private
     */
    this.__templates = templates
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
     * @type {object | undefined}
     * @private
     */
    this.__roster = roster;
    /**
     * @type {FormItemFactory}
     * @private
     */
    this.__itemFactory = new FormItemFactory(this);
  }

  /**
   * The name of the form to be created.
   * @returns {string}
   */
  get formName () {
    return this.__formName || this.input.getName() + '_copy'
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
  get templates() {
    return this.__templates;
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
    this._processPlaceholders(placeholders);
    this._cleanupPlaceholders(placeholders);
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
   * Iterates through placeholders and applies the appropriate substitution or insertion logic.
   * @private
   * @param {Array<object>} placeholders The list of placeholder objects.
   */
  _processPlaceholders(placeholders) {
    placeholders.forEach(placeholder => {
      const { blockDefinition } = placeholder;
      if (blockDefinition.type === 'section') {
        this._substituteSectionHeader(placeholder);
      } else {
        this._insertBlockContent(placeholder);
      }
    });
  }

  /**
   * Handles 'section' type placeholders by updating the title and description of the placeholder item itself.
   * @private
   * @param {object} placeholder The placeholder object.
   */
  _substituteSectionHeader({ item: placeholderItem, blockData }) {
    const templateData = this.templates[blockData.block];
    if (templateData) {
      const { title, description } = templateData;
      placeholderItem.setTitle(title).setHelpText(description);
    } else {
      console.warn(`Template data not found for section block: ${blockData.block}`);
    }
  }

  /**
   * Handles 'measure_set' and other block types by inserting new sections and items into the form.
   * @private
   * @param {object} placeholder The placeholder object.
   */
  _insertBlockContent({ item: placeholderItem, blockDefinition }) {
    const itemContext = {};
    const { sections } = blockDefinition;
    if (!sections || !Array.isArray(sections)) {
      throw new Error(`'sections' array not found or invalid in replacement for ${blockDefinition.block}`);
    }

    sections.forEach(section => {
      let insertionIndex = placeholderItem.getIndex() + 1;
      console.log(`Inserting section: ${section.title} at ${insertionIndex}`);
      insertionIndex += this.__itemFactory.addSection({ section, index: insertionIndex });

      section.items.forEach(item => {
        console.log(`  Inserting item: ${item.title || item.questionType} at ${insertionIndex}`);
        switch (item.questionType.toLowerCase()) {
          case "multiple_choice_grid":
            insertionIndex += this.__itemFactory.addGridItem({ item: { ...item, ...itemContext }, index: insertionIndex });
            break;
          case "linear_scale":
            insertionIndex += this.__itemFactory.addScaleItem({ item: { ...item, ...itemContext }, index: insertionIndex });
            break;
          case "multiple_choice":
            insertionIndex += this.__itemFactory.addMultipleChoiceItem({ item: { ...item, ...itemContext }, index: insertionIndex });
            break;
          case "dropdown":
            insertionIndex += this.__itemFactory.addListItem({ item: { ...item, ...itemContext }, index: insertionIndex });
            break;
          case "short_answer":
            insertionIndex += this.__itemFactory.addTextItem({ item: { ...item, ...itemContext }, index: insertionIndex });
            break;
          default:
            throw new Error(`invalid question type ${item.questionType}`);
        }
      });
    });
  }

  /**
   * Deletes the original placeholder items from the form.
   * @private
   * @param {Array<object>} placeholders The list of placeholder objects that were processed.
   */
  _cleanupPlaceholders(placeholders) {
    // We only delete placeholders that were used for content insertion, not for in-place substitution.
    const placeholdersToDelete = placeholders.filter(p => p.blockDefinition.type !== 'section');
    placeholdersToDelete.forEach(p => {
      this.form.deleteItem(p.item);
    });
  }

  /**
   * Executes all deferred tasks, such as setting up navigation.
   * @private
   */
  _runPostProcessTasks() {
    this.__postProcessTasks.forEach(task => task());
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
   * Determines the correct page navigation action based on a routing string and target pages.
   * @param {string} goto The routing instruction (e.g., 'next_section', 'submit').
   * @param {GoogleAppsScript.Forms.PageBreakItem} matchPage The page to navigate to for a "match" condition.
   * @param {GoogleAppsScript.Forms.PageBreakItem} elsePage The page to navigate to for an "else" condition.
   * @returns {GoogleAppsScript.Forms.PageNavigationType | GoogleAppsScript.Forms.PageBreakItem} The navigation target.
   */
  getNavigationAction(goto, matchPage, elsePage) {
    switch (goto) {
      case 'next_section':
        // This should navigate to the page break immediately following the current item.
        // If no next page, submit the form.
        return matchPage || FormApp.PageNavigationType.SUBMIT;
      case 'skip_next_section':
        // This should navigate to the page break *after* the next one.
        // If there is no page to skip to, it means we're at the end.
        // The logical action is to submit the form.
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
  // Regex to find content enclosed in {{...}}.
  // The 'g' flag ensures it finds all occurrences, not just the first.
  // The '(.*?)' is a non-greedy capture group to get the content inside the braces.
  const regex = /\{\{(.*?)\}\}/g;
  let match;

  // Loop through all matches found in the string
  while ((match = regex.exec(text)) !== null) {
    const jsonString = match[1]; // This is the captured content inside the braces

    try {
      // The captured group is the content *inside* the braces.
      // We need to re-add the braces to make it a valid JSON object string for parsing.
      const objectToParse = `{${jsonString}}`;
      const parsedJson = JSON.parse(objectToParse);
      foundObjects.push(parsedJson);
    } catch (e) {
      // If parsing fails, it means the content was not valid JSON.
      // We can ignore it or log a warning.
      console.warn(`Found content enclosed in {{...}} that was not valid JSON: "${jsonString}"`);
    }
  }

  return foundObjects;
}
