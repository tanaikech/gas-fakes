import { newFakeGasenum } from "@mcpher/fake-gasenum";

export const AuthorizationStatus = newFakeGasenum({
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED'
  })
export const TriggerSource  = newFakeGasenum( {
    CALENDAR: 'CALENDAR',
    CLOCK: 'CLOCK',
    DOCUMENTS: 'DOCUMENTS',
    FORMS: 'FORMS', 
    SPREADSHEETS: 'SPREADSHEETS'
  })
export const AuthMode = newFakeGasenum( {
  NONE: 'NONE',
  CUSTOM_FUNCTION: 'CUSTOM_FUNCTION',
  LIMITED: 'LIMITED',
  FULL: 'FULL'
})
export const EventType = newFakeGasenum( {  
  CLOCK: 'CLOCK',
  ON_OPEN: 'ON_OPEN',
  ON_EDIT: 'ON_EDIT',
  ON_FORM_SUBMIT: 'ON_FORM_SUBMIT',
  ON_CHANGE: 'ON_CHANGE',
  ON_EVENT_UPDATED: 'ON_EVENT_UPDATED'
})
export const InstallationSource = newFakeGasenum({
  APPS_MARKETPLACE_DOMAIN_ADD_ON: 'APPS_MARKETPLACE_DOMAIN_ADD_ON',
  NONE: 'NONE',
  WEB_STORE_ADD_ON: 'WEB_STORE_ADD_ON'
})

