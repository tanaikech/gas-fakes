export class FormGenerator {
  // create a copy from a template and apply the block rules
  constructor({ templateId, template, blocks, folderId, roster }) {
    this.__template = template
    this.__blocks = blocks
    if (!templateId) throw new Error(`missing templateId`)
    this.__templateId = templateId
    this.__form = null
    this.__file = null
    this.__input = null
    this.__inputForm = null
    this.__folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder()
    this.__postProcessTasks = [];
    this.__roster = roster
  }
  get roster() {
    return this.__roster
  }
  get blocks() {
    return this.__blocks
  }
  get templateId() {
    return this.__templateId
  }
  get template() {
    return this.__template
  }
  create() {
    // first create a copy of the template
    const { title = 'no title', formName = 'nonname', description = 'no description' } = this.template
    const templateId = this.templateId
    this.input = DriveApp.getFileById(templateId)
    this.inputForm = FormApp.openById(templateId)
    if (!this.input) throw new Error(`failed to find template ${templateId}`)
    this.file = this.input.makeCopy(formName, this.folder)
    this.form = FormApp.openById(this.file.getId())
    return this
  }

  get folder() {
    return this.__folder
  }
  set form(value) {
    this.__form = value
  }
  set inputForm(value) {
    this.__inputForm = value
  }
  set input(value) {
    this.__input = value
  }
  set file(value) {
    this.__file = value
  }
  get file() {
    if (!this.__file) throw new Error(`file hasnt been created yet - use formGenerator.create()`)
    return this.__file
  }
  get form() {
    if (!this.__form) throw new Error(`form hasnt been created yet - use formGenerator.create()`)
    return this.__form
  }
  get input() {
    if (!this.__input) throw new Error(`input file hasnt been found`)
    return this.__input
  }
  get inputForm() {
    if (!this.__inputForm) throw new Error(`input form hasnt been found`)
    return this.__inputForm
  }

  addAmble(formItem, index, { description, title, required }) {
    const form = this.form
    form.moveItem(formItem, index)
    if (required) formItem.setRequired(Boolean(required))
    if (title) formItem.setTitle(title)
    if (description) formItem.setHelpText(description)
    return formItem
  }
  addGridItem({ item, index }) {
    const form = this.form
    const gridItem = form.addGridItem()
    this.addAmble(gridItem, index, item)
    const rows = item.questions.map(f => f.text)
    gridItem.setRows(rows)
    const columns = Reflect.ownKeys(item.labels)
    gridItem.setColumns(columns)
    return 1
  }

  addListItem({ item, index }) {
    const form = this.form;
    const formItem = form.addListItem();
    const title = item.questions.length ? item.questions[0].text : item.title;


    // The 'name' block uses a rosterField, implying dynamic choices.
    // This is where you would fetch the roster and populate the choices.
    let choices = [];
    if (item.rosterField && this.roster) {
      // Find the first roster that has a matching nameField.
      // this.roster is already the specific roster array, so we just need to find the definition within it.
      const rosterData = this.roster.find(r => r.nameField === item.rosterField);

      if (rosterData && rosterData.members) {
        // Extract the names from the members array using the rosterField key.
        const memberNames = rosterData.members.map(member => member[item.rosterField]);

        // Ensure that every member has a non-empty name.
        const totalMembers = rosterData.members.length;
        const validMemberNames = memberNames.filter(Boolean);
        if (validMemberNames.length !== totalMembers) {
          throw new Error(`Roster for field '${item.rosterField}' contains members with missing or empty names.`);
        }

        // All regular names get the "else" behavior
        choices = memberNames.map(name => {
          return { value: name, isMatch: false };
        });

        // The 'name' block also has a routing rule for "My name is not listed".
        if (item.routing && item.routing.name) {
          choices.push({ value: item.routing.name, isMatch: true });
        }
      }
    }

    // Fallback to labels if roster logic doesn't produce choices.
    if (choices.length === 0) {
      Object.keys(item.labels || {}).forEach(key => {
        choices.push({ value: key, isMatch: false });
      });
    }

    // Add the item to the form first, so we can get its index.
    this.addAmble(formItem, index, { ...item, title });

    // After all items and pages are created, we can resolve the navigation.
    this.addPostProcessTask(() => {
      const { routing } = item;
      // The context for routing (nextBlock, skipBlock) is passed in via the item.
      if (routing && item.nextBlock && choices.length > 0) {
        const { gotoMatch, gotoElse } = routing;

        // Find the page breaks associated with the target sections.
        // We need to find the SectionHeaderItem first by its title, then find the PageBreakItem right after it.
        const findPageBreakBySectionTitle = (title) => {
          const sectionHeader = this.form.getItems(FormApp.ItemType.SECTION_HEADER)
            .find(sh => sh.getTitle() === title);
          return sectionHeader ? this.form.getItems(FormApp.ItemType.PAGE_BREAK).find(pb => pb.getIndex() > sectionHeader.getIndex()) : null;
        };

        // The "name" block is followed by "missing_name", which is the "next_section" (matchPage).
        // The "missing_name" block is followed by "demographics", which is the "skip_next_section" (elsePage).
        const matchPage = findPageBreakBySectionTitle(item.nextBlock.sections[0].title);
        const elsePage = item.skipBlock ? findPageBreakBySectionTitle(item.skipBlock.sections[0].title) : null;

        const finalChoices = choices.map(def => {
          if (def.isMatch) {
            return formItem.createChoice(def.value, this.getNavigationAction(gotoMatch, matchPage, elsePage));
          } else {
            return formItem.createChoice(def.value, this.getNavigationAction(gotoElse, matchPage, elsePage));
          }
        });
        formItem.setChoices(finalChoices);
      } else if (choices.length > 0) {
        const plainChoices = choices.map(def => formItem.createChoice(def.value));
        formItem.setChoices(plainChoices);
      }
    });
    return 1;
  }

  addMultipleChoiceItem({ item, index }) {
    const form = this.form
    const formItem = form.addMultipleChoiceItem()
    // for a multiple choice, the question text is the title
    const title = item.questions.length ? item.questions[0].text : item.title;
    this.addAmble(formItem, index, { ...item, title })
    const choices = Object.keys(item.labels).map(key => formItem.createChoice(key));
    formItem.setChoices(choices)
    return 1
  }

  addScaleItem({ item, index }) {
    const form = this.form
    const { labels, required } = item;
    // each question in a linear scale block is a separate scale item
    item.questions.forEach((question, i) => {
      const scaleItem = form.addScaleItem();
      // the title for the scale item is the question text
      this.addAmble(scaleItem, index + i, { title: question.text, required })
      const bounds = Object.values(labels)
      const labelKeys = Object.keys(labels);
      scaleItem.setBounds(bounds[0], bounds[bounds.length - 1])
        .setLabels(labelKeys[0], labelKeys[labelKeys.length - 1]);
    });
    return item.questions.length;
  }

  addTextItem({ item, index }) {
    const form = this.form
    const { required, routing } = item;
    // each question in a short answer block is a separate text item
    item.questions.forEach((question, i) => {
      const textItem = form.addTextItem();
      // the title for the text item is the question text
      this.addAmble(textItem, index + i, { title: question.text, required })

      // handle routing if it exists
      if (routing && routing.goto === 'submit') {
        // A TextItem itself doesn't support navigation. However, we can apply the navigation
        // to the PageBreakItem at the end of the section containing this TextItem.
        this.addPostProcessTask(() => {
          const allPageBreaks = this.form.getItems(FormApp.ItemType.PAGE_BREAK);
          const pageBreak = allPageBreaks.find(pb => pb.getIndex() > textItem.getIndex());
          if (pageBreak) {
            // In the live environment, this works. In the fake environment, it throws an error.
            // We'll log a warning in the fake env to note the discrepancy.
            if (FormApp.isFake) console.warn(`Routing rule "submit" for TextItem "${question.text}" cannot be fully emulated as PageBreakItem.setGoToPage is not supported by the public API.`);
            else pageBreak.setGoToPage(FormApp.PageNavigationType.SUBMIT);
          }
        });
      }
    });
    return item.questions.length;
  }

  addSection({ section, index }) {
    const form = this.form
    // can be just a title, or a title and description
    const sectionHeader = form.addSectionHeaderItem();
    this.addAmble(sectionHeader, index, section);

    // Add a page break after the section header to enable routing.
    //const pageBreak = form.addPageBreakItem();
    //form.moveItem(pageBreak, index + 1);
    return 1; // We added two items: the header and the page break.
  }

  addBlocks() {
    const blocks = this.blocks;

    // Instead of using setTitle, which corrupts the form, insert the title/description as the first section.
    const { title = 'no title', description = 'no description' } = this.template
    const titleSection = this.form.addSectionHeaderItem()
    this.addAmble(titleSection, 0, { title, description })

    // Now get the items again, since we've added one.
    const allItems = this.form.getItems();

    // Find all placeholders and plan the replacements.
    const formItems = allItems.map((item, index) => {
      const marked = extractJsonFromDoubleBraces(item.getTitle());
      if (marked.length > 0) {
        const [blockData] = marked;
        const blockDefinition = blocks[blockData.block];
        if (blockDefinition) {
          return { isPlaceholder: true, item, index, blockData, blockDefinition };
        }
      }
      return { isPlaceholder: false };
    });

    const replacements = formItems.filter(p=>p.isPlaceholder)
    const keepers = formItems.filter(p=>!p.isPlaceholder)
    
    // now lets do the the substituations
    replacements.forEach (formItem=> {

      const { item: placeholderItem, blockDefinition, blockData } = formItem;
      // just set this empty got now
      const itemContext = {}
      const { sections } = blockDefinition;
      if (!sections || !Array.isArray(sections)) {
        throw new Error(`'sections' array not found or invalid in replacement for ${blockData.block}`);
      }
      sections.forEach(section => {

        // as we add new sections the index will change so we pick it up each time
        let insertionIndex = placeholderItem.getIndex() + 1

        console.log(`Inserting section: ${section.title} at ${insertionIndex}`);
        insertionIndex += this.addSection({ section, index: insertionIndex });

        section.items.forEach(item => {
          console.log(`  Inserting item: ${item.title || item.questionType} at ${insertionIndex}`);
          switch (item.questionType.toLowerCase()) {
            case "multiple_choice_grid":
              insertionIndex += this.addGridItem({ item: { ...item, ...itemContext }, index: insertionIndex });
              break;
            case "linear_scale":
              insertionIndex += this.addScaleItem({ item: { ...item, ...itemContext }, index: insertionIndex });
              break;
            case "multiple_choice":
              insertionIndex += this.addMultipleChoiceItem({ item: { ...item, ...itemContext }, index: insertionIndex });
              break;
            case "dropdown":
              insertionIndex += this.addListItem({ item: { ...item, ...itemContext }, index: insertionIndex });
              break;
            case "short_answer":
              insertionIndex += this.addTextItem({ item: { ...item, ...itemContext }, index: insertionIndex });
              break;
            default:
              throw new Error(`invalid question type ${item.questionType}`);
          }
        });
      });


    })

    // Finally, delete all the placeholder items we remembered.
    replacements.forEach(p => {
      this.form.deleteItem(p.item);
    });

    // Run all the deferred navigation tasks now that the form structure is complete.
    this.__postProcessTasks.forEach(task => task());

    // The title/description are now part of the form content, so no need to set them here.

    return this

  }


  addPostProcessTask(task) {
    this.__postProcessTasks.push(task);
  }

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
