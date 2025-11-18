import '../../../../main.js';
import { readFileSync } from 'fs';
import { FormGenerator } from './FormGenerator.js'

const clean = false
const sandbox = true

const folderId = '1ypdMgsdRyb5ggJ3oX2UdWNx0k2eSdCnV'
const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G'
const templateId = '1RGUYVxCHlYw4aG1jJM2YJ8TLi8lnKaDTQ9jcvGhGAeE'
const formName = "Vegetable patch"

const main = () => {
  const {rosters} = JSON.parse(readFileSync('rosters.json', 'utf8'))
  const {templates} = JSON.parse(readFileSync('templates.json', 'utf8'))
  const roster = rosters.vegetables
  const rules = DriveApp.getFileById (rulesId).getBlob().getDataAsString()
  const {blocks} = JSON.parse(rules)
  // copy the form, and fill in the template
  const formg = new FormGenerator({ formName, templateId, templates, blocks, folderId, roster }).create()
  console.log ('using template', formg.inputForm.getEditUrl())
  // add the building blocks
  formg.addBlocks()
  return formg.form
}

if (ScriptApp.isFake && sandbox) {
  const behavior = ScriptApp.__behavior
  behavior.sandboxMode = true
  behavior.addIdWhitelist(behavior.newIdWhitelistItem(rulesId));
  behavior.addIdWhitelist(behavior.newIdWhitelistItem(folderId));
  behavior.addIdWhitelist(behavior.newIdWhitelistItem(templateId));
}

const form = main()

if (!clean) {
  console.log('Form URL (for viewing/sharing): ' + form.getPublishedUrl());
  console.log('Form Editor URL (for editing): ' + form.getEditUrl());
} else {
  if (ScriptApp.isFake) ScriptApp.__behavior.trash();
}

