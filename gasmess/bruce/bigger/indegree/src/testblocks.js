import '@mcpher/gas-fakes';

import { FormGenerator } from './FormGenerator.js'
import { RulesValidator } from './RulesValidator.js';
const clean = false
const sandbox = true

const folderId = '1ypdMgsdRyb5ggJ3oX2UdWNx0k2eSdCnV'
const rulesId = '11L29nlZakItr2mNJbOeOJPJ377BxeJ8G'
const templateId = '1RGUYVxCHlYw4aG1jJM2YJ8TLi8lnKaDTQ9jcvGhGAeE'
const formName = "Vegetable patch post"
const rostersId = "1ja0P4WHkMmU0fjawA5egYqTFBSmB0uFX"
const formTitle = "Vegetable questions 2 post"
const formDescription = "A survey about vegetables post"
const ITEM_MAP_KEY = 'formItemMap'
const rosterName = 'vegetables'

const getDriveObject = (id) => {
  return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString())
}

const process = () => {
  const rostersObject = getDriveObject(rostersId)
  const { rosters } = rostersObject
  const rulesObject = getDriveObject(rulesId)

  // Validate Rules
  const validator = new RulesValidator();
  const validationResult = validator.validate(rulesObject);

  if (!validationResult.valid) {
    console.error('❌ Rules validation failed:');
    validationResult.errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('Rules validation failed. See errors above.');
  } else {
    console.log('✅ Rules validation passed.');
    if (validationResult.warnings.length > 0) {
      console.warn('⚠️ Rules validation warnings:');
      validationResult.warnings.forEach(warn => console.warn(`  - ${warn}`));
    }
  }

  const { blocks, labels } = rulesObject
  const roster = rosters[rosterName].members
  if (!roster) {
    console.error(`Roster ${rosterName} not found in rosters object`)
    return
  }
  // copy the form, and fill in the template
  const formDetails = {
    formTitle,
    formDescription,
    formName
  }

  const formg = new FormGenerator({
    formDetails,
    templateId,
    blocks,
    folderId,
    roster,
    itemMapKey: ITEM_MAP_KEY,
    rosterData: rosters[rosterName]
  }).create()
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
