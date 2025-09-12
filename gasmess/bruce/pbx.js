import '../../main.js';
import { moveToTempFolder, deleteTempFile } from '../tempfolder.js';
import { report, scl } from './dreport.js';



const suffix = "-bruce"
const tx1 = () => {
  let doc = DocumentApp.create("abc")
  const id = doc.getId()
  moveToTempFolder(id, suffix)



  const body = doc.getBody();
  const paraText = "p1";

  const appendedPara = body.appendParagraph(paraText);
  const paraToTest = body.getChild(1);
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id, { includeTabsContent: true }), `\n1.empty document`))
  const attributes = paraToTest.getAttributes();

  deleteTempFile(id)
}
tx1()
const tabsa = () => {

  let doc = DocumentApp.create("abc")
  const id = doc.getId()
  moveToTempFolder(id, suffix)

  let body = doc.getBody()
  console.log(body)
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id, { includeTabsContent: true }), `\n1.empty document`))


  deleteTempFile(id)
}

//tabsa()

// this is testing the new simplified method
const pbnew = () => {
  let doc = DocumentApp.create("abc")
  const id = doc.getId()
  moveToTempFolder(id, suffix)
  let body

  body = doc.getBody()
  body.appendListItem('l0a append')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\nl0a.appended list item l0a`))

  body = doc.getBody()
  body.appendListItem('l01b append')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\nl0a.appended list item l0b`))

  body = doc.getBody()
  body.appendTable([['']])
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\nt1.appended table`))

  body = doc.getBody()
  body.appendParagraph('para append')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n1.appended para`))

  body = doc.getBody()
  body.appendListItem('l1 append')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\nl1.appended list item l1`))


  body = doc.getBody()
  body.insertParagraph(0, 'para 0')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n2.inserted para 0`))

  body = doc.getBody()
  body.insertParagraph(2, 'para 2 insert')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n3.inserted para 2`))

  body = doc.getBody()
  body.insertParagraph(2, 'para 2 insert just before table')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n4.inserted para 2`))

  body = doc.getBody()
  body.insertTable(1, [['eboo', 'fbar']])
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\nt4.inserted table at child 1`))

  body = doc.getBody()
  body.appendPageBreak()
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n5.appended pagebreak to body after para2 insert`))

  body = doc.getBody()
  let c = body.getChild(2)
  c.appendText('p2 appended text')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n6.appended text to para 2`))

  body = doc.getBody()
  body.insertTable(3, [['bar', 'foo'], ['barfoo', 'foobar'], ['eboo', 'fbar']])
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\nt6.inserted table at child 3`))

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
  c = body.getChild(3)
  c.appendText('after pagebreak in 3')
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n10.inserted text after pagebreak in 3`))

  body = doc.getBody()
  body.appendPageBreak()
  doc = scl(doc)
  console.log(report(Docs.Documents.get(id), `\n11.appended pagebreak to body at end`))

  deleteTempFile(id)
}





