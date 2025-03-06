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

export const gzipType = 'application/x-gzip'
export const zipType = 'application/zip'

export const notYetImplemented = `That is not yet implemented - watch https://github.com/brucemcpherson/gas-fakes for progress`