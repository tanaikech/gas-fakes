import '../../main.js';
import { moveToTempFolder, deleteTempFile } from './tempfolder.js';
const doc = DocumentApp.create("pb");
moveToTempFolder(doc.getId())
const body = doc.getBody()
body.appendParagraph("p1")
body.appendPageBreak()
console.log(body.getNumChildren())
console.log(body.getText())
doc.saveAndClose()
const adoc = Docs.Documents.get(doc.getId())
console.log(JSON.stringify(adoc.body.content.map(f => ({ keys: Object.keys(f).filter(g => !g.startsWith('__')), startIndex: f.startIndex, endIndex: f.endIndex, elements: (f.paragraph?.elements || []).map(g => ({ keys: Object.keys(g).filter(g => !g.startsWith('__')), startIndex: g.startIndex, endIndex: g.endIndex, textRun: g.textRun?.content })) }))))

deleteTempFile(doc.getId())