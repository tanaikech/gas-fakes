import {Auth} from '../../support/auth.js'
// these are the default models to match live apps script
export const storeModels = {
    SCRIPT: {
        scriptId: ScriptApp.getScriptId()
    },
    USER: {
        scriptId: ScriptApp.getScriptId(),
        userId: Session.getEffectiveUser().getEmail()
    },
    DOCUMENT: {
        scriptId: ScriptApp.getScriptId(),
        documentId: Auth.getDocumentId
    }
}

