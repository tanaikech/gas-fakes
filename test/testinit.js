
// all these imports 
// this is loaded by npm, but is a library on Apps Script side
import { Exports as unitExports } from '@mcpher/unit'


// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import '../main.js'


export const initTests = () => {

  // on node this will have come from the imports that get stripped when mocing to gas
  // on apps script, you'll have a gas only imports file that aliases 
  // the exports from any gas libraries required
  const unit = unitExports.newUnit({
    showErrorsOnly: true
  })



  // apps script can't get from parent without access to the getresource of the parent
  if (unitExports.CodeLocator.isGas) {
    // because a GAS library cant get its caller's code
    unitExports.CodeLocator.setGetResource(ScriptApp.getResource)
    // optional - generally not needed - only necessary if you are using multiple libraries and some file sahre the same ID
    unitExports.CodeLocator.setScriptId(ScriptApp.getScriptId())
  }

  // these are fixtures to test
  // using process.env creates strings, convert to appropriate types as needed
  const fixes = {
    SHARED_FILE_OWNER: process.env.SHARED_FILE_OWNER,
    TEST_BORDERS_ID: process.env.TEST_BORDERS_ID,
    TEST_DOC_WITH_POS_IMAGE_ID: process.env.TEST_DOC_WITH_POS_IMAGE_ID,
    TEST_AIRPORTS_ID: process.env.TEST_AIRPORTS_ID,
    TEST_AIRPORTS_NAME: process.env.TEST_AIRPORTS_NAME,
    MIN_ROOT_PDFS: Number(process.env.MIN_ROOT_PDFS),
    MIN_PDFS: Number(process.env.MIN_PDFS),
    MIN_FOLDERS_ROOT: process.env.MIN_FOLDERS_ROOT,
    TEST_FOLDER_NAME: process.env.TEST_FOLDER_NAME,
    TEST_FOLDER_FILES: Number(process.env.TEST_FOLDER_FILES),
    SKIP_SINGLE_PARENT: process.env.SKIP_SINGLE_PARENT,
    TEST_FOLDER_ID: process.env.TEST_FOLDER_ID,
    TEXT_FILE_NAME: process.env.TEXT_FILE_NAME,
    TEXT_FILE_ID: process.env.TEXT_FILE_ID,
    TEXT_FILE_TYPE: process.env.TEXT_FILE_TYPE,
    TEXT_FILE_CONTENT: process.env.TEXT_FILE_CONTENT,
    BLOB_NAME: process.env.BLOB_NAME,
    BLOB_TYPE: process.env.BLOB_TYPE,
    TEST_SHEET_ID: process.env.TEST_SHEET_ID,
    TEST_SHEET_NAME: process.env.TEST_SHEET_NAME,
    EMAIL: process.env.EMAIL,
    TIMEZONE: process.env.TIMEZONE,
    TEST_LOCALE: process.env.TEST_LOCALE,
    ZIP_TYPE: process.env.ZIP_TYPE,
    KIND_DRIVE: process.env.KIND_DRIVE,
    OWNER_NAME: process.env.OWNER_NAME,
    PUBLIC_SHARE_FILE_ID: process.env.PUBLIC_SHARE_FILE_ID,
    SHARED_FILE_ID: process.env.SHARED_FILE_ID,
    RANDOM_IMAGE: process.env.RANDOM_IMAGE,
    API_URL: process.env.API_URL,
    API_TYPE: process.env.API_TYPE,
    PREFIX: Drive.isFake ? "--f" : "--g",
    PDF_ID: process.env.PDF_ID,
    CLEAN: process.env.CLEAN === '1' || process.env.CLEAN === 'true',
    SCRATCH_VIEWER: process.env.SCRATCH_VIEWER,
    SCRATCH_EDITOR: process.env.SCRATCH_EDITOR,
    SCRATCH_B_VIEWER: process.env.SCRATCH_B_VIEWER,
    SCRATCH_B_EDITOR: process.env.SCRATCH_B_EDITOR
  }
  // double check all is defined in process.env if on node
  if (!unitExports.CodeLocator.isGas) {
    Reflect.ownKeys(fixes).filter(k=>fixes[k]).forEach(k => {
      if (!Reflect.has(process.env, k) && k !== 'PREFIX') throw new Error(`process.env.${k} value is not set`)
    })
  }
  // if we in fake mode, we'll operate in sandbox mode by default
  if (ScriptApp.isFake) {
    ScriptApp.__behavior.sandBoxMode = true;
    console.log('...operating in sandbox mode - only files created in this instance of gas-fakes are accessible')
    ScriptApp.__behavior.cleanup = fixes.CLEAN;
  }
  return {
    unit,
    fixes,
    // because we want to automatically run any functions in this list if in Node
    runnables: ScriptApp.isFake ? process.argv.slice(2) : []
  }

}
