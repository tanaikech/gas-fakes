import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';

const whichType = (element) => {
  const ts = ["paragraph", "pageBreak", "textRun"]
  const [t] = ts.filter(f => Reflect.has(element, f))
  if (!t) console.log('skipping element', element)
  return t
}
const report = (doc, what) => {
  const body = doc.body
  // drop the section break
  const children = body.content.slice(1)
  what += ` -children:${children.length}`
  console.log(what)
  let text = '  '
  const typer = (child, text) => {
    const type = whichType(child)
    if (type) {
      text += ` -type:${type} ${child.startIndex}:${child.endIndex}`
      if (type === 'textRun') {
        text += ` -text:${JSON.stringify(child[type].content)}`
      }
      if (Reflect.has(child[type], "elements")) {
        text += ` (`
        child[type].elements.forEach(f => text = typer(f, text))
        text += ')'
      }
    }
    return text
  }
  return children.map(f => typer(f, text)).join("\n")
}
const pb4 = () => {

  let doc = DocumentApp.create("abc")
  const id = doc.getId()
  moveToTempFolder(id)
  const sc = () => {
    if (!DocumentApp.isFake) {
      doc.saveAndClose()
      doc = DocumentApp.openById(id)
    }
  }

  sc()
  console.log(report(Docs.Documents.get(id), `\nEmpty Document`))

  doc.getBody().appendParagraph("p1")
  sc()
  console.log(report(Docs.Documents.get(id), `\nAppend p1 to empty doc`))

  doc.getBody().appendParagraph("p2")
  sc()
  console.log(report(Docs.Documents.get(id), `\nAppend p2 after p1`))

  doc.getBody().insertParagraph(2, "p1a")
  sc()
  console.log(report(Docs.Documents.get(id), `\ninsert para between 1 and 2`))

  doc.getBody().appendPageBreak()
  sc()
  console.log(report(Docs.Documents.get(id), `\nappend page break to end of document`))

  const p1a = doc.getBody().getChild(2)
  p1a.appendPageBreak()
  sc()
  console.log(report(Docs.Documents.get(id), `\nappend page break to end of of para 1a`))

  deleteTempFile(id)

}

pb4()