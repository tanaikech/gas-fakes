import '../../main.js';
import { moveToTempFolder, deleteTempFile } from '../tempfolder.js';
import is from '@sindresorhus/is';
const suffix = "-bruce"

const whichType = (element) => {
  const ts = ["paragraph", "pageBreak", "textRun", "table", "tableRows", "tableCells"]
  const [t] = ts.filter(f => Reflect.has(element, f))
  // if (!t) console.log('skipping element', element)
  return t
}
const report = (doc, what) => {
  const body = doc.body
  // drop the section break
  const children = body.content.slice(1)
  what += ` -children:${children.length}`
  console.log(what)
  let text = '  '

  const childProps = ["elements", "tableRows", "tableCells", "content"]
  const typer = (child, text, spaces = " ") => {
    const type = whichType(child)
    if (type) {
      text += `\n${spaces}-${type} ${child.startIndex}:${child.endIndex}`
      if (type === 'textRun') {
        text += ` ${JSON.stringify(child[type].content)}`
      }
      const key = Reflect.ownKeys(child[type]).find(f => childProps.includes(f))
      let arr = key && child[type][key]
      if (!arr && is.array(child[type])) arr = child[type]

      if (is.array(arr)) {
        //text += spaces
        arr.forEach(f => text = typer(f, text, spaces + "  "))
        //text += ''
      }
    }
    return text
  }
  return children.map(f => typer(f, text)).join("\n")
}

const scl = (doc) => {
  if (!DocumentApp.isFake) {
    const id = doc.getId()
    doc.saveAndClose()
    doc = DocumentApp.openById(id)
  }
  return doc
}

// this is testing the new simplified method
const pbnew = () => {
  let doc = DocumentApp.create("abc")
  const id = doc.getId()
  moveToTempFolder(id, suffix)

  let body = doc.getBody()
  body.appendParagraph('para append')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n1.appended para`))

  body = doc.getBody()
  body.insertParagraph(0, 'para 0')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n2.inserted para 0`))

  body = doc.getBody()
  body.insertParagraph(2, 'para 2 insert')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n3.inserted para 2`))

  body = doc.getBody()
  body.insertParagraph(2, 'para 2 insert')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n4.inserted para 2`))

  body = doc.getBody()
  body.appendPageBreak()
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n5.appended pagebreak to body after para2 insert`))

  body = doc.getBody()
  let c = body.getChild(2)
  c.appendText( 'p2 appended text')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n6.appended text to para 2`))

  body = doc.getBody()
  c = body.getChild(2)
  c.appendPageBreak()
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n7.appended pagebreak to  para 2`))

  body = doc.getBody()
  body.insertParagraph(3, 'para 3 insert')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n8.inserted para 2`))

  body = doc.getBody()
  body.insertPageBreak(3)
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n9.inserted page break in para 3`))

  body = doc.getBody()
  c=body.getChild(3)
  c.appendText('after pagebreak in 3')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n10.inserted text after pagebreak in 3`))

  body = doc.getBody()
  body.appendPageBreak()
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n11.appended pagebreak to body at end`))

  deleteTempFile(id)
}
pbnew()
const pb5 = () => {

  let doc = DocumentApp.create("abc")
  const id = doc.getId()
  moveToTempFolder(id, suffix)

  // cant append an empty table in fake so do this
  let body = doc.getBody()
  body.appendParagraph('foo')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\nappended para`))

  body = doc.getBody()
  body.insertTable(1, [['a', 'b'], ['c', 'd']])
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\ninserted table`))

  deleteTempFile(id)

}

const pb4 = () => {

  let doc = DocumentApp.create("abc")
  const id = doc.getId()
  moveToTempFolder(id, suffix)
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

  doc.getBody().appendParagraph("p3")
  sc()
  console.log(report(Docs.Documents.get(id), `\nappend paragraph p3 to body`))

  const pb1 = doc.getBody().appendPageBreak().copy()
  //doc.getBody().insertPageBreak(4,pb1)
  sc()
  console.log(report(Docs.Documents.get(id), `\nappend pagebreak to body`))

  doc.getBody().insertPageBreak(4, pb1)
  sc()
  console.log(report(Docs.Documents.get(id), `\ninsert pb to body before p3`))

  const table = doc.getBody().appendTable()
  sc()
  console.log(report(Docs.Documents.get(id), `\nappended table`))

  deleteTempFile(id)

}

