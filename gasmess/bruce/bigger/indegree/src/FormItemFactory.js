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
   * A generic helper to move a new item to its correct position and set its title,
   * description, and required status.
   * @param {GoogleAppsScript.Forms.Item} formItem The item to configure.
   * @param {number} index The target index for the item.
   * @param {object} amble The configuration object.
   * @param {string} [amble.description] The item's help text.
   * @param {string} [amble.title] The item's title.
   * @param {boolean} [amble.required] The item's required status.
   * @returns {GoogleAppsScript.Forms.Item} The configured item.
   */
  addAmble(formItem, index, { description, title, required }) {
    const itemIndex = formItem.getIndex()
    this.form.moveItem(itemIndex, index);
    if (required) formItem.setRequired(Boolean(required));
    if (title) formItem.setTitle(title);
    if (description) formItem.setHelpText(description);
    return formItem;
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
    this.addAmble(gridItem, index, item);
    const rows = item.questions.map(f => f.text);
    gridItem.setRows(rows);
    const columns = Reflect.ownKeys(item.labels);
    gridItem.setColumns(columns);
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
    const title = item.questions.length ? item.questions[0].text : item.title;

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

    this.addAmble(formItem, index, { ...item, title });

    this.addPostProcessTask(() => {
      const { routing } = item;
      if (routing && item.nextBlock && choices.length > 0) {
        const { gotoMatch, gotoElse } = routing;
        const findPageBreakBySectionTitle = (title) => {
          const sectionHeader = this.form.getItems(FormApp.ItemType.SECTION_HEADER).find(sh => sh.getTitle() === title);
          return sectionHeader ? this.form.getItems(FormApp.ItemType.PAGE_BREAK).find(pb => pb.getIndex() > sectionHeader.getIndex()) : null;
        };
        const matchPage = findPageBreakBySectionTitle(item.nextBlock.sections[0].title);
        const elsePage = item.skipBlock ? findPageBreakBySectionTitle(item.skipBlock.sections[0].title) : null;

        const finalChoices = choices.map(def => {
          const navAction = this.__generator.getNavigationAction(def.isMatch ? gotoMatch : gotoElse, matchPage, elsePage);
          return formItem.createChoice(def.value, navAction);
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
    this.addAmble(formItem, index, { ...item, title });
    const choices = Object.keys(item.labels).map(key => formItem.createChoice(key));
    formItem.setChoices(choices);
    return 1;
  }

  /**
   * Adds one or more linear scale items to the form.
   * @param {object} options The options for the item.
   * @param {object} options.item The item definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added.
   */
  addScaleItem({ item, index }) {
    const { labels, required } = item;
    item.questions.forEach((question, i) => {
      const scaleItem = this.form.addScaleItem();
      this.addAmble(scaleItem, index + i, { title: question.text, required });
      const bounds = Object.values(labels);
      const labelKeys = Object.keys(labels);
      scaleItem.setBounds(bounds[0], bounds[bounds.length - 1])
        .setLabels(labelKeys[0], labelKeys[labelKeys.length - 1]);
    });
    return item.questions.length;
  }

  /**
   * Adds one or more text items (short answer) to the form.
   * @param {object} options The options for the item.
   * @param {object} options.item The item definition from the template.
   * @param {number} options.index The insertion index.
   * @returns {number} The number of items added.
   */
  addTextItem({ item, index }) {
    const { required, routing } = item;
    item.questions.forEach((question, i) => {
      const textItem = this.form.addTextItem();
      this.addAmble(textItem, index + i, { title: question.text, required });

      if (routing && routing.goto === 'submit') {
        this.addPostProcessTask(() => {
          const allPageBreaks = this.form.getItems(FormApp.ItemType.PAGE_BREAK);
          const pageBreak = allPageBreaks.find(pb => pb.getIndex() > textItem.getIndex());
          if (pageBreak) {
            // The live Apps Script environment does not actually implement setGoToPage on PageBreakItem,
            // despite its presence in the documentation. The fake environment correctly throws an error.
            // We will log a warning here to indicate the intended behavior cannot be achieved.
            console.warn(`Routing rule "submit" for TextItem "${question.text}" cannot be set programmatically on its subsequent page break.`);
          }
        });
      }
    });
    return item.questions.length;
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
    this.addAmble(sectionHeader, index, section);

    // A complete section requires a PageBreakItem after the header.
    const pageBreak = this.form.addPageBreakItem();
    this.form.moveItem(pageBreak.getIndex(), index + 1);

    // We added two items: the header and the page break.
    return 2;
  }
}