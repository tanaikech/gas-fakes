import { Proxies } from '../../support/proxies.js'
import { spreadsheetType } from '../../support/constants.js'
import { Auth } from '../../support/auth.js'
/**
 * create a new FakeSpreadsheetApp instance
 * @param  {...any} args 
 * @returns {FakeSpreadsheetApp}
 */
export const newFakeSpreadsheetApp = (...args) => {
  return Proxies.guard(new FakeSpreadsheetApp(...args))
}

/**
 * create a new FakeSpreadsheet instance
 * @param  {...any} args 
 * @returns {FakeSpreadsheet}
 */
export const newFakeSpreadsheet = (...args) => {
  return Proxies.guard(new FakeSpreadsheet(...args))
}

// private properties are identified with leading __
// this will signal to the proxy handler that it's okay to set them
/**
 * create a new FakeSheet instance
 * @param  {...any} args 
 * @returns {FakeSheet}
 */
export const newFakeSheet = (...args) => {
  return Proxies.guard(new FakeSheet(...args))
}

/**
 * basic fake FakeSheet
 * TODO add lots more methods
 * @class FakeSpreadsheet
 * @returns {FakeSheet}
 */
export class FakeSheet {

  constructor(parent) {
    this.__parent = parent
  }
  getParent() {
    return this.__parent
  }
}

/**
 * basic fake FakeSpreadsheet
 * TODO add lots more methods
 * @class FakeSpreadsheet
 * @returns {FakeSpreadsheet}
 */
export class FakeSpreadsheet {

  constructor(file) {
    if (file.getMimeType() !== spreadsheetType) {
      throw `file is not a spreadsheet - its a ${file.getMimeType()}`
    }
    this.file = file
    this.__activeSheet = null
  }
  getActiveSheet() {
    return this.__activeSheet
  }
  /**
   *  @return {string} the spreadsheet id
   */
  getId() {
    return this.file.getId()
  }
  /**
   *  @return {string} the spreadsheet name
   */
  getName() {
    return this.file.getName()
  }
  /**
   * @return {number} number of sheets in the spreadsheet
   */
  getNumSheets () {
    return 0
  }
}


/**
 * basic fake FakeSpreadsheetApp
 * TODO add lots more methods
 * @class FakeSpreadsheetApp
 * @returns {FakeSpreadsheetApp}
 */
export class FakeSpreadsheetApp {
  
  static open = (id) => {
    const file = DriveApp.getFileById(id)
    const ss = newFakeSpreadsheet(file)
    return ss
  }

  constructor() {
    const documentId = Auth.getDocumentId()
    this.__activeSpreadsheet = documentId ? FakeSpreadsheetApp.open (documentId) : null
  }

  getActiveSpreadsheet() {
    return this.__activeSpreadsheet
  }
  getActiveSheet() {
    return this.__activeSpreadsheet?.getActiveSheet() || null
  }
  /**
   * @param {FakeFile} file sheet as a file
   * @return {FakeSpreadsheet}
   */
  open(file) {
    return this.openById (file.id)
  }
  /**
   * @param {string} id file id
   * @return {FakeSpreadsheet}
   */
  openById(id) {
    return FakeSpreadsheetApp.open (id)
  }


  /**
   * The different types of sheets that can exist in a spreadsheet.
   * @returns {object}
   */
  get SheetType() {
    return {
      "GRID": "GRID", 	//Enum	A sheet containing a grid. This is the default type.
      "OBJECT": "OBJECT", //Enum	A sheet containing a single embedded object such as an EmbeddedChart.
      "DATASOURCE": "DATASOURCE" //Enum	A sheet containing a DataSource.
    }
  }

  /**
   * An enumeration of value types returned by Range.getValue() and Range.getValues() from the Range class of the Spreadsheet service. 
   * @returns {object}
   * 
   */
  get ValueType() {
    return {
      "number": "number",
      "boolean": "boolean",
      "date": "date",
      "string": "string",
      "IMAGE": "IMAGE"
    }
  }
}