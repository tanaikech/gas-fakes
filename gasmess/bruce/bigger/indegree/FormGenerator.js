export class FormGenerator {
  // create a copy from a template and apply the block rules
  constructor({ template, blocks, folderId }) {
    this.__template = template
    this.__blocks = blocks
    if (!template.templateId) throw new error`missing templateId in template entry ${template.name}`
    this.__form = null
    this.__file = null
    this.__input = null
    this.__inputForm = null
    this.__folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder()
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
    this.inputForm = FormApp.openById (templateId)
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

  addAmble (formItem, index, {description, title, required}) {
    const form = this.form
    form.moveItem(formItem, index)
    if (required) form.setRequired(Boolean(required))
    if (title) form.setTitle (title)
    if (description) form.setDescription(description)
    return formItem
  }
  addGridItem({ item, index }) {
    const form = this.form
    const gridItem = form.addGridItem()
    this.addAmble (gridItem, index, item)
    const rows = item.questions.map(f => f.text)
    gridItem.setRows(rows)
    const columns = Reflect.ownKeys(item.labels)
    gridItem.setColumns(columns)
    return 1
  }

  addMultipleChoiceItem( {item, index}) {
    const form = this.form
    const formItem = form.addMultipleChoiceItem()
    this.addAmble (formItem, index, item)
    const choices = item.questions.map(({text})=> formItem.createChoice(text))
    formItem.setChoices(choices)
    return 1
  }
  
  addScaleItem({ item, index }) {
    const form = this.form
    // each question in a linear scale block is a separate scale item
    item.questions.forEach((question, i) => {
      const scaleItem = form.addScaleItem();
      this.addAmble (scaleItem, index+i, item)
      const bounds = Object.values(item.labels)
      const labels = Object.keys(item.labels);
      scaleItem.setBounds(bounds[0], bounds[bounds.length - 1])
        .setLabels(labels[0], labels[labels.length - 1]);
    });
    return item.questions.length;
  }

  addSection({ section, description, index }) {
    const form = this.form
    // can be just a title, or a title and description
    const formItem = form.addSectionHeaderItem()
    this.addAmble (formItem, index, section)
    return 1
  }

  addBlocks() {
    const items = this.form.getItems()
    const blocks = this.blocks
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
            throw new Error(`${blockData.block} was found in the template, but it's not defined in the definition json`)
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
      if (!Array.isArray (sections)) throw new Error(`sections should be an array in replacement for ${blockData.block}`)
      // Keep track of where to insert the next item.
      let currentIndex = index;

      sections.forEach(section => {
        console.log (section.title)
        currentIndex += this.addSection({ section, description, index: currentIndex })
        if (!Array.isArray (section.items)) {
          throw new Error(`section.items should be an array in replacement for ${blockData.block}`)
        }
        section.items.forEach(item => {
          // add the questions
          console.log (item.title)
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
            default:
              throw new Error(`invalid question type ${item.questionType}`)
          }
        })
      })
    })
    return this

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
