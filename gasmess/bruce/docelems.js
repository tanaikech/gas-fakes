import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';

// put all this stuff in a temp folder for easy deletion
const doc = DocumentApp.create("--gasmess-doc")
moveToTempFolder(doc.getId())

// th
const body = doc.getBody()
// at this point body has the reponse in body.__document__doc property
// forgetting about tabs for the moment
// the actual api representation of the body is in body.__document__doc.body
// the content in body.__document__doc.body.content  which is an array of elements

// in an empty document
// the first is
// {endIndex: 1, sectionBreak: {…}}
// body.__document.__doc.body.content[0].sectionBreak

// body.__document.__doc.body.content[0].sectionBreak.sectionStyle
// {columnSeparatorStyle: 'NONE', contentDirection: 'LEFT_TO_RIGHT', sectionType: 'CONTINUOUS'}

// the second is 
// body.__document.__doc.body.content[1]
// {startIndex: 1, endIndex: 2, paragraph: {…}}
// body.__document.__doc.body.content[1].paragraph
// {elements: Array(1), paragraphStyle: {…}}
// body.__document.__doc.body.content[1].paragraph.paragraphStyle
// {namedStyleType: 'NORMAL_TEXT', direction: 'LEFT_TO_RIGHT'}
// body.__document.__doc.body.content[1].paragraph.elements[0]
// {startIndex: 1, endIndex: 2, textRun: {…}}
// body.__document.__doc.body.content[1].paragraph.elements[0]
// {content: '\n', textStyle: {…}}
// body.__document.__doc.body.content[1].paragraph.elements[0].textRun.textStyle
// {}

// so we can deduce so far
// a missing startIndex = 0
// the object other than start and endindex in defines the element type
// lets implement
// body.getNumChildren
console.log (body.getNumChildren())
deleteTempFile(doc.getId())

