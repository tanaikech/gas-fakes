import '@mcpher/gas-fakes';
import { readFileSync } from 'fs';
import { FormGenerator } from './FormGenerator.js'

const clean = false
const sandbox = true

const folderId = '1ypdMgsdRyb5ggJ3oX2UdWNx0k2eSdCnV'
const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G'
const templateId = '1RGUYVxCHlYw4aG1jJM2YJ8TLi8lnKaDTQ9jcvGhGAeE'
const formName = "Vegetable patch"
const rostersId = "1ja0P4WHkMmU0fjawA5egYqTFBSmB0uFX"
const formTitle = "Vegetable questions 2"
const formDescription ="A survey about vegetables 2"
const getDriveObject = (id) => {
  return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString())
}
const process = () => {
  const { rosters } = getDriveObject(rostersId)
  const { blocks } = getDriveObject(rulesId)
  const roster = rosters.vegetables
  // copy the form, and fill in the template
  const formg = new FormGenerator({ formTitle, formDescription, formName, templateId, blocks, folderId, roster }).create()
  console.log('using template', formg.inputForm.getEditUrl())
  // add the building blocks
  formg.addBlocks()
  return formg.form
}

const main = () => {
  if (ScriptApp.isFake && sandbox) {
    const behavior = ScriptApp.__behavior
    behavior.sandboxMode = true
    const wl = [
      rulesId, folderId, templateId, rostersId
    ]
    wl.forEach(f => {
      behavior.addIdWhitelist(behavior.newIdWhitelistItem(f));
      console.log(`...added ${f} to whitelist readonly`)
    })

  }
  const form = process()
  if (!clean) {
    console.log('Form URL (for viewing/sharing): ' + form.getPublishedUrl());
    console.log('Form Editor URL (for editing): ' + form.getEditUrl());
  } else {
    if (ScriptApp.isFake) ScriptApp.__behavior.trash();
  }
}

if (ScriptApp.isFake) {
  main()
}




