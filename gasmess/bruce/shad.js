import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';

// put all this stuff in a temp folder for easy deletion
const doc = DocumentApp.create("--gasmess-doc")
moveToTempFolder(doc.getId())

const shadowBody = doc.__shadowDocument.shadowBody
const children = shadowBody.children
const child = shadowBody.getChild(0)
const childIndex = shadowBody.getChildIndex(child)

const body = doc.getBody()
const bchildren = body.getChildren()
const bchild = body.getChild(0)

// this tests startIndex matching which is probably the wrong test
const bchildIndex = body.getChildIndex(bchild)
deleteTempFile(doc.getId())


