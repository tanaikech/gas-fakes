import colors from 'yoctocolors'
import './services/scriptapp/app.js'

import {default as pf } from '../package.json' with { type: 'json' };
console.log (`You are using ${colors.blueBright(pf.name)} package version ${colors.greenBright(pf.version)}`)
ScriptApp.__gasFakesVersion = pf.version
import './services/driveapp/app.js'
import './services/logger/app.js'
import './services/urlfetchapp/app.js'
import './services/utilities/app.js'
import './services/spreadsheetapp/app.js'
import './services/stores/app.js'
import './services/gmailapp/app.js'
import './services/session/app.js'
import './services/advdrive/app.js'
import './services/advsheets/app.js'
import './services/advdocs/app.js'
import './services/advgmail/app.js'
import './services/advslides/app.js'
import './services/documentapp/app.js'
import './services/advforms/app.js'
import './services/formapp/app.js'
import './services/slidesapp/app.js'
