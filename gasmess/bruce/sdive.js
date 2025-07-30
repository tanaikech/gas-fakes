import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';

const nr1 = () => {
  const req = Docs.newDocument().setTitle("abc");
  const doc = Docs.Documents.create(req);
  moveToTempFolder(doc.documentId)

  const body = doc.body
  const content = body.content
  const [s1, p1] = content
  const { paragraph } = p1
  console.log('1st item end index', s1.endIndex) // this is a section break
  /*
  2nd paragraph index { paragraph: 
   { paragraphStyle: { namedStyleType: 'NORMAL_TEXT', direction: 'LEFT_TO_RIGHT' },
     elements: [ [Object] ] },
  endIndex: 2,
  startIndex: 1 }
  */

  console.log('2nd element index is a paragraph', p1.startIndex, p1.endIndex) // this is a paragraph 1:2
  const [t1] = paragraph.elements
  const { textRun } = t1
  console.log('2nd elementaph textrun', t1.startIndex, t1.endIndex, textRun.content === "\n") // this is a textrun 1:2
  console.log(doc)
  
  // try a prepend without \n
  // this inserts the text before the \n of the existing paragraph
  // indexes become 1:3, content becomes A\n
  // const A = "A"
  // const insertIndex = p1.endIndex -1
  // still only 2 children

  // try an append without \n
  // this inserts the text after the \n of the existing paragraph
  // we cant do this - Index 2 must be less than the end index of the referenced segment, 2.
  // const A = "A"
  // const insertIndex = p1.endIndex 

  // initially we have content of \n we can addanything after the \n so the insertion point must always be
  // endindex -1
  const insertText = Docs.newInsertTextRequest().setLocation(Docs.newLocation().setIndex(insertIndex)).setText(A)
  Docs.Documents.batchUpdate({requests: [{insertText}]}, doc.documentId)

  const doc2 = Docs.Documents.get (doc.documentId)

  
  console.log (doc2)
  deleteTempFile(doc.documentId)
}

nr1()