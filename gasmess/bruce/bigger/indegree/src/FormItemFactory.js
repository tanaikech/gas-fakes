/**
 * @class FormItemFactory
 * A helper class for FormGenerator responsible for creating and configuring various types of form items.
 */
export class FormItemFactory {
  /**
   * @param {import('./FormGenerator.js').FormGenerator} generator The parent FormGenerator instance.
   */
  constructor(generator) {
    this.__generator = generator;
  }

  /**
   * Provides access to the underlying Form object.
   * @returns {GoogleAppsScript.Forms.Form}
   */
  get form() {
    return this.__generator.form;
  }

  /**
   * Provides access to the roster data.
   * @returns {Object}
   */
  get roster() {
    return this.__generator.roster;
  }

  /**
   * Defers a task to be run after the main form structure has been built.
   * @param {Function} task The function to execute later.
   */
  addPostProcessTask(task) {
    this.__generator.addPostProcessTask(task);
  }

  /**
   * Adds a grid item (multiple choice grid) to the form.
   * @param {object} options The options for the grid item.
   * @param {object} options.item The item definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added (always 1).
   */
  addGridItem({ item, index }) {
    const gridItem = this.form.addGridItem();
    if (item.required) gridItem.setRequired(Boolean(item.required));
    // A grid item's title is set directly on the item.
    if (item.title) gridItem.setTitle(item.title);
    if (item.description) gridItem.setHelpText(item.description);

    const rows = item.questions.map(f => f.text);
    gridItem.setRows(rows);
    const columns = Reflect.ownKeys(item.labels);
    gridItem.setColumns(columns);

    this.form.moveItem(gridItem.getIndex(), index);
    return 1;
  }

  /**
   * Adds a list item (dropdown) to the form, handling dynamic choices from a roster and routing.
   * @param {object} options The options for the list item.
   * @param {object} options.item The item definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added (always 1).
   */
  addListItem({ item, index }) {
    const formItem = this.form.addListItem();
    // For a dropdown, the question text is the title.
    const title = item.questions.length ? item.questions[0].text : item.title;

    if (item.required) formItem.setRequired(Boolean(item.required));
    formItem.setTitle(title);
    if (item.description) formItem.setHelpText(item.description);

    let choices = [];
    if (item.rosterField && this.roster) {
      const rosterData = this.roster.find(r => r.nameField === item.rosterField);
      if (rosterData && rosterData.members) {
        const memberNames = rosterData.members.map(member => member[item.rosterField]);
        const validMemberNames = memberNames.filter(Boolean);
        if (validMemberNames.length !== rosterData.members.length) {
          throw new Error(`Roster for field '${item.rosterField}' contains members with missing or empty names.`);
        }
        choices = memberNames.map(name => ({ value: name, isMatch: false }));
        if (item.routing && item.routing.name) {
          choices.push({ value: item.routing.name, isMatch: true });
        }
      }
    }

    if (choices.length === 0) {
      Object.keys(item.labels || {}).forEach(key => {
        choices.push({ value: key, isMatch: false });
      });
    }

    this.form.moveItem(formItem.getIndex(), index);

    this.addPostProcessTask(() => {
      const { routing } = item;
      if (routing && choices.length > 0) {
        const { gotoMatch, gotoElse, name: matchName } = routing;

        // Find all page breaks in the form *after* this item.
        const allPageBreaks = this.form.getItems(FormApp.ItemType.PAGE_BREAK).map(f=>f.asPageBreakItem());
        const subsequentPageBreaks = allPageBreaks.filter(pb => pb.getIndex() > formItem.getIndex());

        // The "next_section" is the first page break after this item.
        const matchPage = subsequentPageBreaks.length > 0 ? subsequentPageBreaks[0] : null;
        // The "skip_next_section" is the second page break after this item.
        const elsePage = subsequentPageBreaks.length > 1 ? subsequentPageBreaks[1] : null;

        const finalChoices = choices.map(def => {
          // Determine if this choice is the special matching choice.
          const isMatch = def.value === matchName;
          // Select the routing directive based on whether it's a match.
          const navDirective = isMatch ? gotoMatch : gotoElse;
          // Get the final navigation action.
          const navAction = this.__generator.getNavigationAction(navDirective, matchPage, elsePage);
          const choice = navAction ? formItem.createChoice(def.value,navAction) : formItem.createChoice(def.value)

          return choice;
        });
        formItem.setChoices(finalChoices);
      } else if (choices.length > 0) {
        const plainChoices = choices.map(def => formItem.createChoice(def.value));
        formItem.setChoices(plainChoices);
      }
    });
    return 1;
  }

  /**
   * Adds a multiple choice item to the form.
   * @param {object} options The options for the item.
   * @param {object} options.item The item definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added (always 1).
   */
  addMultipleChoiceItem({ item, index }) {
    const formItem = this.form.addMultipleChoiceItem();
    const title = item.questions.length ? item.questions[0].text : item.title;

    if (item.required) formItem.setRequired(Boolean(item.required));
    formItem.setTitle(title);
    if (item.description) formItem.setHelpText(item.description);

    const choices = Object.keys(item.labels).map(key => formItem.createChoice(key));
    formItem.setChoices(choices);

    this.form.moveItem(formItem.getIndex(), index);
    return 1;
  }

  /**
   * Adds a single linear scale item to the form.
   * @param {object} options The options for the item.
   * @param {object} options.item The item definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added (always 1).
   */
  addScaleItem({ item, index }) {
    const { labels, required } = item;
    // A scale item block can have multiple questions, but the generator now calls this
    // method once per question. We assume the first question is the one to use.
    const question = item.questions[0];
    if (!question) return 0;

    const scaleItem = this.form.addScaleItem();

    if (required) scaleItem.setRequired(Boolean(required));
    scaleItem.setTitle(question.text);

    const bounds = Object.values(labels);
    const labelKeys = Object.keys(labels);
    scaleItem.setBounds(bounds[0], bounds[bounds.length - 1])
      .setLabels(labelKeys[0], labelKeys[labelKeys.length - 1]);

    this.form.moveItem(scaleItem.getIndex(), index);
    return 1;
  }

  /**
   * Adds a single text item (short answer) to the form.
   * @param {object} options The options for the item.
   * @param {object} options.item The item definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added (always 1).
   */
  addTextItem({ item, index }) {
    const { required, routing } = item;
    // A text item block can have multiple questions, but the generator now calls this
    // method once per question. We assume the first question is the one to use.
    const question = item.questions[0];
    if (!question) return 0;

    const textItem = this.form.addTextItem();

    if (required) textItem.setRequired(Boolean(required));
    textItem.setTitle(question.text);

    this.form.moveItem(textItem.getIndex(), index);

    if (routing && routing.goto === 'submit') {
      this.addPostProcessTask(() => {
        const allPageBreaks = this.form.getItems(FormApp.ItemType.PAGE_BREAK);
        const pageBreak = allPageBreaks.find(pb => pb.getIndex() > textItem.getIndex());
        if (pageBreak) {
          console.warn(`Routing rule "submit" for TextItem "${question.text}" cannot be set programmatically on its subsequent page break.`);
        }
      });
    }
    return 1;
  }

  /**
   * Adds a section header item to the form.
   * @param {object} options The options for the section.
   * @param {object} options.section The section definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added (always 1).
   */
  addSection({ section, index }) {
    const sectionHeader = this.form.addSectionHeaderItem();

    if (section.title) sectionHeader.setTitle(section.title);
    if (section.description) sectionHeader.setHelpText(section.description);

    this.form.moveItem(sectionHeader.getIndex(), index);
    return 1;
  }

  /**
   * Adds a page break item to the form at a specific index.
   * @param {object} options The options for the page break.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added (always 1).
   */
  addPageBreak({ index }) {
    const pageBreak = this.form.addPageBreakItem();
    this.form.moveItem(pageBreak.getIndex(), index);
    return 1;
  }

}
