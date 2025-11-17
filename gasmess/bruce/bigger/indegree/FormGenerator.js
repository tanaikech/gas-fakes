export class FormGenerator {
  // create a copy from a template and apply the block rules
  constructor({ template, blocks, folderId, roster }) {
    this.__template = template
    this.__blocks = blocks
    if (!template.templateId) throw new error(`missing templateId in template entry ${template.name}`)
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
  get template() {
    return this.__template
  }
  create() {
    // first create a copy of the template
    const { templateId, title = 'no title', formName = 'nonname', description = 'no description' } = this.template
    this.input = DriveApp.getFileById(templateId)
    this.inputForm = FormApp.openById(templateId)
    if (!this.input) throw new Error(`failed to find template ${templateId}`)
    this.file = this.input.makeCopy(formName, this.folder)
    this.form = FormApp.openById(this.file.getId())
    this.form.setTitle(title).setDescription(description)
    if (!ScriptApp.isFake) {
      //https://github.com/brucemcpherson/gas-fakes/issues/105
      this.form.setPublished(true)
    }
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
    let choices;
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
    if (choiceDefinitions.length === 0) {
      Object.keys(item.labels || {}).forEach(key => {
        choices.push({ value: key, isMatch: false });
      });
    }

    // Add the item to the form first, so we can get its index.
    this.addAmble(formItem, index, { ...item, title });

    // After all items and pages are created, we can resolve the navigation.
    this.addPostProcessTask(() => {
      const { routing } = item;
      if (routing && choices.length > 0) {
        const { gotoMatch, gotoElse } = routing;
        const allPageBreaks = this.form.getItems(FormApp.ItemType.PAGE_BREAK);
        const itemIndex = formItem.getIndex();
        const matchPage = allPageBreaks.find(pb => pb.getIndex() > itemIndex);
        const elsePage = allPageBreaks.find(pb => pb.getIndex() > matchPage?.getIndex());

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
        // As discovered, TextItem.setGoToPage() is not a function in the live environment.
        console.warn(`Routing rule "submit" for TextItem "${question.text}" cannot be implemented as TextItem does not support navigation.`);
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
    const pageBreak = form.addPageBreakItem();
    form.moveItem(pageBreak, index + 1);
    return 2; // We added two items: the header and the page break.
  }

  addBlocks() {
    const items = this.form.getItems();
    const blocks = this.blocks;
    const replacements = [];

    // look through all the sections in the form
    items.forEach((item, originalIndex) => {
      const itemType = item.getType().name()
      const title = item.getTitle()
      // console.log (title,itemType) // Keep for debugging if needed
      // because sometimes the section is treated as a page break
      if (itemType === "SECTION_HEADER" || itemType === "PAGE_BREAK") {
        const marked = extractJsonFromDoubleBraces(title)
        if (marked.length > 1) {
          throw new Error(`found multiple substitutions ${JSON.stringify(marked)}`)
        }
        if (marked.length > 0) {
          const [blockData] = marked; // Assuming one JSON object per title
          const blockDefinition = blocks[blockData.block]
          if (!blockDefinition) {
            throw new Error(`${marked} was found in the template, but it's not defined in the definition json`)
          }
          replacements.push({
            index: originalIndex, // Store original index
            blockData,
            blockDefinition
          });
        }
      }
    });

    // Sort replacements by index in descending order to avoid index shifting issues
    replacements.sort((a, b) => b.index - a.index);

    // Second pass: perform deletions and insertions
    replacements.forEach(replacement => {
      const { index, blockData, blockDefinition } = replacement;

      // 1. Delete the original item at its current index
      this.form.deleteItem(index);

      // 2. Insert new content based on blockName
      const { sections, description } = blockDefinition
      if (!sections) throw new Error(`no sections found in replacement for ${blockData.block}`)
      if (!Array.isArray(sections)) {
        throw new Error(`sections should be an array in replacement for ${blockData.block}`)
      }
      // Keep track of where to insert the next item.
      let currentIndex = index;

      sections.forEach(section => {
        console.log(section.title)
        currentIndex += this.addSection({ section, index: currentIndex })
        if (!Array.isArray(section.items)) {
          throw new Error(`section.items should be an array in replacement for ${blockData.block}`)
        }
        section.items.forEach(item => {
          // add the questions
          console.log(item.title)
          switch (item.questionType.toLowerCase()) {
            case "multiple_choice_grid":
              currentIndex += this.addGridItem({ item, index: currentIndex });
              break;
            case "linear_scale":
              currentIndex += this.addScaleItem({ item, index: currentIndex });
              break;
            case "multiple_choice":
              currentIndex += this.addMultipleChoiceItem({ item, index: currentIndex });
              break;
            case "dropdown":
              currentIndex += this.addListItem({ item, index: currentIndex });
              break;
            case "short_answer":
              currentIndex += this.addTextItem({ item, index: currentIndex });
              break;
            default:
              throw new Error(`invalid question type ${item.questionType}`)
          }
        })
      })
    })

    // Run all the deferred navigation tasks now that the form structure is complete.
    this.__postProcessTasks.forEach(task => task());

    return this

  }

  addPostProcessTask(task) {
    this.__postProcessTasks.push(task);
  }

  getNavigationAction(goto, matchPage, elsePage) {
    switch (goto) {
      case 'next_section':
        // This should navigate to the page break immediately following the current item.
        return matchPage;
      case 'skip_next_section':
        // This should navigate to the page break *after* the next one.
        return elsePage;
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
