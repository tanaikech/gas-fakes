/**
 * @constant
 * @type {string}
 * @default
 */
export const gooType = "application/vnd.google-apps"
/**
 * mimetype of a folder
 * @constant
 * @type {string}
 * @default
 */
export const folderType = `${gooType}.folder`
export const spreadsheetType = `${gooType}.spreadsheet`

export const isGoogleType = (mimeType) => 
  mimeType && mimeType.substring(0,gooType.length) === gooType