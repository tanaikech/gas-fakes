import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';
const show = (doc, what = "--") => {
  console.log(what)
  const body = doc.getBody()
  console.log('number of children', body.getNumChildren())
  const children = []
  for (let n = 0; n < body.getNumChildren(); n++) children.push(body.getChild(n))
  console.log('children', children.map(f => ({ type: f.getType().toString(), text: f.getText() })))
  console.log('body get text', body.getText())
  if (!DocumentApp.isFake) {
    doc.saveAndClose()
    doc = DocumentApp.openById(doc.getId())
  }
  const adoc = Docs.Documents.get(doc.getId())
  console.log(JSON.stringify(adoc.body.content.map(f => ({ keys: Object.keys(f).filter(g => !g.startsWith('__')), startIndex: f.startIndex, endIndex: f.endIndex, elements: (f.paragraph?.elements || []).map(g => ({ keys: Object.keys(g).filter(g => !g.startsWith('__')), startIndex: g.startIndex, endIndex: g.endIndex, textRun: g.textRun?.content })) }))))
  return doc
}

let doc = DocumentApp.create("pb");
moveToTempFolder(doc.getId())
doc = show(doc, '\n...empty document')
const p1 = doc.getBody().appendParagraph("p1")
doc = show(doc, 'appended p1')

deleteTempFile(doc.getId())