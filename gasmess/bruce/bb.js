import '../../main.js';
import { readFileSync } from 'fs';

const clean = true
if (ScriptApp.isFake) ScriptApp.__behavior.sandboxMode = true;

const bb = JSON.parse(readFileSync('buildingblocks.json', 'utf8'))
console.log(bb)

const form = FormApp.create('testing bb').setTitle('title bb').setDescription('description bb')
const addGridItem = ({ form, item }) => {
  const gridItem = form.addGridItem()
  return gridItem
}
const items = bb.map(item => {
  // add the questions
  switch (item.questionType.toLowerCase()) {
    case "multiple choice grid":
      return addGridItem({ form, item })
    default:
      throw new Error(`invalid question type ${item.questionType}`)
  }

})

if (!clean) {
  console.log('Form URL (for viewing/sharing): ' + form.getPublishedUrl());
  console.log('Form Editor URL (for editing): ' + form.getEditUrl());
} else {
  if (ScriptApp.isFake) ScriptApp.__behavior.trash();
}