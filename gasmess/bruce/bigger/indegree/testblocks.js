import '../../../../main.js';
import { readFileSync } from 'fs';
import { FormGenerator } from './FormGenerator.js'

const clean = false
const sandbox = true
const folderId = '1ypdMgsdRyb5ggJ3oX2UdWNx0k2eSdCnV'

const main = () => {
  const {blocks} = JSON.parse(readFileSync('template-rules.json', 'utf8'))
  const {rosters} = JSON.parse(readFileSync('rosters.json', 'utf8'))
  const {templates} = JSON.parse(readFileSync('templates.json', 'utf8'))
  const template = templates.test
  const roster = rosters.vegetables

  // copy the form, and fill in the template
  const formg = new FormGenerator({ template, blocks, folderId, roster }).create()
  console.log ('using template', formg.inputForm.getEditUrl())
  // add the building blocks
  formg.addBlocks()
  return formg.form
}

if (ScriptApp.isFake && sandbox) {
  const behavior = ScriptApp.__behavior
  behavior.sandboxMode = true
  behavior.addIdWhitelist(behavior.newIdWhitelistItem(folderId));
  behavior.addIdWhitelist(behavior.newIdWhitelistItem("1RGUYVxCHlYw4aG1jJM2YJ8TLi8lnKaDTQ9jcvGhGAeE"));
}

const form = main()

if (!clean) {
  console.log('Form URL (for viewing/sharing): ' + form.getPublishedUrl());
  console.log('Form Editor URL (for editing): ' + form.getEditUrl());
} else {
  if (ScriptApp.isFake) ScriptApp.__behavior.trash();
}

